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
    password_hash = Column(String, nullable=True)   # NEW: stores bcrypt hash
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
