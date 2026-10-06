/** Lead capture — emails the owner. Nothing is stored. */

import { Router } from "express";
import { requireContact } from "../lib/contact.js";
import { LEAD_EMAIL, sendLeadEmail, sourceLabel } from "../lib/email.js";

export const router = Router();

const ALLOWED_SOURCES = new Set([
  "contact", "maintenance", "quiz", "plant_doctor", "designer", "visualizer", "proposal", "ask_aj",
]);

router.post("/leads", requireContact, async (req, res) => {
  const raw = String(req.body?.source ?? "contact");
  const source = ALLOWED_SOURCES.has(raw) ? raw : "contact";
  try {
    await sendLeadEmail({ ...req.contact, source });
    res.json({ ok: true, delivered: true, tool: sourceLabel(source) });
  } catch (err) {
    // The visitor should still get a success path; the lead is logged for recovery.
    console.error("[leads] email failed:", err.message, JSON.stringify({ ...req.contact, source }));
    res.status(502).json({ detail: "We could not send that just now — please WhatsApp us instead." });
  }
});

/** Lets the admin page show where leads are going, without exposing the key. */
router.get("/leads/destination", (_req, res) => {
  const [user, domain] = LEAD_EMAIL.split("@");
  const masked = `${user.slice(0, 2)}${"•".repeat(Math.max(user.length - 2, 2))}@${domain}`;
  res.json({ email: LEAD_EMAIL, masked, configured: Boolean(process.env.EMERGENT_EMAIL_KEY) });
});
