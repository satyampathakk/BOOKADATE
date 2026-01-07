# Booking Service - Proposal-Based Two-Way Communication

## Problem Fixed
Previously, users approved in a vacuum without seeing what the other person selected. This made blind date booking confusing and impractical.

## Solution: Proposal & Counter-Proposal System

### **New Workflow**

```
USER 1                          USER 2
  │                               │
  ├─ Propose Venue 1              │
  │  (USER_1_PROPOSED_VENUE_ID)   │
  │                               │
  └─────────► VIEW PROPOSAL ──────┤
              (See Venue 1)        │
                                  │
              ◄─────── APPROVE ────┤
              OR REJECT            │
              (if reject)          │
              └─► Propose Venue 2  │
              
     (When both agree on venue)
     Status: PENDING_TIME_APPROVAL
     
  ├─ Propose Time (Date + Time)   │
  │  (USER_1_PROPOSED_DATE/TIME)  │
  │                               │
  └─────────► VIEW PROPOSAL ──────┤
              (See Date & Time)    │
                                  │
              ◄─────── APPROVE ────┤
              OR REJECT            │
              (if reject)          │
              └─► Propose New Time │
              
     (When both agree on time)
     Status: BOTH_APPROVED
     
  ├─ Confirmation ────────────────┤
  │ (Generates confirmation code) │
     Status: CONFIRMED
```

### **New Database Fields**

```
user_1_proposed_venue_id    | Venue User 1 suggested
user_1_proposed_date        | Date User 1 suggested
user_1_proposed_time        | Time User 1 suggested

user_2_proposed_venue_id    | Venue User 2 suggested
user_2_proposed_date        | Date User 2 suggested
user_2_proposed_time        | Time User 2 suggested

venue_id                    | Final agreed venue
booking_date                | Final agreed date
booking_time                | Final agreed time
```

### **API Endpoints**

#### **Phase 1: Venue Selection**

**1. Propose a Venue**
```
POST /bookings/propose-venue?booking_id=1&venue_id=10&user_id=101
```
Response: Booking with user_1_proposed_venue_id = 10

**2. View Other User's Proposal**
```
GET /bookings/1/other-proposal/101
```
Response:
```json
{
  "other_user_id": 102,
  "proposed_venue_id": 10,
  "proposed_date": null,
  "proposed_time": null,
  "venue_status": "pending",
  "time_status": "not_proposed",
  "booking_status": "pending_venue_approval"
}
```

**3. Approve Other User's Venue**
```
POST /bookings/approve-venue
{
  "booking_id": 1,
  "venue_id": 10
}
```
- When both approve the SAME venue → Status: PENDING_TIME_APPROVAL

**4. Reject Venue (Counter-Propose)**
```
POST /bookings/reject-venue?booking_id=1&user_id=102
```
- Resets approvals
- User can now propose a different venue

---

#### **Phase 2: Time Selection**

**1. Propose a Time**
```
POST /bookings/propose-time?booking_id=1&date=2026-02-14&time=19:00&user_id=101
```
Response: Booking with user_1_proposed_date & user_1_proposed_time

**2. View Other User's Proposal**
```
GET /bookings/1/other-proposal/101
```
Shows the date and time the other user proposed

**3. Approve Other User's Time**
```
POST /bookings/approve-time
{
  "booking_id": 1,
  "date": "2026-02-14",
  "time": "19:00"
}
```
- When both approve the SAME time → Status: BOTH_APPROVED

**4. Reject Time (Counter-Propose)**
```
POST /bookings/reject-time?booking_id=1&user_id=102
```
- User can now propose a different time

---

#### **Phase 3: Confirmation**

**Confirm Booking**
```
POST /bookings/confirm
{
  "booking_id": 1
}
```
- Status: CONFIRMED
- Generates unique confirmation code
- venue_id, booking_date, booking_time are finalized

---

### **Proposal Visibility - Key Feature**

```
USER 2 always sees what USER 1 proposed:
├─ Venue ID → Can look up venue details (name, address, etc)
├─ Date & Time → Can see exact proposed slot
└─ Status → "pending" (needs approval) or "approved" (User 1 approved)

USER 1 always sees what USER 2 proposed:
├─ Venue ID → Can look up venue details
├─ Date & Time → Can see exact proposed slot
└─ Status → "pending" or "approved"
```

---

### **Example Complete Flow**

```
1. Match created (User 101 ♀ matched with User 102 ♂)

2. POST /bookings/create
   → Booking ID: 5 created
   → Status: PENDING_VENUE_APPROVAL

3. User 101 proposes venue
   POST /bookings/propose-venue?booking_id=5&venue_id=20&user_id=101
   → user_1_proposed_venue_id = 20

4. User 102 views proposal
   GET /bookings/5/other-proposal/102
   → Returns: proposed_venue_id=20, venue_status="pending"

5. User 102 approves same venue
   POST /bookings/approve-venue with venue_id=20
   → user_2_venue_approved = True
   → BOTH approved → Status changes to PENDING_TIME_APPROVAL

6. User 102 proposes time
   POST /bookings/propose-time?booking_id=5&date=2026-02-20&time=19:30&user_id=102
   → user_2_proposed_date = "2026-02-20"
   → user_2_proposed_time = "19:30"

7. User 101 views proposal
   GET /bookings/5/other-proposal/101
   → Returns: proposed_date="2026-02-20", proposed_time="19:30", time_status="pending"

8. User 101 approves same time
   POST /bookings/approve-time with date="2026-02-20", time="19:30"
   → user_1_time_approved = True
   → BOTH approved → Status changes to BOTH_APPROVED

9. POST /bookings/confirm
   → Status: CONFIRMED
   → Confirmation code: "A7F3E2B1"
   → venue_id = 20 (finalized)
   → booking_date = "2026-02-20" (finalized)
   → booking_time = "19:30" (finalized)
```

---

### **Key Improvements**

✅ **Full Visibility** - Each user sees what the other proposed  
✅ **Counter-Proposals** - Can reject and suggest alternatives  
✅ **No Surprises** - Both see venue/time before confirmation  
✅ **Fair Process** - Requires both to agree explicitly  
✅ **Edit Capability** - Users can change proposals until both approve  
✅ **Clear Status** - Know if other user approved or still considering  

---

### **Status Summary**

| Status | Meaning |
|--------|---------|
| PENDING_VENUE_APPROVAL | Waiting for venue proposals/approvals |
| PENDING_TIME_APPROVAL | Venue agreed, waiting for time proposals/approvals |
| BOTH_APPROVED | Both users approved venue and time, ready for confirmation |
| CONFIRMED | Booking confirmed with confirmation code |
| COMPLETED | Date has occurred |
| CANCELLED | Booking was cancelled |
