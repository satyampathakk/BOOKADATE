from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    gender: str
    dob: str
    password: str            # plain password input (will be hashed)
    bio: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None

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
    registration_status: str
    rejection_reason: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class RegistrationOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    gender: str
    dob: str
    bio: Optional[str]
    profile_photo: Optional[str]
    id_document_path: Optional[str]
    selfie_path: Optional[str]
    registration_status: str
    rejection_reason: Optional[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
