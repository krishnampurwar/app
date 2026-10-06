from typing import List, Optional

from fastapi import APIRouter, HTTPException

from lib.db import db
from models.catalog import LocationPage, Plan, Plant, Project, Service

router = APIRouter()


@router.get("/plants", response_model=List[Plant])
async def list_plants(
    category: Optional[str] = None,
    sunlight: Optional[str] = None,
    maintenance: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
):
    q: dict = {}
    if category:
        q["category"] = category
    if sunlight:
        q["sunlight"] = sunlight
    if maintenance:
        q["maintenance"] = maintenance
    if location:
        q["locations"] = location
    if search:
        q["name"] = {"$regex": search, "$options": "i"}
    docs = await db.plants.find(q).sort("price", 1).to_list(500)
    return [Plant(**d) for d in docs]


@router.get("/plants/{slug}", response_model=Plant)
async def get_plant(slug: str):
    doc = await db.plants.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="plant not found")
    return Plant(**doc)


@router.get("/services", response_model=List[Service])
async def list_services():
    docs = await db.services.find().to_list(100)
    return [Service(**d) for d in docs]


@router.get("/services/{slug}", response_model=Service)
async def get_service(slug: str):
    doc = await db.services.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="service not found")
    return Service(**doc)


@router.get("/locations", response_model=List[LocationPage])
async def list_locations():
    docs = await db.locations.find().to_list(100)
    return [LocationPage(**d) for d in docs]


@router.get("/locations/{slug}", response_model=LocationPage)
async def get_location(slug: str):
    doc = await db.locations.find_one({"slug": slug})
    if not doc:
        raise HTTPException(status_code=404, detail="location not found")
    return LocationPage(**doc)


@router.get("/projects", response_model=List[Project])
async def list_projects():
    docs = await db.projects.find().to_list(100)
    return [Project(**d) for d in docs]


@router.get("/plans", response_model=List[Plan])
async def list_plans():
    docs = await db.plans.find().to_list(20)
    return [Plan(**d) for d in docs]
