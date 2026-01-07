from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models.user import User
from schemas.user import RegistrationOut

router = APIRouter()


@router.get("/registrations", response_model=List[RegistrationOut])
def list_registrations(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(User)
    if status:
        query = query.filter(User.registration_status == status)
    return query.order_by(User.created_at.desc()).all()


@router.get("/registrations/{user_id}", response_model=RegistrationOut)
def get_registration(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/registrations/{user_id}/approve", response_model=RegistrationOut)
def approve_registration(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.registration_status == "approved":
        return user

    user.registration_status = "approved"
    user.verified = True
    user.kyc_level = "verified"
    user.rejection_reason = None

    db.commit()
    db.refresh(user)
    return user


class RejectPayload(BaseModel):
    reason: str


@router.post("/registrations/{user_id}/reject", response_model=RegistrationOut)
def reject_registration(user_id: str, payload: RejectPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.registration_status = "rejected"
    user.verified = False
    user.rejection_reason = payload.reason

    db.commit()
    db.refresh(user)
    return user
