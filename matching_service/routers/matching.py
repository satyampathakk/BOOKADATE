from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime
from database import get_db
from models.matching import UserPreference, Match, MatchStatus, MatchingQueue, RejectedMatch
from schemas.matching import (
    UserPreferenceCreate,
    UserPreferenceUpdate,
    UserPreferenceResponse,
    MatchCreate,
    MatchApproval,
    MatchResponse,
)
from typing import List

router = APIRouter(prefix="/matches", tags=["matches"])

@router.post("/preferences", response_model=UserPreferenceResponse)
def create_preference(preference: UserPreferenceCreate, db: Session = Depends(get_db)):
    """Create or update user preferences for matching"""
    existing = db.query(UserPreference).filter(UserPreference.user_id == preference.user_id).first()
    
    if existing:
        for key, value in preference.dict().items():
            setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing
    
    db_preference = UserPreference(**preference.dict())
    db.add(db_preference)
    db.commit()
    db.refresh(db_preference)
    return db_preference

@router.get("/preferences/{user_id}", response_model=UserPreferenceResponse)
def get_preference(user_id: int, db: Session = Depends(get_db)):
    """Get user's matching preferences"""
    preference = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not preference:
        raise HTTPException(status_code=404, detail="User preference not found")
    return preference

@router.put("/preferences/{user_id}", response_model=UserPreferenceResponse)
def update_preference(user_id: int, preference: UserPreferenceUpdate, db: Session = Depends(get_db)):
    """Update user's matching preferences"""
    db_preference = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not db_preference:
        raise HTTPException(status_code=404, detail="User preference not found")
    
    update_data = preference.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_preference, key, value)
    
    db.commit()
    db.refresh(db_preference)
    return db_preference

@router.post("/find", response_model=MatchResponse)
def find_match(request: MatchCreate, db: Session = Depends(get_db)):
    """Find a match for the user based on preferences with queue system for imbalances"""
    user_pref = db.query(UserPreference).filter(UserPreference.user_id == request.user_id).first()
    
    if not user_pref:
        raise HTTPException(status_code=404, detail="User preferences not found")
    
    # Check if user already has a pending or matched match
    existing_match = db.query(Match).filter(
        or_(
            and_(Match.user_1_id == request.user_id, Match.status.in_([MatchStatus.PENDING, MatchStatus.MATCHED])),
            and_(Match.user_2_id == request.user_id, Match.status.in_([MatchStatus.PENDING, MatchStatus.MATCHED]))
        )
    ).first()
    
    if existing_match:
        raise HTTPException(status_code=400, detail="User already has a pending or active match")
    
    # Remove user from queue if they're already in it
    db.query(MatchingQueue).filter(MatchingQueue.user_id == request.user_id).delete()
    
    # Find compatible users (excluding rejected matches)
    rejected_user_ids = db.query(RejectedMatch).filter(
        or_(
            RejectedMatch.user_1_id == request.user_id,
            RejectedMatch.user_2_id == request.user_id
        )
    ).all()
    rejected_ids = [r.user_2_id if r.user_1_id == request.user_id else r.user_1_id for r in rejected_user_ids]
    
    compatible_users = db.query(UserPreference).filter(
        and_(
            UserPreference.user_id != request.user_id,
            UserPreference.seeking_gender == user_pref.gender,
            user_pref.seeking_gender == UserPreference.gender,
            ~UserPreference.user_id.in_(rejected_ids) if rejected_ids else True,
        )
    ).all()
    
    if not compatible_users:
        # No compatible users available - add to waiting queue
        queue_count = db.query(MatchingQueue).filter(
            MatchingQueue.seeking_gender == user_pref.seeking_gender
        ).count()
        
        queue_entry = MatchingQueue(
            user_id=request.user_id,
            gender=user_pref.gender,
            seeking_gender=user_pref.seeking_gender,
            position_in_queue=queue_count + 1
        )
        db.add(queue_entry)
        db.commit()
        
        return {
            "id": -1,
            "user_1_id": request.user_id,
            "user_2_id": None,
            "status": MatchStatus.WAITING,
            "user_1_approved": False,
            "user_2_approved": False,
            "matched_at": None,
            "created_at": datetime.utcnow()
        }
    
    # Select user with longest wait time (fairness)
    matched_user = min(compatible_users, key=lambda u: db.query(MatchingQueue).filter(
        MatchingQueue.user_id == u.user_id
    ).first().waiting_since if db.query(MatchingQueue).filter(
        MatchingQueue.user_id == u.user_id
    ).first() else datetime.utcnow())
    
    # Create match
    match = Match(
        user_1_id=request.user_id,
        user_2_id=matched_user.user_id,
        status=MatchStatus.PENDING
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    
    return match

@router.post("/approve", response_model=MatchResponse)
def approve_match(approval: MatchApproval, user_id: int, db: Session = Depends(get_db)):
    """Approve or reject a match"""
    match = db.query(Match).filter(Match.id == approval.match_id).first()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    if user_id not in [match.user_1_id, match.user_2_id]:
        raise HTTPException(status_code=403, detail="User not part of this match")
    
    if approval.approved:
        if user_id == match.user_1_id:
            match.user_1_approved = True
        else:
            match.user_2_approved = True
        
        # Check if both users approved
        if match.user_1_approved and match.user_2_approved:
            match.status = MatchStatus.MATCHED
            match.matched_at = datetime.utcnow()
    else:
        # Record rejection to avoid re-matching
        rejected = RejectedMatch(
            user_1_id=user_id,
            user_2_id=match.user_2_id if user_id == match.user_1_id else match.user_1_id,
            rejection_reason="User rejected"
        )
        db.add(rejected)
        match.status = MatchStatus.REJECTED
    
    db.commit()
    db.refresh(match)
    return match

@router.get("/user/{user_id}", response_model=List[MatchResponse])
def get_user_matches(user_id: int, db: Session = Depends(get_db)):
    """Get all matches for a user"""
    matches = db.query(Match).filter(
        or_(
            Match.user_1_id == user_id,
            Match.user_2_id == user_id
        )
    ).all()
    return matches

@router.get("/{match_id}", response_model=MatchResponse)
def get_match(match_id: int, db: Session = Depends(get_db)):
    """Get match details"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match

# ==================== WAITING QUEUE MANAGEMENT ====================

@router.get("/queue/status/{user_id}")
def get_queue_status(user_id: int, db: Session = Depends(get_db)):
    """Get user's position in waiting queue"""
    queue_entry = db.query(MatchingQueue).filter(MatchingQueue.user_id == user_id).first()
    
    if not queue_entry:
        return {"status": "not_in_queue"}
    
    # Count how many are ahead
    users_ahead = db.query(MatchingQueue).filter(
        and_(
            MatchingQueue.seeking_gender == queue_entry.seeking_gender,
            MatchingQueue.waiting_since < queue_entry.waiting_since
        )
    ).count()
    
    return {
        "status": "waiting",
        "position": queue_entry.position_in_queue,
        "users_ahead": users_ahead,
        "waiting_since": queue_entry.waiting_since,
        "seeking_gender": queue_entry.seeking_gender
    }

@router.get("/queue/available/{gender}")
def get_available_matches_for_gender(gender: str, db: Session = Depends(get_db)):
    """Get count of available users for a specific gender"""
    male_count = db.query(UserPreference).filter(
        and_(
            UserPreference.gender == gender,
            UserPreference.seeking_gender != gender
        )
    ).count()
    
    female_count = db.query(UserPreference).filter(
        and_(
            UserPreference.gender != gender,
            UserPreference.seeking_gender == gender
        )
    ).count()
    
    queue_waiting = db.query(MatchingQueue).filter(
        MatchingQueue.seeking_gender == gender
    ).count()
    
    return {
        "gender": gender,
        "available_matches": max(male_count, female_count),
        "waiting_in_queue": queue_waiting,
        "imbalance_ratio": abs(male_count - female_count) / max(male_count, female_count, 1)
    }

@router.delete("/queue/{user_id}")
def leave_queue(user_id: int, db: Session = Depends(get_db)):
    """Remove user from waiting queue"""
    queue_entry = db.query(MatchingQueue).filter(MatchingQueue.user_id == user_id).first()
    
    if not queue_entry:
        raise HTTPException(status_code=404, detail="User not in queue")
    
    db.delete(queue_entry)
    db.commit()
    
    return {"message": "User removed from queue"}
