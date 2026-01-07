from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from database import get_db
from models.venue import Venue, VenueTimeSlot, VenueReview
from schemas.venue import (
    VenueCreate,
    VenueUpdate,
    VenueResponse,
    TimeSlotCreate,
    TimeSlotResponse,
    VenueReviewCreate,
    VenueReviewResponse,
    TimeSlotBulkCreate,
    VenueListResponse,
)
from typing import List

router = APIRouter(prefix="/venues", tags=["venues"])

# ==================== VENUE MANAGEMENT ====================

@router.post("/", response_model=VenueResponse)
def create_venue(venue: VenueCreate, db: Session = Depends(get_db)):
    """Create a new venue (Admin only)"""
    db_venue = Venue(**venue.dict())
    db.add(db_venue)
    db.commit()
    db.refresh(db_venue)
    return db_venue

@router.get("/", response_model=List[VenueListResponse])
def list_venues(city: str = None, active_only: bool = True, db: Session = Depends(get_db)):
    """List all venues with optional city filter"""
    query = db.query(Venue)
    
    if active_only:
        query = query.filter(Venue.is_active == True)
    
    if city:
        query = query.filter(Venue.city == city)
    
    return query.all()

@router.get("/{venue_id}", response_model=VenueResponse)
def get_venue(venue_id: int, db: Session = Depends(get_db)):
    """Get venue details"""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue

@router.put("/{venue_id}", response_model=VenueResponse)
def update_venue(venue_id: int, venue: VenueUpdate, db: Session = Depends(get_db)):
    """Update venue details (Admin only)"""
    db_venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not db_venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    update_data = venue.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_venue, key, value)
    
    db.commit()
    db.refresh(db_venue)
    return db_venue

@router.delete("/{venue_id}")
def delete_venue(venue_id: int, db: Session = Depends(get_db)):
    """Delete a venue (Admin only)"""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    db.delete(venue)
    db.commit()
    return {"message": "Venue deleted successfully"}

# ==================== TIME SLOT MANAGEMENT ====================

@router.post("/timeslots/", response_model=TimeSlotResponse)
def create_time_slot(slot: TimeSlotCreate, db: Session = Depends(get_db)):
    """Create a new time slot for a venue"""
    # Check if venue exists
    venue = db.query(Venue).filter(Venue.id == slot.venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    # Check if time slot already exists
    existing = db.query(VenueTimeSlot).filter(
        and_(
            VenueTimeSlot.venue_id == slot.venue_id,
            VenueTimeSlot.date == slot.date,
            VenueTimeSlot.time == slot.time
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Time slot already exists")
    
    db_slot = VenueTimeSlot(**slot.dict())
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot

@router.post("/timeslots/bulk", response_model=List[TimeSlotResponse])
def bulk_create_time_slots(bulk: TimeSlotBulkCreate, db: Session = Depends(get_db)):
    """Create multiple time slots for a venue"""
    # Check if venue exists
    venue = db.query(Venue).filter(Venue.id == bulk.venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    created_slots = []
    for date in bulk.dates:
        for time in bulk.times:
            # Check if time slot already exists
            existing = db.query(VenueTimeSlot).filter(
                and_(
                    VenueTimeSlot.venue_id == bulk.venue_id,
                    VenueTimeSlot.date == date,
                    VenueTimeSlot.time == time
                )
            ).first()
            
            if not existing:
                db_slot = VenueTimeSlot(
                    venue_id=bulk.venue_id,
                    date=date,
                    time=time
                )
                db.add(db_slot)
                created_slots.append(db_slot)
    
    db.commit()
    for slot in created_slots:
        db.refresh(slot)
    
    return created_slots

@router.get("/{venue_id}/timeslots", response_model=List[TimeSlotResponse])
def get_venue_time_slots(venue_id: int, date: str = None, available_only: bool = True, db: Session = Depends(get_db)):
    """Get available time slots for a venue"""
    query = db.query(VenueTimeSlot).filter(VenueTimeSlot.venue_id == venue_id)
    
    if available_only:
        query = query.filter(VenueTimeSlot.available == True)
    
    if date:
        query = query.filter(VenueTimeSlot.date == date)
    
    return query.all()

@router.delete("/timeslots/{slot_id}")
def delete_time_slot(slot_id: int, db: Session = Depends(get_db)):
    """Delete a time slot"""
    slot = db.query(VenueTimeSlot).filter(VenueTimeSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    db.delete(slot)
    db.commit()
    return {"message": "Time slot deleted successfully"}

@router.put("/timeslots/{slot_id}/mark-unavailable")
def mark_slot_unavailable(slot_id: int, db: Session = Depends(get_db)):
    """Mark a time slot as unavailable"""
    slot = db.query(VenueTimeSlot).filter(VenueTimeSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    slot.available = False
    db.commit()
    return {"message": "Time slot marked as unavailable"}

@router.put("/timeslots/{slot_id}/mark-available")
def mark_slot_available(slot_id: int, db: Session = Depends(get_db)):
    """Mark a time slot as available"""
    slot = db.query(VenueTimeSlot).filter(VenueTimeSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    
    slot.available = True
    slot.booked_by = None
    db.commit()
    return {"message": "Time slot marked as available"}

# ==================== REVIEW MANAGEMENT ====================

@router.post("/reviews/", response_model=VenueReviewResponse)
def add_venue_review(review: VenueReviewCreate, db: Session = Depends(get_db)):
    """Add a review for a venue"""
    # Check if venue exists
    venue = db.query(Venue).filter(Venue.id == review.venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    db_review = VenueReview(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Update venue rating
    all_reviews = db.query(VenueReview).filter(VenueReview.venue_id == review.venue_id).all()
    avg_rating = sum([r.rating for r in all_reviews]) / len(all_reviews)
    venue.rating = avg_rating
    db.commit()
    
    return db_review

@router.get("/{venue_id}/reviews", response_model=List[VenueReviewResponse])
def get_venue_reviews(venue_id: int, db: Session = Depends(get_db)):
    """Get all reviews for a venue"""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    reviews = db.query(VenueReview).filter(VenueReview.venue_id == venue_id).all()
    return reviews

@router.delete("/reviews/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    """Delete a venue review"""
    review = db.query(VenueReview).filter(VenueReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    venue_id = review.venue_id
    db.delete(review)
    db.commit()
    
    # Update venue rating
    all_reviews = db.query(VenueReview).filter(VenueReview.venue_id == venue_id).all()
    if all_reviews:
        avg_rating = sum([r.rating for r in all_reviews]) / len(all_reviews)
        venue = db.query(Venue).filter(Venue.id == venue_id).first()
        venue.rating = avg_rating
        db.commit()
    
    return {"message": "Review deleted successfully"}

# ==================== ANALYTICS ====================

@router.get("/{venue_id}/stats")
def get_venue_stats(venue_id: int, db: Session = Depends(get_db)):
    """Get statistics for a venue"""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    total_slots = db.query(VenueTimeSlot).filter(VenueTimeSlot.venue_id == venue_id).count()
    available_slots = db.query(VenueTimeSlot).filter(
        and_(VenueTimeSlot.venue_id == venue_id, VenueTimeSlot.available == True)
    ).count()
    booked_slots = total_slots - available_slots
    reviews = db.query(VenueReview).filter(VenueReview.venue_id == venue_id).all()
    
    return {
        "venue_id": venue_id,
        "venue_name": venue.name,
        "total_time_slots": total_slots,
        "available_slots": available_slots,
        "booked_slots": booked_slots,
        "average_rating": venue.rating,
        "total_reviews": len(reviews),
        "price_per_hour": venue.price_per_hour,
        "capacity": venue.capacity,
    }
