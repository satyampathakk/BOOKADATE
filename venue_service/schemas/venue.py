from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class VenueCreate(BaseModel):
    name: str
    address: str
    city: str
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    capacity: int
    price_per_hour: float

class VenueUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    capacity: Optional[int] = None
    price_per_hour: Optional[float] = None
    is_active: Optional[bool] = None

class VenueResponse(BaseModel):
    id: int
    name: str
    address: str
    city: str
    description: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    rating: float
    capacity: int
    price_per_hour: float
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TimeSlotCreate(BaseModel):
    venue_id: int
    date: str  # YYYY-MM-DD
    time: str  # HH:MM

class TimeSlotResponse(BaseModel):
    id: int
    venue_id: int
    date: str
    time: str
    available: bool
    booked_by: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class VenueReviewCreate(BaseModel):
    venue_id: int
    user_id: int
    rating: int  # 1-5
    comment: Optional[str] = None

class VenueReviewResponse(BaseModel):
    id: int
    venue_id: int
    user_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class TimeSlotBulkCreate(BaseModel):
    venue_id: int
    dates: List[str]  # List of YYYY-MM-DD
    times: List[str]  # List of HH:MM

class VenueListResponse(BaseModel):
    id: int
    name: str
    address: str
    city: str
    rating: float
    price_per_hour: float
    is_active: bool
    
    class Config:
        from_attributes = True
