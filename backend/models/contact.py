"""Shared contact-detail validation — name and phone are compulsory on every AI tool."""

import re

from pydantic import BaseModel, field_validator


class ContactRequired(BaseModel):
    """Mixin for request bodies that must carry a reachable lead.

    FastAPI rejects a missing/blank value with 422 before the handler runs, so no AI
    credits are spent on an anonymous request.
    """

    name: str
    phone: str

    @field_validator("name")
    @classmethod
    def _check_name(cls, v: str) -> str:
        v = (v or "").strip()
        if len(v) < 2:
            raise ValueError("Please enter your name")
        return v

    @field_validator("phone")
    @classmethod
    def _check_phone(cls, v: str) -> str:
        v = (v or "").strip()
        digits = re.sub(r"\D", "", v)
        if len(digits) < 10 or len(digits) > 13:
            raise ValueError("Please enter a valid phone number (at least 10 digits)")
        return v
