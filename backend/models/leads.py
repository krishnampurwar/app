import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


def _uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class LeadCreate(BaseModel):
    name: str = ""
    phone: str = ""
    email: str = ""
    source: str = "contact"  # contact | maintenance | quiz | plant_doctor | designer | proposal | ask_aj
    interest: str = ""
    location: str = ""
    property_type: str = ""
    area_sqft: Optional[int] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    message: str = ""
    has_photo: bool = False


class Lead(LeadCreate):
    id: str = Field(default_factory=_uuid)
    score: str = "cold"  # hot | warm | cold
    status: str = "new"  # new | in_progress | converted | closed
    created_at: datetime = Field(default_factory=_utcnow)


class AdminLogin(BaseModel):
    pin: str


class LeadStatusUpdate(BaseModel):
    status: str
