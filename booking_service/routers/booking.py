from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
from database import get_db
from models.booking import BlindDateBooking, VenueTimeSlot, BookingStatus
from schemas.booking import (
    BookingRequest,
    VenueApproval,
    TimeApproval,
    BookingConfirmation,
    BlindDateBookingResponse,
    TimeSlotResponse,
    CancelBooking,
)
from typing import List

router = APIRouter(prefix="/bookings", tags=["bookings"])

# -----------------------------
# Create Booking
# -----------------------------
@router.post("/create", response_model=BlindDateBookingResponse)
def create_booking(request: BookingRequest, db: Session = Depends(get_db)):
    """Create a new booking after users are matched"""
    existing = db.query(BlindDateBooking).filter(
        BlindDateBooking.match_id == request.match_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Booking already exists for this match")
    
    booking = BlindDateBooking(
        match_id=request.match_id,
        user_1_id=request.user_1_id,  # Alice
        user_2_id=request.user_2_id,  # Bob
        status=BookingStatus.PENDING_VENUE_APPROVAL
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

# -----------------------------
# Propose Venue
# -----------------------------
@router.post("/propose-venue", response_model=BlindDateBookingResponse)
def propose_venue(booking_id: int, venue_id: int, user_id: int, db: Session = Depends(get_db)):
    """Alice proposes a venue for the date"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id != booking.user_1_id:
        raise HTTPException(status_code=403, detail="Only Alice can propose venue")
    
    booking.user_1_proposed_venue_id = venue_id
    db.commit()
    db.refresh(booking)
    return booking

# -----------------------------
# Approve Venue
# -----------------------------
@router.post("/approve-venue", response_model=BlindDateBookingResponse)
def approve_venue(approval: VenueApproval, user_id: int, db: Session = Depends(get_db)):
    """Bob approves Alice's proposed venue"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == approval.booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id != booking.user_2_id:
        raise HTTPException(status_code=403, detail="Only Bob can approve venue")
    
    if not booking.user_1_proposed_venue_id:
        raise HTTPException(status_code=400, detail="Alice hasn't proposed a venue yet")
    
    booking.venue_id = booking.user_1_proposed_venue_id
    booking.status = BookingStatus.PENDING_TIME_APPROVAL
    
    db.commit()
    db.refresh(booking)
    return booking

# -----------------------------
# Propose Time
# -----------------------------
@router.post("/propose-time", response_model=BlindDateBookingResponse)
def propose_time(booking_id: int, date: str, time: str, user_id: int, db: Session = Depends(get_db)):
    """Alice proposes a date and time for the meeting"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id != booking.user_1_id:
        raise HTTPException(status_code=403, detail="Only Alice can propose time")
    
    booking.user_1_proposed_date = date
    booking.user_1_proposed_time = time
    
    db.commit()
    db.refresh(booking)
    return booking

# -----------------------------
# Approve Time
# -----------------------------
@router.post("/approve-time", response_model=BlindDateBookingResponse)
def approve_time(approval: TimeApproval, user_id: int, db: Session = Depends(get_db)):
    """Bob approves Alice's proposed time"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == approval.booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id != booking.user_2_id:
        raise HTTPException(status_code=403, detail="Only Bob can approve time")
    
    if not booking.user_1_proposed_date or not booking.user_1_proposed_time:
        raise HTTPException(status_code=400, detail="Alice hasn't proposed a time yet")
    
    booking.booking_date = booking.user_1_proposed_date
    booking.booking_time = booking.user_1_proposed_time
    booking.status = BookingStatus.BOTH_APPROVED
    
    db.commit()
    db.refresh(booking)
    return booking

# -----------------------------
# Confirm Booking
# -----------------------------
@router.post("/confirm", response_model=BlindDateBookingResponse)
def confirm_booking(confirmation: BookingConfirmation, db: Session = Depends(get_db)):
    """Confirm the booking when Bob approved venue and time"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == confirmation.booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status != BookingStatus.BOTH_APPROVED:
        raise HTTPException(status_code=400, detail="Venue and time must be approved first")
    
    booking.status = BookingStatus.CONFIRMED
    booking.confirmation_code = str(uuid.uuid4())[:8].upper()
    
    db.commit()
    db.refresh(booking)
    return booking

# -----------------------------
# Cancel Booking
# -----------------------------
@router.post("/cancel", response_model=BlindDateBookingResponse)
def cancel_booking(cancel: CancelBooking, db: Session = Depends(get_db)):
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == cancel.booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Booking is already cancelled")
    
    booking.status = BookingStatus.CANCELLED
    db.commit()
    db.refresh(booking)
    return booking

# -----------------------------
# Complete Booking
# -----------------------------
@router.post("/complete/{booking_id}", response_model=BlindDateBookingResponse)
def complete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = BookingStatus.COMPLETED
    db.commit()
    db.refresh(booking)
    return booking

# -----------------------------
# Get Booking Details
# -----------------------------
@router.get("/{booking_id}", response_model=BlindDateBookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

# -----------------------------
# Get All Bookings for User
# -----------------------------
@router.get("/user/{user_id}", response_model=List[BlindDateBookingResponse])
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    bookings = db.query(BlindDateBooking).filter(
        (BlindDateBooking.user_1_id == user_id) | (BlindDateBooking.user_2_id == user_id)
    ).all()
    return bookings

# -----------------------------
# Get Available Times for Venue
# -----------------------------
@router.get("/available-times/{venue_id}", response_model=List[TimeSlotResponse])
def get_available_times(venue_id: int, date: str, db: Session = Depends(get_db)):
    slots = db.query(VenueTimeSlot).filter(
        VenueTimeSlot.venue_id == venue_id,
        VenueTimeSlot.date == date,
        VenueTimeSlot.available == True
    ).all()
    
    if not slots:
        raise HTTPException(status_code=404, detail="No available time slots for this venue on this date")
    
    return slots
