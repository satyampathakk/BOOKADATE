from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.faceauth import FaceValidation
from schemas.faceauth import FaceValidationOut
from services.face_recognition import verify_face

router = APIRouter()

@router.post("/verify/{user_id}", response_model=FaceValidationOut)
async def verify_user_face(
    user_id: str,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Run AI model to determine validity
    is_valid, confidence = await verify_face(image)

    if not is_valid:
        raise HTTPException(status_code=401, detail="Face validation failed")

    # Save validation result
    record = FaceValidation(
        user_id=user_id,
        is_validated=True,
        confidence=confidence
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@router.get("/status/{user_id}", response_model=FaceValidationOut)
def get_validation_status(user_id: str, db: Session = Depends(get_db)):
    record = db.query(FaceValidation).filter_by(user_id=user_id).order_by(
        FaceValidation.created_at.desc()
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="No validation found")

    return record
