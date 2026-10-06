// Hand-written mirrors of the backend Pydantic models — keep both sides in sync in the same edit.

export interface Faq {
  q: string;
  a: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface ProcessStep {
  title: string;
  detail: string;
}

export interface Plant {
  id: string;
  slug: string;
  name: string;
  category: string;
  tags: string[];
  price: number;
  sunlight: string;
  maintenance: string;
  locations: string[];
  description: string;
  image_url: string;
  badges: string[];
  in_stock: boolean;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  short: string;
  hero_image: string;
  description: string[];
  features: string[];
  process: ProcessStep[];
  price_from: number;
  faqs: Faq[];
  stats: Stat[];
}

export interface LocationPage {
  id: string;
  slug: string;
  name: string;
  region: string;
  intro: string;
  microclimate: string;
  soil_note: string;
  best_plants: string[];
  popular_services: string[];
  neighborhoods: string[];
  faqs: Faq[];
  image_url: string;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  category: string;
  summary: string;
  image_url: string;
  area: string;
  duration: string;
  budget_band: string;
  highlights: string[];
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  price: number;
  cadence: string;
  tagline: string;
  features: string[];
  popular: boolean;
}

export interface LeadCreate {
  name?: string;
  phone?: string;
  email?: string;
  source: string;
  interest?: string;
  location?: string;
  property_type?: string;
  area_sqft?: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
  message?: string;
  has_photo?: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  interest: string;
  location: string;
  property_type: string;
  area_sqft: number | null;
  budget_min: number | null;
  budget_max: number | null;
  message: string;
  has_photo: boolean;
  score: "hot" | "warm" | "cold";
  status: "new" | "in_progress" | "converted" | "closed";
  created_at: string;
}

export interface Diagnosis {
  problem: string;
  severity: "mild" | "moderate" | "critical";
  confidence: number;
  causes: string[];
  treatment: string[];
  recovery_days: number;
  cta: string;
}

export interface DesignConcept {
  title: string;
  style: string;
  description: string;
  budget_min: number;
  budget_max: number;
  plants: string[];
  features: string[];
  maintenance: string;
  timeline_days: number;
  image_url: string;
  image_model: string;
}

export interface ImageModelOut {
  id: string;
  label: string;
  provider: string;
  note: string;
  available: boolean;
}

export interface VisualizeResult {
  image_url: string;
  image_model: string;
  prompt_used: string;
  caption: string;
}

export interface DesignResult {
  space_analysis: string;
  concepts: DesignConcept[];
}

export interface PlantPick {
  slug: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  reason: string;
}

export interface QuizResult {
  intro: string;
  picks: PlantPick[];
}

export interface CostLine {
  item: string;
  amount: string;
}

export interface Phase {
  name: string;
  duration: string;
  detail: string;
}

export interface Proposal {
  id: string;
  reference: string;
  title: string;
  executive_summary: string;
  scope: string[];
  botanical_palette: string[];
  hardscape_palette: string[];
  phases: Phase[];
  costs: CostLine[];
  total_min: number;
  total_max: number;
  warranty: string;
  maintenance_note: string;
  created_at: string;
}
