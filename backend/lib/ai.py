"""Shared LLM helpers — Emergent universal key via emergentintegrations.

Every AI endpoint builds its own LlmChat (per session) and talks JSON via
complete_json(); the streaming chat uses stream_message() directly in its router.
"""

import json
import os
import re
import uuid

from emergentintegrations.llm.chat import ImageContent, LlmChat, UserMessage

PROVIDER = "openai"
MODEL = os.environ.get("AI_MODEL", "gpt-5.4")


def api_key() -> str:
    key = os.environ.get("EMERGENT_LLM_KEY", "")
    if not key:
        raise RuntimeError("EMERGENT_LLM_KEY missing in backend/.env")
    return key


def make_chat(session_id: str, system_message: str) -> LlmChat:
    return (
        LlmChat(api_key=api_key(), session_id=session_id, system_message=system_message)
        .with_model(PROVIDER, MODEL)
    )


def new_session(prefix: str = "tool") -> str:
    return f"{prefix}-{uuid.uuid4()}"


def clean_b64(data_url: str) -> str:
    """Accept a data URL or bare base64; return bare base64."""
    if data_url.startswith("data:"):
        return data_url.partition("base64,")[2].strip()
    return data_url.strip()


def extract_json(text: str):
    """Parse the first JSON object/array in an LLM reply (tolerates fences and prose)."""
    text = (text or "").strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        text = fence.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    for opener, closer in (("{", "}"), ("[", "]")):
        start = text.find(opener)
        if start == -1:
            continue
        depth = 0
        in_str = False
        escape = False
        for i in range(start, len(text)):
            ch = text[i]
            if in_str:
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == '"':
                    in_str = False
                continue
            if ch == '"':
                in_str = True
            elif ch == opener:
                depth += 1
            elif ch == closer:
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[start : i + 1])
                    except json.JSONDecodeError:
                        break
    return None


async def complete(session_id: str, system_message: str, prompt: str, images_b64: list[str] | None = None) -> str:
    chat = make_chat(session_id, system_message)
    kwargs: dict = {"text": prompt}
    if images_b64:
        kwargs["file_contents"] = [ImageContent(image_base64=clean_b64(b)) for b in images_b64]
    return await chat.send_message(UserMessage(**kwargs))


async def complete_json(session_id: str, system_message: str, prompt: str, images_b64: list[str] | None = None):
    text = await complete(session_id, system_message, prompt, images_b64)
    data = extract_json(text)
    if data is None:
        raise ValueError("model did not return valid JSON")
    return data
