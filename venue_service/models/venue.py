from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey
from datetime import datetime
from database import Base

class Venue(Base):
    __tablename__ = "venues"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    city = Column(String, index=True)
    description = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    rating = Column(Float, default=0.0)
    capacity = Column(Integer)
    price_per_hour = Column(Float)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class VenueTimeSlot(Base):
    __tablename__ = "venue_time_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    venue_id = Column(Integer, ForeignKey("venues.id"), index=True)
    date = Column(String, index=True)  # YYYY-MM-DD format
    time = Column(String)  # HH:MM format
    available = Column(Boolean, default=True, index=True)
    booked_by = Column(Integer, nullable=True)  # user_id of who booked it
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class VenueReview(Base):
    __tablename__ = "venue_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    venue_id = Column(Integer, ForeignKey("venues.id"), index=True)
    user_id = Column(Integer, index=True)
    rating = Column(Integer)  # 1-5 stars
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
