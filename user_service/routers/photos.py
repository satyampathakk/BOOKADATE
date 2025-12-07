from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from config import UPLOAD_DIR
from database import get_db
from models.user import User, Photo
import uuid, os, shutil

router = APIRouter()

@router.post("/{user_id}/photos")
def upload_photo(user_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    photo = Photo(user_id=user_id, filepath=filepath)
    db.add(photo)

    if user.profile_photo is None:
        user.profile_photo = filepath

    db.commit()

    return {"photo_url": filepath}

@router.get("/{user_id}/photos")
def list_photos(user_id: str, db: Session = Depends(get_db)):
    photos = db.query(Photo).filter(Photo.user_id == user_id).all()
    return [p.filepath for p in photos]
