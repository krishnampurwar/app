# Deploying to Hostinger (Cloud Professional — "Deploy Web App")

This app is now Node.js + static files with **no database**, which is exactly what Hostinger's
managed Node.js hosting supports.

---

## What gets deployed

| Part | What it is | Where it goes |
|---|---|---|
| `frontend/` | Vite + React build → static HTML/CSS/JS + `public/data/*.json` | Served as static files |
| `backend/` | Express API (AI logic + lead email only) | Node.js app process |

No MongoDB, no Python, no persistent storage required.

---

## Option 1 — Single Node app serving both (recommended, simplest)

One Hostinger Web App serves the API *and* the built frontend.

### 1. Build the frontend
```bash
cd frontend
yarn install
yarn build          # outputs frontend/dist
```

### 2. Let the backend serve `dist`
Add this to `backend/server.js`, immediately **before** the 404 handler:

```js
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, "../frontend/dist");

app.use(express.static(dist));
// SPA fallback — every non-/api route returns index.html
app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, "index.html")));
```

### 3. Push to GitHub, then in hPanel
1. **Websites → Add Website → Deploy Web App → Node.js Web App**
2. Choose **GitHub** (auto-redeploys on push) or **ZIP upload**
3. Settings:
   - **Node version:** 20.x or 22.x
   - **Install command:** `cd frontend && yarn install && yarn build && cd ../backend && yarn install`
   - **Start command:** `node backend/server.js`
   - **App root:** repository root
4. Add the environment variables below in the hPanel **Environment Variables** panel
5. **Deploy**

> Hostinger assigns the port via `process.env.PORT` — `server.js` already reads it, so no change needed.

---

## Option 2 — Static site + separate API

Upload `frontend/dist` to `public_html` as a static site, and run `backend/` as a separate Node Web
App. Then set `VITE_API_BASE_URL` to the API's URL at build time and enable CORS for your domain:

```bash
# backend/.env
CORS_ORIGINS=https://ajheavensharvest.com,https://www.ajheavensharvest.com
```

---

## Environment variables to set in hPanel

**Required**
```
LEAD_EMAIL=krishnam@konverzions.com
EMAIL_FROM_NAME=AJ Heavens Harvest Nursery
CORS_ORIGINS=https://yourdomain.com
```

**AI — pick one setup**

*A. Your own OpenAI key (what you need off-Emergent):*
```
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...your-openai-key...
AI_TEXT_MODEL=gpt-4o
OPENAI_API_KEY=sk-...same-key...      # also unlocks DALL·E 3
```

*B. Keep the Emergent proxy (only works while hosted on Emergent):*
```
LLM_BASE_URL=https://integrations.emergentagent.com/llm
LLM_API_KEY=sk-emergent-...
```

**Email — pick one**

*A. Managed proxy (only works on Emergent):*
```
EMERGENT_EMAIL_KEY=ek_...
```

*B. Your own provider once on Hostinger* — get a free [Resend](https://resend.com) API key and
replace the `fetch` block in `backend/lib/email.js` `sendLeadEmail()` with:
```js
const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
  body: JSON.stringify({
    from: `${EMAIL_FROM_NAME} <leads@yourdomain.com>`,   // verify your domain in Resend
    to: [LEAD_EMAIL],
    subject,
    html,
  }),
});
```
Everything else (template, guardrails, validation) stays as-is.

**Optional**
```
GEMINI_API_KEY=...    # unlocks Google Imagen in the image-model picker
EMAIL_REPLY_TO=you@yourdomain.com
```

---

## Post-deploy checklist

```bash
curl https://yourdomain.com/api/health                 # {"status":"ok","stateless":true}
curl https://yourdomain.com/data/plants.json | head    # 24 plants
curl -X POST https://yourdomain.com/api/leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Deploy Test","phone":"9336239079","source":"contact"}'
```
Then confirm the test lead arrived at **krishnam@konverzions.com**, and walk one AI tool
(`/ai-plant-finder` is the fastest) end to end.

---

## Updating content later

Plants, services, locations, projects and plans are plain JSON in
`frontend/public/data/`. Edit the file, rebuild (or just re-upload that JSON for a static
deploy) — no database migration, no backend change. Keep each record's `id` unique.
