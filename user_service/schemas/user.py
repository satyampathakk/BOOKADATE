from pydantic import BaseModel, EmailStr
from typing import Optional

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

    class Config:
        orm_mode = True
