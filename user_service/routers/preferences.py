from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, Preference
from schemas.preferences import PreferencesSchema

router = APIRouter()

@router.put("/{user_id}/preferences")
def update_preferences(user_id: str, prefs: PreferencesSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    existing = db.query(Preference).filter(Preference.user_id == user_id).first()

    if existing:
        for key, value in prefs.dict().items():
            setattr(existing, key, value)
    else:
        pref = Preference(user_id=user_id, **prefs.dict())
        db.add(pref)

    db.commit()
    return prefs.dict()

@router.get("/{user_id}/preferences")
def get_preferences(user_id: str, db: Session = Depends(get_db)):
    prefs = db.query(Preference).filter(Preference.user_id == user_id).first()
    return prefs or {}
