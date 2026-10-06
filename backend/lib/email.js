/**
 * Lead notification email via the managed email proxy.
 *
 * Guardrails honoured (see playbook G1-G5):
 *  G1 from_name is this app's own brand, from EMAIL_FROM_NAME.
 *  G2 no forms/inputs, never asks for credentials.
 *  G3 no links or remote assets in the body at all.
 *  G4 NOT an open relay: the recipient comes from LEAD_EMAIL (server config) and the body
 *     from a fixed server-side template — callers only supply escaped data fields.
 *  G5 transactional only: one email per lead the visitor themselves submitted.
 *
 * Self-hosting swap: set EMAIL_BASE_URL + EMERGENT_EMAIL_KEY to your own provider, or
 * point SMTP at your Hostinger mailbox.
 */

const EMAIL_BASE_URL = process.env.EMAIL_BASE_URL || "https://integrations.emergentagent.com";
const EMAIL_KEY = process.env.EMERGENT_EMAIL_KEY || "";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "AJ Heaven's Harvest Nursery";
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || "";
/** Where every lead goes. Server-side only — never taken from a request. */
export const LEAD_EMAIL = process.env.LEAD_EMAIL || "krishnam@konverzions.com";

const CRED_ASK = [
  "reply with your password", "reply with the code", "send your password", "cvv",
  "send us your password", "enter your password below", "confirm your card number",
  "your full card number", "seed phrase", "recovery phrase", "verify your card",
  "social security number", "confirm your bank details",
];

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Structural G2/G3 gate — called on every send, never skipped. */
function assertSafeEmail(subject, html) {
  if (/<\s*(form|input|textarea|select)\b/i.test(html)) {
    throw new Error("No forms or input fields in email (G2)");
  }
  const body = `${subject}\n${html}`.toLowerCase();
  for (const phrase of CRED_ASK) {
    if (body.includes(phrase)) throw new Error(`Email asks for credentials: ${phrase} (G2)`);
  }
  const urls = [...html.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1].trim());
  for (const url of urls) {
    const low = url.toLowerCase();
    if (low.startsWith("mailto:") || low.startsWith("tel:") || low.startsWith("cid:") || low.startsWith("#")) continue;
    if (!low.startsWith("https://")) throw new Error(`Email links must be absolute https: ${url} (G3)`);
  }
}

const SOURCE_LABELS = {
  contact: "Contact form",
  maintenance: "Maintenance plan signup",
  quiz: "Plant Match Quiz",
  plant_doctor: "AI Plant Doctor",
  designer: "AI Landscape Designer",
  visualizer: "AI Garden Visualizer",
  proposal: "AI Proposal Generator",
  ask_aj: "Ask AJ consultant",
};

export const sourceLabel = (source) => SOURCE_LABELS[source] || "Website enquiry";

/**
 * Email one lead to the owner. Keeps to what the owner asked for: name, phone, tool used.
 * Returns the provider message id, or null when email is not configured.
 */
export async function sendLeadEmail({ name, phone, source }) {
  if (!EMAIL_KEY) {
    console.warn("[email] EMERGENT_EMAIL_KEY not set — lead not emailed:", name, phone);
    return null;
  }

  const tool = sourceLabel(source);
  const subject = `New lead: ${name} — ${tool}`;
  const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

  // Fixed server-side template; only escaped data is interpolated (G4).
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9f5;padding:24px">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #dde6dc;border-radius:12px">
      <tr><td style="background:#14261c;padding:20px 24px;border-radius:12px 12px 0 0">
        <p style="margin:0;font-family:Georgia,serif;font-size:18px;color:#ffffff">New website lead</p>
        <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#8ed6b1;letter-spacing:1px;text-transform:uppercase">${escapeHtml(tool)}</p>
      </td></tr>
      <tr><td style="padding:24px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#14261c">
          <tr>
            <td style="padding:8px 0;color:#4e6155;width:110px">Name</td>
            <td style="padding:8px 0;font-weight:bold">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#4e6155">Phone</td>
            <td style="padding:8px 0;font-weight:bold"><a href="tel:${escapeHtml(String(phone).replace(/[^\d+]/g, ""))}" style="color:#206d43;text-decoration:none">${escapeHtml(phone)}</a></td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#4e6155">Tool used</td>
            <td style="padding:8px 0">${escapeHtml(tool)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#4e6155">Received</td>
            <td style="padding:8px 0">${escapeHtml(when)} IST</td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="padding:0 24px 24px">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#888">Sent by ${escapeHtml(EMAIL_FROM_NAME)} because someone submitted a form on your website. We never ask for passwords or card details by email.</p>
      </td></tr>
    </table>
  </td></tr>
</table>`;

  assertSafeEmail(subject, html);

  const payload = {
    to: [LEAD_EMAIL],
    subject,
    html,
    from_name: EMAIL_FROM_NAME,
  };
  if (EMAIL_REPLY_TO) payload.contact_email = EMAIL_REPLY_TO;

  const res = await fetch(`${EMAIL_BASE_URL}/api/v1/email/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Email-Key": EMAIL_KEY },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = (await res.text()).slice(0, 300);
    console.error(`[email] send failed ${res.status}: ${text}`);
    throw new Error("failed to send lead email");
  }
  const data = await res.json().catch(() => ({}));
  console.log(`[email] lead emailed to ${LEAD_EMAIL} (${tool}) id=${data.id ?? "?"}`);
  return data.id ?? null;
}

/**
 * Fire-and-forget: never let a mail hiccup break the visitor's AI result.
 * The lead details are logged so nothing is lost if the provider is down.
 */
export function queueLeadEmail(lead) {
  if (!lead?.name || !lead?.phone) return;
  sendLeadEmail(lead).catch((err) => {
    console.error("[email] lead NOT delivered:", err.message, "| lead:", JSON.stringify(lead));
  });
}
