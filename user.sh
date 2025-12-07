#!/bin/bash

SERVICE_DIR="user_service"

echo "Creating User Service structure..."

# ───────────────────────────────
# Create directories
# ───────────────────────────────
mkdir -p $SERVICE_DIR/{models,routers,schemas,services}
mkdir -p $SERVICE_DIR/uploads

# ───────────────────────────────
# main.py
# ───────────────────────────────
cat > $SERVICE_DIR/main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, photos, preferences

app = FastAPI(title="User Service (Modular)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(photos.router, prefix="/users", tags=["Photos"])
app.include_router(preferences.router, prefix="/users", tags=["Preferences"])
EOF

# ───────────────────────────────
# config.py
# ───────────────────────────────
cat > $SERVICE_DIR/config.py << 'EOF'
DATABASE_URL = "sqlite:///./users.db"
UPLOAD_DIR = "uploads"
EOF

# ───────────────────────────────
# database.py
# ───────────────────────────────
cat > $SERVICE_DIR/database.py << 'EOF'
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
EOF

# ───────────────────────────────
# models/user.py
# ───────────────────────────────
cat > $SERVICE_DIR/models/user.py << 'EOF'
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    phone = Column(String)
    gender = Column(String)
    dob = Column(String)
    bio = Column(String, nullable=True)
    profile_photo = Column(String, nullable=True)
    verified = Column(Boolean, default=False)
    kyc_level = Column(String, default="none")
    created_at = Column(DateTime, default=datetime.utcnow)

    photos = relationship("Photo", back_populates="user", cascade="all, delete")
    preferences = relationship("Preference", back_populates="user", uselist=False)

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"))
    filepath = Column(String)

    user = relationship("User", back_populates="photos")

class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"))

    min_age = Column(Integer)
    max_age = Column(Integer)
    distance_km = Column(Integer)
    preferred_gender = Column(String)

    user = relationship("User", back_populates="preferences")
EOF

# ───────────────────────────────
# schemas/user.py
# ───────────────────────────────
mkdir -p $SERVICE_DIR/schemas
cat > $SERVICE_DIR/schemas/user.py << 'EOF'
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    gender: str
    dob: str
    bio: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str]
    bio: Optional[str]

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    gender: str
    dob: str
    bio: Optional[str]
    profile_photo: Optional[str]
    verified: bool
    kyc_level: str
    class Config:
        orm_mode = True
EOF

# ───────────────────────────────
# schemas/preferences.py
# ───────────────────────────────
cat > $SERVICE_DIR/schemas/preferences.py << 'EOF'
from pydantic import BaseModel

class PreferencesSchema(BaseModel):
    min_age: int
    max_age: int
    distance_km: int
    preferred_gender: str
EOF

# ───────────────────────────────
# routers/users.py
# ───────────────────────────────
cat > $SERVICE_DIR/routers/users.py << 'EOF'
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.user import UserCreate, UserUpdate, UserOut
import uuid

router = APIRouter()

@router.post("/", response_model=UserOut)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    user_id = str(uuid.uuid4())
    new_user = User(id=user_id, **data.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: str, data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    for key, value in data.dict(exclude_none=True).items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user
EOF

# ───────────────────────────────
# routers/photos.py
# ───────────────────────────────
cat > $SERVICE_DIR/routers/photos.py << 'EOF'
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
EOF

# ───────────────────────────────
# routers/preferences.py
# ───────────────────────────────
cat > $SERVICE_DIR/routers/preferences.py << 'EOF'
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
EOF

echo "✔ User Service structure created successfully!"
