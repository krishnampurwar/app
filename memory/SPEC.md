# AJ Heaven's Harvest Nursery — App Spec

## What it is
Multi-page nursery + landscaping website for Gurgaon with 6 AI lead-gen tools. **Stateless
architecture**: AI logic lives on a Node.js backend, all content is static JSON on the frontend,
and there is **no database** — every lead is emailed to the owner instead of stored.

## Architecture (changed from the original FastAPI+Mongo build)
```
frontend/ (Vite + React 19 + TS)          backend/ (Node 20 + Express, stateless)
  public/data/*.json  ← all content          server.js        all routes under /api
  src/lib/content.ts  ← fetches it           lib/ai.js        OpenAI-compatible chat/vision/JSON
  src/lib/api.ts      ← AI + lead calls      lib/images.js    image models + fallback + sharp compress
                                             lib/email.js     lead email + guardrail gate
                                             lib/contact.js   compulsory name/phone validation
                                             routes/ai.js     6 AI endpoints
                                             routes/leads.js  lead email + destination
```
No MongoDB, no motor/pymongo, no Python. `supervisord.conf` runs `node --watch server.js`.

## Content (static JSON, fetched at runtime from /data/)
`plants.json` (24), `services.json` (8), `locations.json` (7, AI-written copy), `projects.json` (6),
`plans.json` (3). Every record has a stable string `id` (slug-based) — required for React keys.
Shop filtering/search is client-side in `getFilteredPlants()`.

## Pages (frontend/src/pages, React Router in App.tsx)
- `/` Home · `/shop` catalog + filters · `/services` + `/services/:slug` (8)
- `/locations` + `/locations/:slug` (7 Gurgaon areas) · `/maintenance` · `/case-studies` · `/contact`
- `/admin` — no lead table any more; shows the lead-email destination, delivery status and which
  forms trigger emails (nothing is stored, so there is nothing to list)
- AI tools: `/ai-consultant` (SSE streaming, photo upload, history sent from client since the
  backend is stateless), `/ai-landscape-designer`, `/ai-visualizer`, `/ai-plant-doctor`,
  `/ai-plant-finder`, `/ai-proposal-generator`

## API (all under /api)
- `GET /health`, `GET /` — liveness
- `POST /ai/ask-aj` (SSE: `{delta}` / `{done}` / `{error}`), `/ai/plant-doctor`,
  `/ai/landscape-designer`, `/ai/plant-finder`, `/ai/proposal`, `/ai/visualize`,
  `/ai/regenerate-concept-image`; `GET /ai/image-models`
- `POST /leads` → emails the owner, returns `{ok, delivered, tool}`; `GET /leads/destination`
- No admin/catalog endpoints — content is static, leads are not stored.

## Leads → email only
Every submission is emailed to **krishnam@konverzions.com** (`LEAD_EMAIL` in backend/.env) with
**name, phone (tap-to-call) and which tool was used**, timestamped IST. `lib/email.js` posts to the
managed email proxy with `from_name` from `EMAIL_FROM_NAME`, runs `assertSafeEmail()` on every send
(no forms/inputs, no non-https links, no credential asks), and the recipient is server-side config —
never caller input, so it is not an open relay. Sending is fire-and-forget (`queueLeadEmail`) so a
mail hiccup never breaks a visitor's AI result; failures are logged with the lead details.

## Compulsory contact details
Name + phone required on all AI tools and forms. Backend: `lib/contact.js` `requireContact`
middleware → **422 with field errors before any AI call** (no credits spent on anonymous requests).
Frontend: `components/ContactFields.tsx` → asterisks, inline errors, submit blocked. Ask AJ chat is
exempt (its "Book a visit" dialog uses LeadForm).

## AI image generation
`gpt-image-1` works on the shared proxy (default). `dall-e-3` needs the owner's own `OPENAI_API_KEY`;
`imagen-4.0-fast` needs `GEMINI_API_KEY` — both reported `available:false` until set. Auto-fallback
to the next available model. Output downscaled to 1024px JPEG via sharp (~2 MB → ~150 KB).

## Env (backend/.env)
`LLM_BASE_URL` (default = managed proxy), `LLM_API_KEY`/`EMERGENT_LLM_KEY`, `AI_TEXT_MODEL`
(gpt-5.4), `EMERGENT_EMAIL_KEY`, `EMAIL_FROM_NAME`, `EMAIL_REPLY_TO` (optional), `LEAD_EMAIL`,
`CORS_ORIGINS`, `PORT`, optional `OPENAI_API_KEY` / `GEMINI_API_KEY`.
**Self-hosting swap:** point `LLM_BASE_URL` at `https://api.openai.com/v1` + your own `LLM_API_KEY`;
replace the email block with your own provider. No code changes needed.

## Design
Lora (headings) + DM Sans (body) + IBM Plex Mono (overlines); cream #F8F9F5 / forest #14261C /
primary #206D43 / gold accent; glass hero panels; `no-print`/`print-area` CSS for proposals.
WhatsApp CTAs: +91 93362 39079 (wa.me/919336239079).
