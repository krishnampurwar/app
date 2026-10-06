// WhatsApp deep-link helpers. Number lives in backend/.env (WHATSAPP_NUMBER); keep in sync.
export const WHATSAPP_NUMBER = "919336239079";
export const WHATSAPP_DISPLAY = "+91 93362 39079";

export const waLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const WA = {
  general: waLink("Hello AJ Nursery Team! I need guidance for my garden in Gurgaon."),
  quote: waLink("Hi AJ Harvest Team, I want a garden landscape consultation."),
  visit: waLink("Hi AJ Nursery, I'd like to book a site visit in Gurgaon."),
  nursery: waLink("Hi AJ Nursery, I want to check plant availability and prices."),
};

export const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;
