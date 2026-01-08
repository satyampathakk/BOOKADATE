from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
import jwt
import os
import uuid
import shutil
import logging

from database import get_db
from models.user import User
from config import UPLOAD_DIR

# ------------------------------------------------------------------
# CONFIG
# ------------------------------------------------------------------
SECRET_KEY = os.getenv("USER_SERVICE_SECRET", "dev-secret-key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))

router = APIRouter()
logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# PASSWORD CONTEXT (ARGON2 — FIXED)
# ------------------------------------------------------------------
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)

# ------------------------------------------------------------------
# SCHEMAS
# ------------------------------------------------------------------
class SignupResponse(BaseModel):
    user_id: str
    registration_status: str
    message: str

class LoginData(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: EmailStr

# ------------------------------------------------------------------
# HELPERS
# ------------------------------------------------------------------
def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def _persist_upload(file: UploadFile, target_dir: str) -> str:
    os.makedirs(target_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(target_dir, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return filepath

# ------------------------------------------------------------------
# ROUTES
# ------------------------------------------------------------------
@router.post("/signup", response_model=SignupResponse)
async def signup(
    name: str = Form(...),
    email: EmailStr = Form(...),
    phone: str = Form(...),
    gender: str = Form(...),
    dob: str = Form(...),
    password: str = Form(...),
    bio: str | None = Form(None),
    id_document: UploadFile = File(...),
    selfie: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        user_id = str(uuid.uuid4())
        password_hash = hash_password(password)

        id_dir = os.path.join(UPLOAD_DIR, "id_documents")
        selfie_dir = os.path.join(UPLOAD_DIR, "selfies")

        id_document_path = _persist_upload(id_document, id_dir)
        selfie_path = _persist_upload(selfie, selfie_dir)

        new_user = User(
            id=user_id,
            name=name,
            email=email,
            phone=phone,
            gender=gender,
            dob=dob,
            bio=bio,
            password_hash=password_hash,
            registration_status="pending",  # change to "pending" if needed
            verified=True,
            kyc_level="verified",
            id_document_path=id_document_path,
            selfie_path=selfie_path,
        )

        db.add(new_user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Email already exists")

        db.refresh(new_user)

        return SignupResponse(
            user_id=user_id,
            registration_status=new_user.registration_status,
            message="Signup successful",
        )

    except HTTPException:
        raise
    except Exception:
        logger.exception("Signup failed")
        raise HTTPException(status_code=500, detail="Signup failed")

@router.post("/login", response_model=TokenOut)
def login(data: LoginData, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.registration_status != "approved":
        raise HTTPException(
            status_code=403,
            detail=f"Registration {user.registration_status or 'pending'}"
        )

    token = create_access_token(user_id=user.id, email=user.email)

    return TokenOut(
        access_token=token,
        user_id=user.id,
        email=user.email,
    )

@router.post("/verify-token")
def verify_token(request: Request):
    auth = request.headers.get("Authorization")

    if not auth or not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = auth.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "user_id": payload.get("sub"),
            "email": payload.get("email"),
            "token_valid": True,
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
