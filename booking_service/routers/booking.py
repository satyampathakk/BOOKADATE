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

@router.post("/create", response_model=BlindDateBookingResponse)
def create_booking(request: BookingRequest, db: Session = Depends(get_db)):
    """Create a new booking after users are matched"""
    # Check if booking already exists for this match
    existing = db.query(BlindDateBooking).filter(
        BlindDateBooking.match_id == request.match_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Booking already exists for this match")
    
    booking = BlindDateBooking(
        match_id=request.match_id,
        user_1_id=request.user_1_id,
        user_2_id=request.user_2_id,
        status=BookingStatus.PENDING_VENUE_APPROVAL
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking

@router.post("/propose-venue", response_model=BlindDateBookingResponse)
def propose_venue(booking_id: int, venue_id: int, user_id: int, db: Session = Depends(get_db)):
    """User proposes a venue for the date"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id not in [booking.user_1_id, booking.user_2_id]:
        raise HTTPException(status_code=403, detail="User not part of this booking")
    
    # Store the proposal
    if user_id == booking.user_1_id:
        booking.user_1_proposed_venue_id = venue_id
    else:
        booking.user_2_proposed_venue_id = venue_id
    
    db.commit()
    db.refresh(booking)
    return booking

@router.post("/approve-venue", response_model=BlindDateBookingResponse)
def approve_venue(approval: VenueApproval, user_id: int, db: Session = Depends(get_db)):
    """Approve other user's proposed venue"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == approval.booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id not in [booking.user_1_id, booking.user_2_id]:
        raise HTTPException(status_code=403, detail="User not part of this booking")
    
    # Get the other user's proposal
    if user_id == booking.user_1_id:
        proposed_venue = booking.user_2_proposed_venue_id
        booking.user_1_venue_approved = True
    else:
        proposed_venue = booking.user_1_proposed_venue_id
        booking.user_2_venue_approved = True
    
    if not proposed_venue:
        raise HTTPException(status_code=400, detail="Other user hasn't proposed a venue yet")
    
    # Check if both approved the same venue
    if booking.user_1_venue_approved and booking.user_2_venue_approved:
        booking.venue_id = proposed_venue
        booking.status = BookingStatus.PENDING_TIME_APPROVAL
    
    db.commit()
    db.refresh(booking)
    return booking

@router.post("/reject-venue", response_model=BlindDateBookingResponse)
def reject_venue(booking_id: int, user_id: int, db: Session = Depends(get_db)):
    """Reject other user's proposed venue"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id not in [booking.user_1_id, booking.user_2_id]:
        raise HTTPException(status_code=403, detail="User not part of this booking")
    
    # Reset approvals
    booking.user_1_venue_approved = False
    booking.user_2_venue_approved = False
    
    db.commit()
    db.refresh(booking)
    return booking

@router.post("/propose-time", response_model=BlindDateBookingResponse)
def propose_time(booking_id: int, date: str, time: str, user_id: int, db: Session = Depends(get_db)):
    """User proposes a date and time for the date"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id not in [booking.user_1_id, booking.user_2_id]:
        raise HTTPException(status_code=403, detail="User not part of this booking")
    
    # Store the proposal
    if user_id == booking.user_1_id:
        booking.user_1_proposed_date = date
        booking.user_1_proposed_time = time
    else:
        booking.user_2_proposed_date = date
        booking.user_2_proposed_time = time
    
    db.commit()
    db.refresh(booking)
    return booking

@router.post("/approve-time", response_model=BlindDateBookingResponse)
def approve_time(approval: TimeApproval, user_id: int, db: Session = Depends(get_db)):
    """Approve other user's proposed time"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == approval.booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id not in [booking.user_1_id, booking.user_2_id]:
        raise HTTPException(status_code=403, detail="User not part of this booking")
    
    # Get the other user's proposal
    if user_id == booking.user_1_id:
        proposed_date = booking.user_2_proposed_date
        proposed_time = booking.user_2_proposed_time
        booking.user_1_time_approved = True
    else:
        proposed_date = booking.user_1_proposed_date
        proposed_time = booking.user_1_proposed_time
        booking.user_2_time_approved = True
    
    if not proposed_date or not proposed_time:
        raise HTTPException(status_code=400, detail="Other user hasn't proposed a time yet")
    
    # Check if both approved the same time
    if booking.user_1_time_approved and booking.user_2_time_approved:
        booking.booking_date = proposed_date
        booking.booking_time = proposed_time
        booking.status = BookingStatus.BOTH_APPROVED
    
    db.commit()
    db.refresh(booking)
    return booking

@router.post("/reject-time", response_model=BlindDateBookingResponse)
def reject_time(booking_id: int, user_id: int, db: Session = Depends(get_db)):
    """Reject other user's proposed time"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id not in [booking.user_1_id, booking.user_2_id]:
        raise HTTPException(status_code=403, detail="User not part of this booking")
    
    # Reset time approvals
    booking.user_1_time_approved = False
    booking.user_2_time_approved = False
    
    db.commit()
    db.refresh(booking)
    return booking

@router.post("/confirm", response_model=BlindDateBookingResponse)
def confirm_booking(confirmation: BookingConfirmation, db: Session = Depends(get_db)):
    """Confirm the booking when both users approve venue and time"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == confirmation.booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status != BookingStatus.BOTH_APPROVED:
        raise HTTPException(status_code=400, detail="Both venue and time must be approved first")
    
    booking.status = BookingStatus.CONFIRMED
    booking.confirmation_code = str(uuid.uuid4())[:8].upper()
    
    db.commit()
    db.refresh(booking)
    return booking

@router.get("/available-times/{venue_id}", response_model=List[TimeSlotResponse])
def get_available_times(venue_id: int, date: str, db: Session = Depends(get_db)):
    """Get available time slots for a venue on a specific date"""
    slots = db.query(VenueTimeSlot).filter(
        VenueTimeSlot.venue_id == venue_id,
        VenueTimeSlot.date == date,
        VenueTimeSlot.available == True
    ).all()
    
    if not slots:
        raise HTTPException(status_code=404, detail="No available time slots for this venue on this date")
    
    return slots

@router.get("/{booking_id}", response_model=BlindDateBookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    """Get booking details"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.get("/{booking_id}/other-proposal/{user_id}")
def view_other_user_proposal(booking_id: int, user_id: int, db: Session = Depends(get_db)):
    """View what the other user proposed for venue and time"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user_id not in [booking.user_1_id, booking.user_2_id]:
        raise HTTPException(status_code=403, detail="User not part of this booking")
    
    if user_id == booking.user_1_id:
        other_user_id = booking.user_2_id
        proposed_venue = booking.user_2_proposed_venue_id
        proposed_date = booking.user_2_proposed_date
        proposed_time = booking.user_2_proposed_time
        other_approved_venue = booking.user_2_venue_approved
        other_approved_time = booking.user_2_time_approved
    else:
        other_user_id = booking.user_1_id
        proposed_venue = booking.user_1_proposed_venue_id
        proposed_date = booking.user_1_proposed_date
        proposed_time = booking.user_1_proposed_time
        other_approved_venue = booking.user_1_venue_approved
        other_approved_time = booking.user_1_time_approved
    
    return {
        "other_user_id": other_user_id,
        "proposed_venue_id": proposed_venue,
        "proposed_date": proposed_date,
        "proposed_time": proposed_time,
        "venue_status": "pending" if proposed_venue and not other_approved_venue else ("approved" if proposed_venue and other_approved_venue else "not_proposed"),
        "time_status": "pending" if proposed_date and not other_approved_time else ("approved" if proposed_date and other_approved_time else "not_proposed"),
        "booking_status": booking.status
    }

@router.get("/user/{user_id}", response_model=List[BlindDateBookingResponse])
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    """Get all bookings for a user"""
    bookings = db.query(BlindDateBooking).filter(
        (BlindDateBooking.user_1_id == user_id) | (BlindDateBooking.user_2_id == user_id)
    ).all()
    return bookings

@router.post("/cancel", response_model=BlindDateBookingResponse)
def cancel_booking(cancel: CancelBooking, db: Session = Depends(get_db)):
    """Cancel a booking"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == cancel.booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Booking is already cancelled")
    
    booking.status = BookingStatus.CANCELLED
    db.commit()
    db.refresh(booking)
    return booking

@router.post("/complete/{booking_id}", response_model=BlindDateBookingResponse)
def complete_booking(booking_id: int, db: Session = Depends(get_db)):
    """Mark booking as completed"""
    booking = db.query(BlindDateBooking).filter(BlindDateBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = BookingStatus.COMPLETED
    db.commit()
    db.refresh(booking)
    return booking
