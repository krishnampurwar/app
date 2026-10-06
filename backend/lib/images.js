/**
 * Image generation — multiple models behind one call, with automatic fallback.
 *
 * gpt-image-1 and dall-e-3 go through the OpenAI-compatible proxy. Google Imagen needs a
 * real GEMINI_API_KEY, so it is reported unavailable until the owner supplies one.
 * Raw PNGs are ~2 MB, so we downscale + JPEG-encode before returning a data URL.
 */

import sharp from "sharp";

const BASE = (process.env.LLM_BASE_URL || "https://integrations.emergentagent.com/llm").replace(/\/$/, "");
const KEY = process.env.LLM_API_KEY || process.env.EMERGENT_LLM_KEY || "";

export const GPT_IMAGE = "gpt-image-1";
export const DALLE_3 = "dall-e-3";
export const IMAGEN = "imagen-4.0-fast-generate-001";

const ownKey = (name) => {
  const v = (process.env[name] || "").trim();
  return v.startsWith("sk-emergent-") ? "" : v;
};

export function availableModels() {
  const hasGemini = Boolean(ownKey("GEMINI_API_KEY"));
  const hasOpenai = Boolean(ownKey("OPENAI_API_KEY"));
  return [
    { id: GPT_IMAGE, label: "GPT Image 1", provider: "openai", note: "Best realism for garden concepts", available: true },
    {
      id: DALLE_3,
      label: "DALL·E 3",
      provider: "openai",
      note: hasOpenai ? "Painterly, dramatic compositions" : "Needs your own OPENAI_API_KEY in backend/.env",
      available: hasOpenai,
    },
    {
      id: IMAGEN,
      label: "Google Imagen 4 Fast",
      provider: "gemini",
      note: hasGemini ? "Fastest renders" : "Needs your own GEMINI_API_KEY in backend/.env",
      available: hasGemini,
    },
  ];
}

function modelOrder(preferred) {
  const usable = availableModels().filter((m) => m.available).map((m) => m.id);
  if (preferred && usable.includes(preferred)) {
    return [preferred, ...usable.filter((id) => id !== preferred)];
  }
  return usable;
}

async function compress(buffer) {
  try {
    const out = await sharp(buffer)
      .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, progressive: true })
      .toBuffer();
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch (err) {
    console.warn("[images] compress failed, returning raw:", err.message);
    return `data:image/png;base64,${buffer.toString("base64")}`;
  }
}

async function generateOpenai(prompt, model) {
  // dall-e-3 is not enabled on the shared proxy — it needs the owner's own OpenAI key.
  const key = model === DALLE_3 ? ownKey("OPENAI_API_KEY") : KEY;
  const base = model === DALLE_3 && ownKey("OPENAI_API_KEY") ? "https://api.openai.com/v1" : BASE;
  if (!key) throw new Error(`${model} needs OPENAI_API_KEY`);

  const body = { model, prompt, n: 1, size: "1024x1024" };
  if (model === GPT_IMAGE) body.quality = "low";

  const res = await fetch(`${base}/images/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${model} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (b64) return Buffer.from(b64, "base64");
  const url = data?.data?.[0]?.url;
  if (url) return Buffer.from(await (await fetch(url)).arrayBuffer());
  throw new Error("no image returned");
}

async function generateGemini(prompt) {
  const key = ownKey("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY not configured");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN}:predict?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1 } }),
    },
  );
  if (!res.ok) throw new Error(`imagen ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("no image returned");
  return Buffer.from(b64, "base64");
}

/** Render one image. Returns { imageUrl, model }. Throws only if every model fails. */
export async function generateImage(prompt, preferred) {
  const errors = [];
  for (const model of modelOrder(preferred)) {
    try {
      const raw = model === IMAGEN ? await generateGemini(prompt) : await generateOpenai(prompt, model);
      return { imageUrl: await compress(raw), model };
    } catch (err) {
      errors.push(`${model}: ${err.message}`);
      console.warn(`[images] ${model} failed: ${err.message}`);
    }
  }
  throw new Error(`all image models failed — ${errors.join(" | ")}`);
}

/** Degrades to empty strings instead of throwing — for optional concept imagery. */
export async function generateImageSafe(prompt, preferred) {
  try {
    return await generateImage(prompt, preferred);
  } catch (err) {
    console.warn("[images] unavailable:", err.message);
    return { imageUrl: "", model: "" };
  }
}

export function gardenPrompt(space, style, description) {
  return (
    `Photorealistic architectural photograph of a professionally landscaped ${space} ` +
    `in an upscale Indian metro home, ${style} style. ${description} ` +
    "Healthy thriving plants, designer planters, natural daylight, wide-angle lens, " +
    "high detail, magazine-quality landscape photography. No people, no text, no watermarks."
  );
}
