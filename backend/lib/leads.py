"""Lead creation + rule-based Hot/Warm/Cold scoring, shared by every lead source."""

from datetime import datetime, timezone

from lib.db import db
from models.leads import Lead, LeadCreate


def score_lead(lead: LeadCreate) -> str:
    """HOT: budget >= Rs 1L, or a photo plus a callback number. WARM: reachable with phone. COLD: anonymous browsing."""
    budget_hot = (lead.budget_min or 0) >= 100000 or (lead.budget_max or 0) >= 100000
    if budget_hot:
        return "hot"
    if lead.has_photo and lead.phone:
        return "hot"
    if lead.phone:
        return "warm"
    return "cold"


async def save_lead(lead: LeadCreate) -> Lead:
    obj = Lead(**lead.model_dump(), score=score_lead(lead))
    await db.leads.insert_one(obj.model_dump())
    return obj
