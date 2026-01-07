from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VenueInfo(BaseModel):
    venue_id: int
    name: str
    address: str

class TimeSlotResponse(BaseModel):
    id: int
    venue_id: int
    date: str
    time: str
    available: bool
    
    class Config:
        from_attributes = True

class BookingRequest(BaseModel):
    match_id: int
    user_1_id: int
    user_2_id: int

class VenueApproval(BaseModel):
    booking_id: int
    venue_id: int
    approved: bool

class VenueProposal(BaseModel):
    booking_id: int
    venue_id: int

class TimeApproval(BaseModel):
    booking_id: int
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    approved: bool

class TimeProposal(BaseModel):
    booking_id: int
    date: str  # YYYY-MM-DD
    time: str  # HH:MM

class BookingConfirmation(BaseModel):
    booking_id: int

class BlindDateBookingResponse(BaseModel):
    id: int
    match_id: int
    user_1_id: int
    user_2_id: int
    
    # Proposals
    user_1_proposed_venue_id: Optional[int]
    user_1_proposed_date: Optional[str]
    user_1_proposed_time: Optional[str]
    user_2_proposed_venue_id: Optional[int]
    user_2_proposed_date: Optional[str]
    user_2_proposed_time: Optional[str]
    
    # Final confirmed
    venue_id: Optional[int]
    booking_date: Optional[str]
    booking_time: Optional[str]
    
    # Status
    status: str
    user_1_venue_approved: bool
    user_2_venue_approved: bool
    user_1_time_approved: bool
    user_2_time_approved: bool
    confirmation_code: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class AvailableVenuesResponse(BaseModel):
    venue_id: int
    name: str
    address: str
    rating: Optional[float]
    
    class Config:
        from_attributes = True

class CancelBooking(BaseModel):
    booking_id: int
    reason: Optional[str] = None
