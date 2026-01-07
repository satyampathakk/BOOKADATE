from sqlalchemy import Column, Integer, String, DateTime, Enum, Float, Boolean, ForeignKey
from datetime import datetime
import enum
from database import Base

class BookingStatus(str, enum.Enum):
    PENDING_VENUE_APPROVAL = "pending_venue_approval"
    PENDING_TIME_APPROVAL = "pending_time_approval"
    BOTH_APPROVED = "both_approved"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class VenueTimeSlot(Base):
    __tablename__ = "venue_time_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    venue_id = Column(Integer, index=True)
    date = Column(String)  # YYYY-MM-DD format
    time = Column(String)  # HH:MM format
    available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class BlindDateBooking(Base):
    __tablename__ = "blind_date_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, index=True)
    user_1_id = Column(Integer, index=True)
    user_2_id = Column(Integer, index=True)
    
    # Proposed by user_1
    user_1_proposed_venue_id = Column(Integer, nullable=True)
    user_1_proposed_date = Column(String, nullable=True)
    user_1_proposed_time = Column(String, nullable=True)
    
    # Proposed by user_2
    user_2_proposed_venue_id = Column(Integer, nullable=True)
    user_2_proposed_date = Column(String, nullable=True)
    user_2_proposed_time = Column(String, nullable=True)
    
    # Final confirmed selections
    venue_id = Column(Integer, nullable=True, index=True)
    booking_date = Column(String, nullable=True)  # YYYY-MM-DD
    booking_time = Column(String, nullable=True)  # HH:MM
    
    # Approval tracking
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING_VENUE_APPROVAL, index=True)
    user_1_venue_approved = Column(Boolean, default=False)
    user_2_venue_approved = Column(Boolean, default=False)
    user_1_time_approved = Column(Boolean, default=False)
    user_2_time_approved = Column(Boolean, default=False)
    
    confirmation_code = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
