"""Image generation service — multiple AI models behind one call, with auto-fallback.

Model availability:
- gpt-image-1 / dall-e-3  → OpenAI via the Emergent universal key (EMERGENT_LLM_KEY). Always available.
- imagen-4.0-fast         → Gemini, needs a SEPARATE user-supplied GEMINI_API_KEY; the universal
                            key is NOT valid for Gemini image generation (the API rejects it).
Generated PNGs come back ~2 MB; we downscale + JPEG-encode before returning a data URL so the
browser payload stays small.
"""

import asyncio
import base64
import io
import logging
import os
from dataclasses import dataclass

logger = logging.getLogger(__name__)

GPT_IMAGE = "gpt-image-1"
DALLE_3 = "dall-e-3"
IMAGEN_FAST = "imagen-4.0-fast-generate-001"


@dataclass
class ImageModel:
    id: str
    label: str
    provider: str
    note: str
    available: bool


def gemini_key() -> str:
    """A real Gemini key, if the owner added one. The universal key does not work for Imagen."""
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    return "" if key.startswith("sk-emergent-") else key


def openai_key() -> str:
    """A real OpenAI key, if the owner added one — needed for DALL·E 3 (not on the universal key)."""
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    return "" if key.startswith("sk-emergent-") else key


def emergent_key() -> str:
    key = os.environ.get("EMERGENT_LLM_KEY", "").strip()
    if not key:
        raise RuntimeError("EMERGENT_LLM_KEY missing in backend/.env")
    return key


def available_models() -> list[ImageModel]:
    """Verified against the Emergent universal key: gpt-image-1 is proxied and works; DALL·E 3 and
    Imagen are rejected by the proxy, so each needs its provider's own key before we offer it."""
    has_gemini = bool(gemini_key())
    has_openai = bool(openai_key())
    return [
        ImageModel(GPT_IMAGE, "GPT Image 1", "openai", "Best realism for garden concepts", True),
        ImageModel(
            DALLE_3,
            "DALL·E 3",
            "openai",
            "Painterly, dramatic compositions" if has_openai else "Needs your own OPENAI_API_KEY in backend/.env",
            has_openai,
        ),
        ImageModel(
            IMAGEN_FAST,
            "Google Imagen 4 Fast",
            "gemini",
            "Fastest renders" if has_gemini else "Needs your own GEMINI_API_KEY in backend/.env",
            has_gemini,
        ),
    ]


def model_order(preferred: str | None) -> list[str]:
    """Preferred model first, then the remaining available ones as fallbacks."""
    usable = [m.id for m in available_models() if m.available]
    if preferred and preferred in usable:
        return [preferred] + [m for m in usable if m != preferred]
    return usable


def compress(raw: bytes, max_edge: int = 1024, quality: int = 82) -> str:
    """PNG bytes -> compact JPEG data URL."""
    try:
        from PIL import Image

        img = Image.open(io.BytesIO(raw))
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        scale = min(1.0, max_edge / max(img.size))
        if scale < 1.0:
            img = img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    except Exception as exc:  # never fail a render over compression
        logger.warning("compress failed (%s) — returning raw PNG", exc)
        return "data:image/png;base64," + base64.b64encode(raw).decode()


async def _generate_openai(prompt: str, model: str) -> bytes:
    from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

    # gpt-image-1 rides the Emergent proxy; DALL·E 3 is only reachable with the owner's own OpenAI key.
    key = openai_key() if model == DALLE_3 else emergent_key()
    if not key:
        raise RuntimeError(f"{model} needs OPENAI_API_KEY")
    gen = OpenAIImageGeneration(api_key=key)
    images = await gen.generate_images(prompt=prompt, model=model, number_of_images=1, quality="low")
    if not images:
        raise RuntimeError("no image returned")
    return images[0]


async def _generate_gemini(prompt: str) -> bytes:
    from emergentintegrations.llm.gemeni.image_generation import GeminiImageGeneration

    key = gemini_key()
    if not key:
        raise RuntimeError("GEMINI_API_KEY not configured")
    gen = GeminiImageGeneration(api_key=key)
    images = await gen.generate_images(prompt=prompt, model=IMAGEN_FAST, number_of_images=1)
    if not images:
        raise RuntimeError("no image returned")
    return images[0]


async def generate_image(prompt: str, preferred: str | None = None, timeout: float = 120.0) -> tuple[str, str]:
    """Render one image. Returns (data_url, model_id_used). Raises only if every model fails."""
    errors: list[str] = []
    for model in model_order(preferred):
        try:
            coro = _generate_gemini(prompt) if model == IMAGEN_FAST else _generate_openai(prompt, model)
            raw = await asyncio.wait_for(coro, timeout=timeout)
            return compress(raw), model
        except Exception as exc:
            errors.append(f"{model}: {exc}")
            logger.warning("image model %s failed: %s", model, exc)
    raise RuntimeError("all image models failed — " + " | ".join(errors))


async def generate_image_safe(prompt: str, preferred: str | None = None) -> tuple[str, str]:
    """Same as generate_image but degrades to ('', '') instead of raising — for optional imagery."""
    try:
        return await generate_image(prompt, preferred)
    except Exception as exc:
        logger.warning("image generation unavailable: %s", exc)
        return "", ""


def garden_prompt(space: str, style: str, description: str) -> str:
    """Shared prompt recipe so every rendered concept looks like the same studio shot it."""
    return (
        f"Photorealistic architectural photograph of a professionally landscaped {space} "
        f"in an upscale Indian metro home, {style} style. {description} "
        "Healthy thriving plants, designer planters, natural daylight, wide-angle lens, "
        "high detail, magazine-quality landscape photography. No people, no text, no watermarks."
    )
