import uuid
from typing import List

from pydantic import BaseModel, Field


def _uuid() -> str:
    return str(uuid.uuid4())


class Faq(BaseModel):
    q: str
    a: str


class Stat(BaseModel):
    label: str
    value: str


class ProcessStep(BaseModel):
    title: str
    detail: str


class Plant(BaseModel):
    id: str = Field(default_factory=_uuid)
    slug: str
    name: str
    category: str  # indoor | outdoor | flowering | succulent | bonsai | air-purifying | herb
    tags: List[str] = []
    price: int = 0  # INR
    sunlight: str = "medium"  # low | medium | direct
    maintenance: str = "medium"  # low | medium | high
    locations: List[str] = []  # balcony | bedroom | living_room | office | terrace | garden
    description: str = ""
    image_url: str = ""
    badges: List[str] = []  # pet_safe | air_purifying | flowering | night_oxygen | rare | hardy
    in_stock: bool = True


class Service(BaseModel):
    id: str = Field(default_factory=_uuid)
    slug: str
    name: str
    short: str
    hero_image: str = ""
    description: List[str] = []
    features: List[str] = []
    process: List[ProcessStep] = []
    price_from: int = 0
    faqs: List[Faq] = []
    stats: List[Stat] = []


class LocationPage(BaseModel):
    id: str = Field(default_factory=_uuid)
    slug: str
    name: str
    region: str = "Gurgaon"
    intro: str = ""
    microclimate: str = ""
    soil_note: str = ""
    best_plants: List[str] = []
    popular_services: List[str] = []
    neighborhoods: List[str] = []
    faqs: List[Faq] = []
    image_url: str = ""


class Project(BaseModel):
    id: str = Field(default_factory=_uuid)
    title: str
    location: str
    category: str
    summary: str
    image_url: str = ""
    area: str = ""
    duration: str = ""
    budget_band: str = ""
    highlights: List[str] = []


class Plan(BaseModel):
    id: str = Field(default_factory=_uuid)
    slug: str
    name: str
    price: int
    cadence: str
    tagline: str = ""
    features: List[str] = []
    popular: bool = False
