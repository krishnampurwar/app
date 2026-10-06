import os

from fastapi import APIRouter, Header, HTTPException
from pymongo import ReturnDocument

from lib.db import db
from lib.leads import save_lead
from models.leads import AdminLogin, Lead, LeadCreate, LeadStatusUpdate

router = APIRouter()


def _pin_ok(pin: str | None) -> bool:
    return bool(pin) and pin == os.environ.get("ADMIN_PIN", "9079")


@router.post("/leads", response_model=Lead)
async def create_lead(input: LeadCreate):
    return await save_lead(input)


@router.post("/admin/login")
async def admin_login(input: AdminLogin):
    if not _pin_ok(input.pin):
        raise HTTPException(status_code=401, detail="invalid PIN")
    return {"ok": True}


@router.get("/admin/leads", response_model=list[Lead])
async def admin_leads(x_admin_pin: str | None = Header(default=None)):
    if not _pin_ok(x_admin_pin):
        raise HTTPException(status_code=401, detail="invalid PIN")
    docs = await db.leads.find().sort("created_at", -1).to_list(1000)
    return [Lead(**d) for d in docs]


@router.patch("/admin/leads/{lead_id}", response_model=Lead)
async def update_lead_status(lead_id: str, input: LeadStatusUpdate, x_admin_pin: str | None = Header(default=None)):
    if not _pin_ok(x_admin_pin):
        raise HTTPException(status_code=401, detail="invalid PIN")
    doc = await db.leads.find_one_and_update(
        {"id": lead_id},
        {"$set": {"status": input.status}},
        return_document=ReturnDocument.AFTER,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="lead not found")
    return Lead(**doc)
