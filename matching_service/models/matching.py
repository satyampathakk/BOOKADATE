from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base

class MatchStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    MATCHED = "matched"
    WAITING = "waiting"
    EXPIRED = "expired"

class UserPreference(Base):
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True)
    gender = Column(String, index=True)  # male, female, other
    seeking_gender = Column(String)  # male, female, other
    age_min = Column(Integer)
    age_max = Column(Integer)
    interests = Column(String)  # JSON string of interests
    bio = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_1_id = Column(Integer, index=True)
    user_2_id = Column(Integer, index=True)
    status = Column(Enum(MatchStatus), default=MatchStatus.PENDING, index=True)
    user_1_approved = Column(Boolean, default=False)
    user_2_approved = Column(Boolean, default=False)
    matched_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class MatchingQueue(Base):
    """Queue for users waiting for matches"""
    __tablename__ = "matching_queue"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True)
    gender = Column(String, index=True)
    seeking_gender = Column(String, index=True)
    position_in_queue = Column(Integer)
    waiting_since = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class RejectedMatch(Base):
    """Track rejected matches to avoid re-matching"""
    __tablename__ = "rejected_matches"
    
    id = Column(Integer, primary_key=True, index=True)
    user_1_id = Column(Integer, index=True)
    user_2_id = Column(Integer, index=True)
    rejection_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
