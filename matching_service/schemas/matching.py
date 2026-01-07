from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserPreferenceCreate(BaseModel):
    user_id: int
    gender: str
    seeking_gender: str
    age_min: int
    age_max: int
    interests: Optional[str] = None
    bio: Optional[str] = None

class UserPreferenceUpdate(BaseModel):
    gender: Optional[str] = None
    seeking_gender: Optional[str] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    interests: Optional[str] = None
    bio: Optional[str] = None

class UserPreferenceResponse(BaseModel):
    id: int
    user_id: int
    gender: str
    seeking_gender: str
    age_min: int
    age_max: int
    interests: Optional[str]
    bio: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class MatchCreate(BaseModel):
    user_id: int

class MatchApproval(BaseModel):
    match_id: int
    approved: bool

class MatchResponse(BaseModel):
    id: int
    user_1_id: int
    user_2_id: Optional[int]
    status: str
    user_1_approved: bool
    user_2_approved: bool
    matched_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserMatchInfo(BaseModel):
    user_id: int
    gender: str
    age_min: int
    age_max: int
    interests: Optional[str]
    bio: Optional[str]
    
    class Config:
        from_attributes = True

class MatchingQueueResponse(BaseModel):
    id: int
    user_id: int
    gender: str
    seeking_gender: str
    position_in_queue: int
    waiting_since: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class QueueStatusResponse(BaseModel):
    status: str
    position: Optional[int] = None
    users_ahead: Optional[int] = None
    waiting_since: Optional[datetime] = None
    seeking_gender: Optional[str] = None

class RejectedMatchResponse(BaseModel):
    id: int
    user_1_id: int
    user_2_id: int
    rejection_reason: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
