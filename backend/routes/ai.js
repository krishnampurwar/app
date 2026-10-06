/** All AI endpoints: Ask AJ (SSE), Plant Doctor, Landscape Designer, Plant Finder, Proposal, Visualizer. */

import { Router } from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { completeJson, streamComplete } from "../lib/ai.js";
import { availableModels, gardenPrompt, generateImage, generateImageSafe } from "../lib/images.js";
import { requireContact } from "../lib/contact.js";
import { queueLeadEmail } from "../lib/email.js";

export const router = Router();

const GURGAON_CONTEXT = `You operate in Gurgaon (Delhi NCR), India: summers 40-46°C dry heat (Apr-Jun), monsoon Jul-Sep with humidity and waterlogging, winters 4-18°C with fog and poor air quality (Nov-Jan). Hard municipal water, high-rise terrace weight limits and strong balcony winds are common constraints. All prices in INR (₹). AJ Heaven's Harvest Nursery serves all of Gurgaon — DLF Phases 1-5, Golf Course Road, Golf Course Extension Road, Sohna Road, New Gurgaon (Sectors 82-95), Sector 14/29, South City, Manesar — with plants, landscaping, vertical gardens, rooftop gardens and maintenance subscriptions (WhatsApp +91 93362 39079).`;

const aiFail = (res, err) =>
  res.status(502).json({ detail: `AI is unavailable right now, please retry. (${err.message})` });

/* ------------------------------------------------------------------ Ask AJ (SSE streaming) */

const ASK_AJ_SYSTEM = `You are AJ, the AI Garden Consultant for AJ Heaven's Harvest Nursery, a plant nursery and landscaping studio in Gurgaon, India.
${GURGAON_CONTEXT}
Style: warm, practical, concise (under 130 words), short paragraphs or tight bullet lists. Recommend plants a NCR nursery actually stocks. Give realistic INR budgets when cost comes up. If the visitor uploads a photo, open with one line on what you observe about the space or plant, then advise. Close every reply with one gentle next step (WhatsApp for availability, visit the nursery, or book a site visit).`;

/** Chat history is held client-side (stateless backend, no database). */
router.post("/ai/ask-aj", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const { message = "", image_b64: imageB64 = null, history = [] } = req.body ?? {};
  const priorTurns = (Array.isArray(history) ? history : [])
    .slice(-8)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.text)
    .map((m) => ({ role: m.role, content: String(m.text).slice(0, 4000) }));

  const content = imageB64
    ? [
        { type: "text", text: message || "Please assess this photo of my space." },
        { type: "image_url", image_url: { url: imageB64.startsWith("data:") ? imageB64 : `data:image/jpeg;base64,${imageB64}` } },
      ]
    : message || "Hello";

  try {
    for await (const delta of streamComplete(ASK_AJ_SYSTEM, [...priorTurns, { role: "user", content }])) {
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: `AI is unavailable right now (${err.message}). Please try again or WhatsApp us.` })}\n\n`);
  }
  res.end();
});

/* ------------------------------------------------------------------ AI Plant Doctor */

const DOCTOR_SYSTEM = `You are the AI Plant Doctor at AJ Heaven's Harvest Nursery, Gurgaon.
${GURGAON_CONTEXT}
Diagnose the plant in the photo the way a friendly horticulturist would. Consider: overwatering/root rot, underwatering & heat stress, pest infestation (mealybugs, spider mites, aphids), nutrient deficiency (nitrogen, iron chlorosis), sunlight scorching, and root problems. Reply with ONLY a JSON object, no prose:
{"problem": "...", "severity": "mild|moderate|critical", "confidence": 0-100, "causes": ["..."], "treatment": ["step 1", "step 2", "step 3"], "recovery_days": 14, "cta": "one line inviting a ₹499 plant-doctor home visit or an organic treatment kit"}`;

router.post("/ai/plant-doctor", requireContact, async (req, res) => {
  const { image_b64: imageB64 = "", notes = "" } = req.body ?? {};
  if (!imageB64) {
    res.status(422).json({ detail: [{ field: "image_b64", message: "Please upload a photo of the plant" }] });
    return;
  }
  try {
    const data = await completeJson(
      DOCTOR_SYSTEM,
      `Diagnose this plant photo.${notes ? ` Owner notes: ${notes}` : ""}`,
      [imageB64],
    );
    queueLeadEmail({ ...req.contact, source: "plant_doctor" });
    res.json({
      problem: data.problem ?? "Needs a closer look",
      severity: data.severity ?? "moderate",
      confidence: Number(data.confidence ?? 75),
      causes: data.causes ?? [],
      treatment: data.treatment ?? [],
      recovery_days: Number(data.recovery_days ?? 14),
      cta: data.cta ?? "",
    });
  } catch (err) {
    aiFail(res, err);
  }
});

/* ------------------------------------------------------------------ AI Landscape Designer */

const DESIGNER_SYSTEM = `You are the AI Landscape Designer at AJ Heaven's Harvest Nursery, Gurgaon.
${GURGAON_CONTEXT}
Analyse the visitor's space (photo if provided: orientation, light, usable area, existing elements) and design exactly 3 concept tiers, always in this order:
1. "Minimalist Low-Maintenance" — budget ₹35,000-75,000
2. "Modern Biophilic with Vertical Green Wall" — budget ₹1,20,000-2,50,000
3. "Luxury Zen Oasis (pergola, drip irrigation, lighting)" — budget ₹3,50,000-7,00,000+
Scale the budgets to the chosen space type. Reply with ONLY a JSON object, no prose:
{"space_analysis": "2 lines on the space and its light/conditions",
 "concepts": [{"title": "...", "style": "low-maintenance|biophilic|luxury-zen", "description": "2-3 sentences", "budget_min": 35000, "budget_max": 75000, "plants": ["5 plant names"], "features": ["5 features"], "maintenance": "low|medium|high", "timeline_days": 14}]}`;

router.post("/ai/landscape-designer", requireContact, async (req, res) => {
  const { image_b64: imageB64 = null, space_type: spaceType = "terrace", notes = "", image_model: imageModel } = req.body ?? {};
  try {
    const data = await completeJson(
      DESIGNER_SYSTEM,
      `Design my ${spaceType}.${notes ? ` Extra details: ${notes}` : ""}`,
      imageB64 ? [imageB64] : [],
    );
    const concepts = Array.isArray(data.concepts) ? data.concepts : [];

    // Render all three concept images in parallel; a failure leaves image_url empty.
    const rendered = await Promise.all(
      concepts.map(async (c) => {
        const { imageUrl, model } = await generateImageSafe(
          gardenPrompt(spaceType, c.style ?? "modern", c.description ?? ""),
          imageModel,
        );
        return {
          title: c.title ?? "Concept",
          style: c.style ?? "modern",
          description: c.description ?? "",
          budget_min: Number(c.budget_min ?? 0),
          budget_max: Number(c.budget_max ?? 0),
          plants: c.plants ?? [],
          features: c.features ?? [],
          maintenance: c.maintenance ?? "low",
          timeline_days: Number(c.timeline_days ?? 14),
          image_url: imageUrl,
          image_model: model,
        };
      }),
    );

    queueLeadEmail({ ...req.contact, source: "designer" });
    res.json({ space_analysis: data.space_analysis ?? "", concepts: rendered });
  } catch (err) {
    aiFail(res, err);
  }
});

/* ------------------------------------------------------------------ What Plant Should I Buy? */

const FINDER_SYSTEM = `You are the plant-match quiz engine at AJ Heaven's Harvest Nursery, Gurgaon.
${GURGAON_CONTEXT}
You get the visitor's answers plus the nursery's live catalog. Pick exactly 3 catalog plants (by slug) that genuinely fit. Reply with ONLY a JSON object, no prose:
{"intro": "one friendly line", "picks": [{"slug": "...", "reason": "one line why it fits this exact home"}]}`;

/** The catalog lives in the frontend's static JSON — read it from disk, no database. */
const CATALOG_PATH = path.resolve(process.cwd(), "../frontend/public/data/plants.json");
let catalogCache = null;
async function loadCatalog() {
  if (catalogCache) return catalogCache;
  try {
    catalogCache = JSON.parse(await readFile(CATALOG_PATH, "utf8"));
  } catch (err) {
    console.warn("[ai] could not read plant catalog:", err.message);
    catalogCache = [];
  }
  return catalogCache;
}

function fallbackPicks(catalog, { placement, sunlight, care }) {
  const careMap = { very_low: "low", medium: "medium", high: "high" };
  const wanted = careMap[care] ?? "medium";
  const score = (p) =>
    (p.sunlight === sunlight ? 2 : 0) +
    (p.maintenance === wanted ? 2 : 0) +
    ((p.locations ?? []).includes(placement) ? 2 : 0);
  return [...catalog]
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price ?? 0,
      image_url: p.image_url ?? "",
      category: p.category ?? "",
      reason: `Matches ${String(placement).replace(/_/g, " ")} with ${sunlight} light and ${wanted} care.`,
    }));
}

router.post("/ai/plant-finder", requireContact, async (req, res) => {
  const { placement = "", sunlight = "", care = "", traits = [] } = req.body ?? {};
  const catalog = await loadCatalog();
  const answers = `Placement: ${placement}; Sunlight: ${sunlight}; Care commitment: ${care}; Wanted traits: ${traits.join(", ") || "none"}`;

  let intro = "";
  let picks = [];
  try {
    const slim = catalog.map((p) => ({
      slug: p.slug, name: p.name, category: p.category, sunlight: p.sunlight,
      maintenance: p.maintenance, locations: p.locations, badges: p.badges, price: p.price,
    }));
    const data = await completeJson(FINDER_SYSTEM, `${answers}\n\nCatalog:\n${JSON.stringify(slim)}`);
    intro = data.intro ?? "";
    const bySlug = new Map(catalog.map((p) => [p.slug, p]));
    picks = (data.picks ?? [])
      .slice(0, 3)
      .map((p) => {
        const match = bySlug.get(p.slug);
        return match
          ? {
              slug: match.slug, name: match.name, price: match.price ?? 0,
              image_url: match.image_url ?? "", category: match.category ?? "",
              reason: p.reason ?? "",
            }
          : null;
      })
      .filter(Boolean);
  } catch (err) {
    console.warn("[ai] plant finder LLM failed, using rules:", err.message);
  }
  if (picks.length < 3) picks = fallbackPicks(catalog, { placement, sunlight, care });

  queueLeadEmail({ ...req.contact, source: "quiz" });
  res.json({ intro, picks });
});

/* ------------------------------------------------------------------ AI Proposal Studio */

const PROPOSAL_SYSTEM = `You are the proposal engine at AJ Heaven's Harvest Nursery, Gurgaon — an executive landscape-architecture proposal writer.
${GURGAON_CONTEXT}
Write a preliminary proposal the sales team can send the same day. Keep costs consistent with the stated budget range (use realistic Gurgaon market rates: basic landscaping ~₹150-300/sqft, vertical walls ~₹900-1,400/sqft of wall, automated drip ~₹250-400/sqft). Reply with ONLY a JSON object, no prose:
{"title": "...", "executive_summary": "3-4 sentences", "scope": ["6-8 deliverables"], "botanical_palette": ["8 plants suited to Gurgaon"], "hardscape_palette": ["6 materials/elements"], "phases": [{"name": "...", "duration": "...", "detail": "1 line"}], "costs": [{"item": "...", "amount": "₹X,XX,000"}], "total_min": 0, "total_max": 0, "warranty": "1 line", "maintenance_note": "1 line recommending a maintenance plan"}`;

router.post("/ai/proposal", requireContact, async (req, res) => {
  const {
    property_type: propertyType = "Terrace", area_sqft: areaSqft = 0,
    location = "Gurgaon", features = [], budget_range: budgetRange = "", notes = "",
  } = req.body ?? {};

  const brief =
    `Property type: ${propertyType}; Area: ${areaSqft} sq ft; Location: ${location}, Gurgaon; ` +
    `Desired features: ${features.join(", ") || "open to recommendation"}; ` +
    `Budget range: ${budgetRange || "suggest sensibly"}; Notes: ${notes || "none"}`;

  try {
    const data = await completeJson(PROPOSAL_SYSTEM, brief);
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const ref = `AJH-${today}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
    queueLeadEmail({ ...req.contact, source: "proposal" });
    res.json({
      id: crypto.randomUUID(),
      reference: ref,
      title: data.title ?? `${propertyType} landscape proposal`,
      executive_summary: data.executive_summary ?? "",
      scope: data.scope ?? [],
      botanical_palette: data.botanical_palette ?? [],
      hardscape_palette: data.hardscape_palette ?? [],
      phases: data.phases ?? [],
      costs: data.costs ?? [],
      total_min: Number(data.total_min ?? 0),
      total_max: Number(data.total_max ?? 0),
      warranty: data.warranty ?? "",
      maintenance_note: data.maintenance_note ?? "",
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    aiFail(res, err);
  }
});

/* ------------------------------------------------------------------ Image generation models */

router.get("/ai/image-models", (_req, res) => {
  res.json(availableModels());
});

const VISUALIZER_SYSTEM = `You write image-generation art direction for AJ Heaven's Harvest Nursery, Gurgaon.
${GURGAON_CONTEXT}
Given a customer's rough description of the garden they dream of, write ONE vivid, concrete visual paragraph (max 70 words) describing the finished space: plants by name, planters, flooring, lighting, seating, mood and time of day. Plants must be ones that survive Gurgaon. Reply with ONLY a JSON object:
{"visual": "the paragraph", "caption": "a short 12-word caption for the rendered image"}`;

router.post("/ai/visualize", requireContact, async (req, res) => {
  const {
    space_type: spaceType = "terrace", style = "modern biophilic",
    description = "", image_model: imageModel,
  } = req.body ?? {};

  let visual = description;
  let caption = "";
  try {
    const data = await completeJson(
      VISUALIZER_SYSTEM,
      `Space: ${spaceType}. Style wanted: ${style}. Customer description: ${description || "open to ideas"}`,
    );
    visual = data.visual || visual;
    caption = data.caption ?? "";
  } catch (err) {
    console.warn("[ai] visualizer art direction failed, using raw description:", err.message);
  }

  const prompt = gardenPrompt(spaceType, style, visual);
  try {
    const { imageUrl, model } = await generateImage(prompt, imageModel);
    queueLeadEmail({ ...req.contact, source: "visualizer" });
    res.json({ image_url: imageUrl, image_model: model, prompt_used: prompt, caption });
  } catch (err) {
    res.status(502).json({ detail: `Image generation is unavailable right now. (${err.message})` });
  }
});

router.post("/ai/regenerate-concept-image", async (req, res) => {
  const { space_type: spaceType = "terrace", style = "modern", description = "", image_model: imageModel } = req.body ?? {};
  const prompt = gardenPrompt(spaceType, style, description);
  try {
    const { imageUrl, model } = await generateImage(prompt, imageModel);
    res.json({ image_url: imageUrl, image_model: model, prompt_used: prompt, caption: "" });
  } catch (err) {
    res.status(502).json({ detail: `Image generation is unavailable right now. (${err.message})` });
  }
});
