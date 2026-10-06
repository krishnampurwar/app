/**
 * LLM helpers — OpenAI-compatible calls through the configured proxy.
 *
 * Self-hosting swap: point LLM_BASE_URL at https://api.openai.com/v1 and put your own
 * OpenAI key in LLM_API_KEY. Nothing else in the codebase changes.
 */

const BASE = (process.env.LLM_BASE_URL || "https://integrations.emergentagent.com/llm").replace(/\/$/, "");
const KEY = process.env.LLM_API_KEY || process.env.EMERGENT_LLM_KEY || "";
export const TEXT_MODEL = process.env.AI_TEXT_MODEL || "gpt-5.4";

if (!KEY) console.warn("[ai] No LLM_API_KEY / EMERGENT_LLM_KEY set — AI routes will fail.");

export class AiError extends Error {}

async function post(path, body, { timeout = 180000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new AiError(`upstream ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return res;
  } catch (err) {
    if (err.name === "AbortError") throw new AiError("the AI request timed out");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Strip a data-URL prefix so we always hand the API a clean data URL for vision. */
function asImageUrl(b64) {
  const raw = String(b64 || "").trim();
  if (!raw) return null;
  return raw.startsWith("data:") ? raw : `data:image/jpeg;base64,${raw}`;
}

function userContent(text, images = []) {
  const urls = images.map(asImageUrl).filter(Boolean);
  if (!urls.length) return text;
  return [
    { type: "text", text },
    ...urls.map((url) => ({ type: "image_url", image_url: { url } })),
  ];
}

/** Plain completion. */
export async function complete(system, prompt, images = []) {
  const res = await post("/chat/completions", {
    model: TEXT_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userContent(prompt, images) },
    ],
  });
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

/** Streaming completion — yields text deltas. */
export async function* streamComplete(system, history) {
  const res = await post("/chat/completions", {
    model: TEXT_MODEL,
    stream: true,
    messages: [{ role: "system", content: system }, ...history],
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* partial JSON across chunks — the next chunk completes it */
      }
    }
  }
}

/** Pull the first JSON object/array out of a model reply (tolerates fences and prose). */
export function extractJson(text) {
  let body = String(text || "").trim();
  const fence = body.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) body = fence[1].trim();
  try {
    return JSON.parse(body);
  } catch {
    /* fall through to brace scanning */
  }
  for (const [open, close] of [["{", "}"], ["[", "]"]]) {
    const start = body.indexOf(open);
    if (start === -1) continue;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < body.length; i += 1) {
      const ch = body[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === open) depth += 1;
      else if (ch === close) {
        depth -= 1;
        if (depth === 0) {
          try {
            return JSON.parse(body.slice(start, i + 1));
          } catch {
            break;
          }
        }
      }
    }
  }
  return null;
}

export async function completeJson(system, prompt, images = []) {
  const data = extractJson(await complete(system, prompt, images));
  if (!data) throw new AiError("model did not return valid JSON");
  return data;
}
