# Matching Service - Handling Gender Imbalances

## Problem Statement
When there's an imbalance in users (e.g., 3 males seeking females but 0 females seeking males), users shouldn't get errors. They should be able to wait for a match.

## Solution: Matching Queue System

### 1. **Data Models Added**

#### MatchingQueue
- **Purpose:** Tracks users waiting for matches when no compatible users are available
- **Fields:**
  - `user_id`: User waiting for a match
  - `gender` & `seeking_gender`: User's gender preferences
  - `position_in_queue`: Queue position (lower = higher priority)
  - `waiting_since`: Timestamp for fairness (first-come-first-served)

#### RejectedMatch
- **Purpose:** Track rejected matches to prevent showing same user twice
- **Prevents:** "I already said no to this person" problem
- **Fields:**
  - `user_1_id`, `user_2_id`: The rejected pair
  - `rejection_reason`: Optional reason for rejection

### 2. **Smart Matching Logic**

#### Step 1: Check for Direct Matches
- Find users of opposite gender with matching preferences
- **Exclude previously rejected users**

#### Step 2: If Match Found
- Return the user with **longest wait time** (fair queuing)
- Create match record with PENDING status

#### Step 3: If NO Match Found
- **Instead of error**, add user to waiting queue
- Return status: "WAITING"
- User can check queue position anytime

### 3. **New Queue Management Endpoints**

#### Get Queue Status
```
GET /matches/queue/status/{user_id}
```
Response:
```json
{
  "status": "waiting",
  "position": 2,
  "users_ahead": 1,
  "waiting_since": "2026-01-06T10:30:00",
  "seeking_gender": "female"
}
```

#### Check Available Matches
```
GET /matches/queue/available/{gender}
```
Response:
```json
{
  "gender": "male",
  "available_matches": 5,
  "waiting_in_queue": 3,
  "imbalance_ratio": 0.375
}
```

#### Leave Queue
```
DELETE /matches/queue/{user_id}
```

### 4. **Example Scenarios**

#### Scenario A: 3 Males, 0 Females
1. Male 1 requests match → Added to queue (position 1)
2. Male 2 requests match → Added to queue (position 2)
3. Male 3 requests match → Added to queue (position 3)
4. Female joins → Matches with Male 1 (longest wait)

#### Scenario B: User Rejects Same Person Twice
1. Male A rejects Female B → Stored in RejectedMatch table
2. Later: Male A searches again
3. Female B excluded from results automatically
4. Male A won't see Female B again

#### Scenario C: Imbalance Reporting
- Admin calls `/matches/queue/available/female`
- Gets imbalance ratio: 0.6 (60% more males than females)
- Can use this for marketing: "We need more females!"

### 5. **Match Status States**

| Status | Meaning |
|--------|---------|
| `PENDING` | Both users can approve/reject |
| `MATCHED` | Both users approved ✓ |
| `REJECTED` | At least one user rejected |
| `WAITING` | No compatible user available yet |
| `EXPIRED` | (For future: Pending for >30 days) |
| `ACCEPTED` | Legacy status |

### 6. **Flow Diagram**

```
User requests match
        ↓
Check if already matched ✗
        ↓
Find compatible users (exclude rejected)
        ↓
    Found? ─ YES → Create PENDING match
        │
        NO
        ↓
    Add to waiting queue
        ↓
    Return status: WAITING
        ↓
(Periodically check: If opposite gender joins)
        ↓
    Automatically create match from queue
```

### 7. **Auto-Match from Queue** (Future Enhancement)

Consider implementing a background job that:
1. Every time a new user joins
2. Check all waiting users of opposite gender
3. Auto-match with oldest waiting user
4. Notify both users

```python
# Example (not implemented yet)
@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(auto_match_waiting_users())

async def auto_match_waiting_users():
    while True:
        await asyncio.sleep(60)  # Check every 60 seconds
        # Find users in queue and opposite gender matches
        # Create matches automatically
```

### 8. **Key Benefits**

✅ **No errors** - Users wait instead of getting "no matches" error  
✅ **Fair matching** - FIFO queue ensures oldest waiting user gets matched first  
✅ **Track rejections** - Won't show same person twice  
✅ **Visibility** - Users can see their queue position and progress  
✅ **Admin insights** - Know the imbalance ratio to guide marketing  
✅ **Scalable** - Works for any gender/preference combination  

---

## Implementation Summary

All changes have been made to:
- `models/matching.py` - Added MatchingQueue & RejectedMatch models
- `routers/matching.py` - Updated find_match() logic + new queue endpoints
