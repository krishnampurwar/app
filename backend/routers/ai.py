"""The AI Garden Suite — Ask AJ (SSE streaming), Plant Doctor, Landscape Designer, Plant Finder, Proposal Studio."""

import asyncio
import base64
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional

from emergentintegrations.llm.chat import StreamDone, TextDelta
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from lib.ai import api_key, clean_b64, complete_json, make_chat, new_session
from lib.db import db
from lib.images import available_models, garden_prompt, generate_image, generate_image_safe
from lib.leads import save_lead
from models.contact import ContactRequired
from models.leads import LeadCreate

router = APIRouter()

GURGAON_CONTEXT = """You operate in Gurgaon (Delhi NCR), India: summers 40-46°C dry heat (Apr-Jun), monsoon Jul-Sep with humidity and waterlogging, winters 4-18°C with fog and poor air quality (Nov-Jan). Hard municipal water, high-rise terrace weight limits and strong balcony winds are common constraints. All prices in INR (₹). AJ Heaven's Harvest Nursery serves all of Gurgaon — DLF Phases 1-5, Golf Course Road, Golf Course Extension Road, Sohna Road, New Gurgaon (Sectors 82-95), Sector 14/29, South City, Manesar — with plants, landscaping, vertical gardens, rooftop gardens and maintenance subscriptions (WhatsApp +91 93362 39079)."""


# ---------------------------------------------------------------- Ask AJ (SSE streaming)

ASK_AJ_SYSTEM = f"""You are AJ, the AI Garden Consultant for AJ Heaven's Harvest Nursery, a plant nursery and landscaping studio in Gurgaon, India.
{GURGAON_CONTEXT}
Style: warm, practical, concise (under 130 words), short paragraphs or tight bullet lists. Recommend plants a NCR nursery actually stocks. Give realistic INR budgets when cost comes up. If the visitor uploads a photo, open with one line on what you observe about the space or plant, then advise. Close every reply with one gentle next step (WhatsApp for availability, visit the nursery, or book a site visit)."""


class AskAjRequest(BaseModel):
    session_id: str
    message: str
    image_b64: Optional[str] = None


@router.post("/ai/ask-aj")
async def ask_aj(req: AskAjRequest):
    async def event_stream():
        try:
            chat = make_chat(f"aj-{req.session_id}", ASK_AJ_SYSTEM)
            kwargs: dict = {"text": req.message}
            if req.image_b64:
                from emergentintegrations.llm.chat import ImageContent

                kwargs["file_contents"] = [ImageContent(image_base64=clean_b64(req.image_b64))]
            user_msg = _user_message(**kwargs)
            async for ev in chat.stream_message(user_msg):
                if isinstance(ev, TextDelta):
                    yield f"data: {json.dumps({'delta': ev.content or ''})}\n\n"
                elif isinstance(ev, StreamDone):
                    break
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': f'AI is unavailable right now ({exc}). Please try again or WhatsApp us.'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


def _user_message(**kwargs):
    from emergentintegrations.llm.chat import UserMessage

    return UserMessage(**kwargs)


# ---------------------------------------------------------------- AI Plant Doctor

class PlantDoctorRequest(ContactRequired):
    image_b64: str
    notes: str = ""


class Diagnosis(BaseModel):
    problem: str
    severity: str = "moderate"  # mild | moderate | critical
    confidence: int = 75
    causes: List[str] = []
    treatment: List[str] = []
    recovery_days: int = 14
    cta: str = ""


DOCTOR_SYSTEM = f"""You are the AI Plant Doctor at AJ Heaven's Harvest Nursery, Gurgaon.
{GURGAON_CONTEXT}
Diagnose the plant in the photo the way a friendly horticulturist would. Consider: overwatering/root rot, underwatering & heat stress, pest infestation (mealybugs, spider mites, aphids), nutrient deficiency (nitrogen, iron chlorosis), sunlight scorching, and root problems. Reply with ONLY a JSON object, no prose:
{{"problem": "...", "severity": "mild|moderate|critical", "confidence": 0-100, "causes": ["..."], "treatment": ["step 1", "step 2", "step 3"], "recovery_days": 14, "cta": "one line inviting a ₹499 plant-doctor home visit or an organic treatment kit"}}"""


@router.post("/ai/plant-doctor", response_model=Diagnosis)
async def plant_doctor(req: PlantDoctorRequest):
    prompt = "Diagnose this plant photo." + (f" Owner notes: {req.notes}" if req.notes else "")
    try:
        data = await complete_json(new_session("doctor"), DOCTOR_SYSTEM, prompt, [req.image_b64])
        diagnosis = Diagnosis(**data)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI is unavailable right now, please retry. ({exc})")
    await save_lead(
        LeadCreate(
            name=req.name, phone=req.phone, source="plant_doctor", interest="Plant Doctor consultation",
            message=req.notes or diagnosis.problem, has_photo=True,
        )
    )
    return diagnosis


# ---------------------------------------------------------------- AI Landscape Designer

class DesignerRequest(ContactRequired):
    image_b64: Optional[str] = None
    space_type: str  # balcony | terrace | villa | office | atrium
    notes: str = ""
    image_model: Optional[str] = None  # preferred image-generation model


class DesignConcept(BaseModel):
    title: str
    style: str
    description: str
    budget_min: int
    budget_max: int
    plants: List[str] = []
    features: List[str] = []
    maintenance: str = "low"
    timeline_days: int = 14
    image_url: str = ""
    image_model: str = ""


class DesignResult(BaseModel):
    space_analysis: str
    concepts: List[DesignConcept] = []


DESIGNER_SYSTEM = f"""You are the AI Landscape Designer at AJ Heaven's Harvest Nursery, Gurgaon.
{GURGAON_CONTEXT}
Analyse the visitor's space (photo if provided: orientation, light, usable area, existing elements) and design exactly 3 concept tiers, always in this order:
1. "Minimalist Low-Maintenance" — budget ₹35,000-75,000
2. "Modern Biophilic with Vertical Green Wall" — budget ₹1,20,000-2,50,000
3. "Luxury Zen Oasis (pergola, drip irrigation, lighting)" — budget ₹3,50,000-7,00,000+
Scale the budgets to the chosen space type. Reply with ONLY a JSON object, no prose:
{{"space_analysis": "2 lines on the space and its light/conditions",
 "concepts": [{{"title": "...", "style": "low-maintenance|biophilic|luxury-zen", "description": "2-3 sentences", "budget_min": 35000, "budget_max": 75000, "plants": ["5 plant names"], "features": ["5 features"], "maintenance": "low|medium|high", "timeline_days": 14}}]}}"""


def _imagen_sync(prompt: str) -> bytes:  # retained for reference; image work now lives in lib/images.py
    raise NotImplementedError


@router.post("/ai/landscape-designer", response_model=DesignResult)
async def landscape_designer(req: DesignerRequest):
    prompt = f"Design my {req.space_type}." + (f" Extra details: {req.notes}" if req.notes else "")
    images_b64 = [req.image_b64] if req.image_b64 else None
    try:
        data = await complete_json(new_session("designer"), DESIGNER_SYSTEM, prompt, images_b64)
        result = DesignResult(**data)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI is unavailable right now, please retry. ({exc})")

    async def render(concept: DesignConcept) -> None:
        url, model = await generate_image_safe(
            garden_prompt(req.space_type, concept.style, concept.description), req.image_model
        )
        concept.image_url = url  # "" → the frontend shows a styled gradient placeholder
        concept.image_model = model

    await asyncio.gather(*(render(c) for c in result.concepts))

    budgets_min = [c.budget_min for c in result.concepts if c.budget_min]
    budgets_max = [c.budget_max for c in result.concepts if c.budget_max]
    await save_lead(
        LeadCreate(
            name=req.name, phone=req.phone, source="designer", interest=f"{req.space_type} landscape concept",
            message=req.notes or result.space_analysis, has_photo=bool(req.image_b64),
            budget_min=min(budgets_min) if budgets_min else None,
            budget_max=max(budgets_max) if budgets_max else None,
        )
    )
    return result


# ---------------------------------------------------------------- What Plant Should I Buy?

class QuizRequest(ContactRequired):
    placement: str  # living_room | bedroom | office | balcony | terrace | garden
    sunlight: str  # low | medium | direct
    care: str  # very_low | medium | high
    traits: List[str] = []


class PlantPick(BaseModel):
    slug: str = ""
    name: str
    price: int = 0
    image_url: str = ""
    category: str = ""
    reason: str = ""


class QuizResult(BaseModel):
    intro: str = ""
    picks: List[PlantPick] = []


FINDER_SYSTEM = f"""You are the plant-match quiz engine at AJ Heaven's Harvest Nursery, Gurgaon.
{GURGAON_CONTEXT}
You get the visitor's answers plus the nursery's live catalog. Pick exactly 3 catalog plants (by slug) that genuinely fit. Reply with ONLY a JSON object, no prose:
{{"intro": "one friendly line", "picks": [{{"slug": "...", "reason": "one line why it fits this exact home"}}]}}"""


def _fallback_picks(catalog: list[dict], req: QuizRequest) -> list[PlantPick]:
    care_map = {"very_low": "low", "medium": "medium", "high": "high"}

    def score(p: dict) -> int:
        s = 0
        if p.get("sunlight") == req.sunlight:
            s += 2
        if p.get("maintenance") == care_map.get(req.care, "medium"):
            s += 2
        if req.placement in p.get("locations", []):
            s += 2
        s += len(set(req.traits) & set(p.get("badges", [])))
        return s

    ranked = sorted(catalog, key=score, reverse=True)[:3]
    return [
        PlantPick(slug=p["slug"], name=p["name"], price=p.get("price", 0), image_url=p.get("image_url", ""),
                  category=p.get("category", ""), reason=f"Matches {req.placement.replace('_', ' ')} with {req.sunlight} light and {care_map.get(req.care, 'medium')} care.")
        for p in ranked
    ]


@router.post("/ai/plant-finder", response_model=QuizResult)
async def plant_finder(req: QuizRequest):
    docs = await db.plants.find().to_list(500)
    catalog = [
        {
            "slug": d["slug"], "name": d["name"], "category": d.get("category", ""),
            "sunlight": d.get("sunlight", ""), "maintenance": d.get("maintenance", ""),
            "locations": d.get("locations", []), "badges": d.get("badges", []), "price": d.get("price", 0),
        }
        for d in docs
    ]
    catalog_text = json.dumps(catalog)
    answers = f"Placement: {req.placement}; Sunlight: {req.sunlight}; Care commitment: {req.care}; Wanted traits: {', '.join(req.traits) or 'none'}"
    picks: list[PlantPick] = []
    intro = ""
    try:
        data = await complete_json(new_session("quiz"), FINDER_SYSTEM, f"{answers}\n\nCatalog:\n{catalog_text}")
        intro = data.get("intro", "")
        by_slug = {d["slug"]: d for d in docs}
        for p in data.get("picks", [])[:3]:
            match = by_slug.get(p.get("slug", ""))
            if match:
                picks.append(PlantPick(
                    slug=match["slug"], name=match["name"], price=match.get("price", 0),
                    image_url=match.get("image_url", ""), category=match.get("category", ""),
                    reason=p.get("reason", ""),
                ))
    except Exception:
        picks = []
    if len(picks) < 3:
        picks = _fallback_picks(catalog, req)
    await save_lead(
        LeadCreate(
            name=req.name, phone=req.phone, source="quiz", interest="Plant match quiz",
            message=f"{answers} -> {[p.name for p in picks]}",
        )
    )
    return QuizResult(intro=intro, picks=picks)


# ---------------------------------------------------------------- AI Proposal Studio

class ProposalRequest(ContactRequired):
    property_type: str
    area_sqft: int = 0
    location: str = "Gurgaon"
    features: List[str] = []
    budget_range: str = ""
    notes: str = ""


class CostLine(BaseModel):
    item: str
    amount: str


class Phase(BaseModel):
    name: str
    duration: str
    detail: str = ""


class Proposal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reference: str
    title: str
    executive_summary: str
    scope: List[str] = []
    botanical_palette: List[str] = []
    hardscape_palette: List[str] = []
    phases: List[Phase] = []
    costs: List[CostLine] = []
    total_min: int = 0
    total_max: int = 0
    warranty: str = ""
    maintenance_note: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


PROPOSAL_SYSTEM = f"""You are the proposal engine at AJ Heaven's Harvest Nursery, Gurgaon — an executive landscape-architecture proposal writer.
{GURGAON_CONTEXT}
Write a preliminary proposal the sales team can send the same day. Keep costs consistent with the stated budget range (use realistic Gurgaon market rates: basic landscaping ~₹150-300/sqft, vertical walls ~₹900-1,400/sqft of wall, automated drip ~₹250-400/sqft). Reply with ONLY a JSON object, no prose:
{{"title": "...", "executive_summary": "3-4 sentences", "scope": ["6-8 deliverables"], "botanical_palette": ["8 plants suited to Gurgaon"], "hardscape_palette": ["6 materials/elements"], "phases": [{{"name": "...", "duration": "...", "detail": "1 line"}}], "costs": [{{"item": "...", "amount": "₹X,XX,000"}}], "total_min": 0, "total_max": 0, "warranty": "1 line", "maintenance_note": "1 line recommending a maintenance plan"}}"""


@router.post("/ai/proposal", response_model=Proposal)
async def generate_proposal(req: ProposalRequest):
    brief = (
        f"Property type: {req.property_type}; Area: {req.area_sqft} sq ft; Location: {req.location}, Gurgaon; "
        f"Desired features: {', '.join(req.features) or 'open to recommendation'}; "
        f"Budget range: {req.budget_range or 'suggest sensibly'}; Notes: {req.notes or 'none'}"
    )
    try:
        data = await complete_json(new_session("proposal"), PROPOSAL_SYSTEM, brief)
        today = datetime.now(timezone.utc).strftime("%Y%m%d")
        proposal = Proposal(**data, reference=f"AJH-{today}-{uuid.uuid4().hex[:4].upper()}")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI is unavailable right now, please retry. ({exc})")
    await save_lead(
        LeadCreate(
            name=req.name, phone=req.phone, source="proposal", interest=f"{req.property_type} proposal",
            location=req.location, property_type=req.property_type, area_sqft=req.area_sqft or None,
            message=brief,
        )
    )
    return proposal


# ---------------------------------------------------------------- Image generation models

class ImageModelOut(BaseModel):
    id: str
    label: str
    provider: str
    note: str
    available: bool


@router.get("/ai/image-models", response_model=List[ImageModelOut])
async def image_models():
    """Which image-generation models this deployment can use right now."""
    return [ImageModelOut(**m.__dict__) for m in available_models()]


class VisualizeRequest(ContactRequired):
    space_type: str = "terrace"
    style: str = "modern biophilic"
    description: str = ""
    image_model: Optional[str] = None


class VisualizeResult(BaseModel):
    image_url: str
    image_model: str
    prompt_used: str
    caption: str = ""


VISUALIZER_SYSTEM = f"""You write image-generation art direction for AJ Heaven's Harvest Nursery, Gurgaon.
{GURGAON_CONTEXT}
Given a customer's rough description of the garden they dream of, write ONE vivid, concrete visual paragraph (max 70 words) describing the finished space: plants by name, planters, flooring, lighting, seating, mood and time of day. Plants must be ones that survive Gurgaon. Reply with ONLY a JSON object:
{{"visual": "the paragraph", "caption": "a short 12-word caption for the rendered image"}}"""


@router.post("/ai/visualize", response_model=VisualizeResult)
async def visualize(req: VisualizeRequest):
    """Standalone AI Garden Visualizer — turn a text wish into a rendered garden image."""
    brief = f"Space: {req.space_type}. Style wanted: {req.style}. Customer description: {req.description or 'open to ideas'}"
    visual = req.description
    caption = ""
    try:
        data = await complete_json(new_session("visualizer"), VISUALIZER_SYSTEM, brief)
        visual = data.get("visual") or visual
        caption = data.get("caption", "")
    except Exception:
        pass  # art direction is a bonus; the raw description still renders

    prompt = garden_prompt(req.space_type, req.style, visual)
    try:
        url, model = await generate_image(prompt, req.image_model)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Image generation is unavailable right now. ({exc})")

    await save_lead(
        LeadCreate(
            name=req.name, phone=req.phone, source="visualizer",
            interest=f"{req.space_type} garden visualisation", message=brief,
        )
    )
    return VisualizeResult(image_url=url, image_model=model, prompt_used=prompt, caption=caption)


class RegenerateRequest(BaseModel):
    space_type: str
    style: str
    description: str
    image_model: Optional[str] = None


@router.post("/ai/regenerate-concept-image", response_model=VisualizeResult)
async def regenerate_concept_image(req: RegenerateRequest):
    """Re-render a single designer concept, optionally on a different model."""
    prompt = garden_prompt(req.space_type, req.style, req.description)
    try:
        url, model = await generate_image(prompt, req.image_model)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Image generation is unavailable right now. ({exc})")
    return VisualizeResult(image_url=url, image_model=model, prompt_used=prompt)
