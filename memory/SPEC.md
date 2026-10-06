# AJ Heaven's Harvest Nursery — App Spec

## What it is
Multi-page nursery + landscaping website for Gurgaon with 5 AI lead-gen tools, lead CRM, and location SEO pages.

## Pages (frontend/src/pages, React Router in App.tsx)
- `/` Home — hero + AI suite + services + plants + plans + locations + case studies
- `/shop` — plant catalog (search, category/sunlight/care/placement filters), detail dialog, WhatsApp buy CTAs
- `/services`, `/services/:slug` — 8 service pillars (garden-maintenance, plant-nursery, landscaping, rooftop-gardens, vertical-gardening, plants-seller, indoor-landscaping, outdoor-landscaping)
- `/locations`, `/locations/:slug` — 7 Gurgaon area pages with AI-generated unique content (seeded)
- `/maintenance` — 3 subscription plans, subscribe via lead dialog
- `/case-studies`, `/contact`, `/admin`
- `/ai-consultant` — Ask AJ: SSE streaming chat (POST /api/ai/ask-aj, raw fetch via apiStreamPost), optional photo upload
- `/ai-landscape-designer` — photo + space type → 3 concepts with INR budgets + AI-generated concept images (imagen-3.0 via google-genai)
- `/ai-plant-doctor` — photo → diagnosis (severity/confidence/causes/treatment)
- `/ai-plant-finder` — 4-step quiz → 3 catalog-matched picks (LLM with rule-based fallback)
- `/ai-proposal-generator` — brief → formal printable proposal (print CSS in index.css)
- `/ai-visualizer` — AI Garden Visualizer: text brief → AI art direction → rendered photo-real garden image (model picker, download, re-render)

## Data model (Mongo, uuid string ids)
- plants (slug unique; category/sunlight/maintenance/locations/badges/price)
- services (slug unique), locations (slug unique, AI content), projects, plans
- leads (score: hot/warm/cold rule-based in lib/leads.py; status: new/in_progress/converted/closed; created_at)

## API (all under /api, routers: catalog.py, ai.py, leads.py)
- GET /plants (filters), /plants/{slug}, /services, /services/{slug}, /locations, /locations/{slug}, /projects, /plans
- POST /ai/ask-aj (SSE stream), /ai/plant-doctor, /ai/landscape-designer, /ai/plant-finder, /ai/proposal
- POST /leads; POST /admin/login {pin}; GET /admin/leads + PATCH /admin/leads/{id} (header X-Admin-PIN)

## AI image generation (lib/images.py)
Multi-model with auto-fallback, returned as compressed JPEG data URLs (Pillow downscale to 1024px/q82):
- `gpt-image-1` (OpenAI, **works with EMERGENT_LLM_KEY** via Emergent proxy) — default
- `dall-e-3` (OpenAI, same key)
- `imagen-4.0-fast-generate-001` (Gemini) — **requires a separate real `GEMINI_API_KEY`**; the universal
  key is rejected by Imagen ("only supported in Gemini Enterprise Agent Platform mode"), so the model is
  reported as `available: false` until that key is set in backend/.env.
Endpoints: `GET /api/ai/image-models`, `POST /api/ai/visualize`, `POST /api/ai/regenerate-concept-image`.
Surfaces: `/ai-visualizer` (standalone page, model picker + download + re-render) and the Landscape
Designer (model select + per-concept "Re-render").

## Auth / credentials
- Admin dashboard PIN: env `ADMIN_PIN` in backend/.env — **9079**
- WhatsApp number for all CTAs: **+91 93362 39079** (wa.me/919336239079), env WHATSAPP_NUMBER
- LLM: Emergent universal key env `EMERGENT_LLM_KEY`, model gpt-5.4 (openai provider) via emergentintegrations; concept images via google-genai imagen-3.0-generate-002

## Seed
`cd /app/backend && python seed.py` — idempotent; hand-written catalog copy + LLM-generated location content (fallback copy built in).

## Design
Lora (headings) + DM Sans (body) + IBM Plex Mono (overlines); cream #F8F9F5 / forest #14261C / primary #206D43 / gold accent; glass hero panels; no-print/print-area print CSS.
