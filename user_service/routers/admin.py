from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models.user import User
from schemas.user import RegistrationOut

router = APIRouter()

# -------------------------------
# Hard-coded admin credentials
# -------------------------------
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "SuperSecret123"

class AdminCreds(BaseModel):
    email: str
    password: str

class AdminCredsWithStatus(BaseModel):
    email: str
    password: str
    status: Optional[str] = None

class RejectPayload(BaseModel):
    email: str
    password: str
    reason: str

def admin_check(creds: AdminCreds):
    """Simple hard-coded admin check"""
    if creds.email != ADMIN_EMAIL or creds.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    return True

# -------------------------------
# Admin APIs - All using POST method
# -------------------------------

@router.post("/auth")
def admin_auth(creds: AdminCreds):
    """Admin authentication endpoint"""
    admin_check(creds)
    return {
        "message": "Admin authenticated successfully",
        "admin": True,
        "email": ADMIN_EMAIL
    }

@router.post("/registrations", response_model=List[RegistrationOut])
def list_registrations(
    payload: AdminCredsWithStatus,
    db: Session = Depends(get_db)
):
    """List registrations - POST method with credentials in body"""
    admin_check(AdminCreds(email=payload.email, password=payload.password))
    
    query = db.query(User)
    if payload.status:
        query = query.filter(User.registration_status == payload.status)
    return query.order_by(User.created_at.desc()).all()

@router.post("/registrations/{user_id}", response_model=RegistrationOut)
def get_registration(
    user_id: str,
    creds: AdminCreds,
    db: Session = Depends(get_db)
):
    """Get single registration - POST method"""
    admin_check(creds)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/registrations/{user_id}/approve", response_model=RegistrationOut)
def approve_registration(
    user_id: str,
    creds: AdminCreds,
    db: Session = Depends(get_db)
):
    """Approve user registration"""
    admin_check(creds)
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

@router.post("/registrations/{user_id}/reject", response_model=RegistrationOut)
def reject_registration(
    user_id: str,
    payload: RejectPayload,
    db: Session = Depends(get_db)
):
    """Reject user registration"""
    admin_check(AdminCreds(email=payload.email, password=payload.password))

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.registration_status = "rejected"
    user.verified = False
    user.rejection_reason = payload.reason

    db.commit()
    db.refresh(user)
    return user
