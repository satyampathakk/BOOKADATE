# Blind Dating Platform API Documentation

This document describes all the APIs available in the Blind Dating Platform microservices architecture based on actual service implementations and working workflow.

## Service Overview

The platform consists of 6 microservices:

1. **Gateway Service** (Port 8000) - API Gateway and authentication
2. **User Service** (Port 8006) - User management and authentication  
3. **Chat Service** (Port 8001) - Real-time messaging
4. **Matching Service** (Port 8002) - User matching algorithm
5. **Booking Service** (Port 8003) - Date booking management
6. **Venue Service** (Port 8004) - Venue and time slot management

## Complete Workflow

The platform follows this end-to-end workflow:

### 1. User Registration & Approval
1. **User Signup** → Upload documents → Status: "pending"
2. **Admin Review** → Approve/Reject registration
3. **User Login** → Get JWT token for authenticated requests

### 2. Matching Process
1. **Set Preferences** → Define gender, age range, interests
2. **Find Match** → First user goes to queue, second user matches with first
3. **Match Approval** → Both users must approve the match
4. **Match Status** → "pending" → "matched" when both approve

### 3. Booking Process
1. **Create Booking** → System creates booking for matched users
2. **Venue Selection** → One user proposes venue, other approves
3. **Time Selection** → One user proposes time, other approves  
4. **Booking Confirmation** → System confirms when both venue and time approved

### 4. Chat Session
1. **Chat Creation** → System creates chat session for meeting time
2. **Real-time Chat** → Users can chat during designated time window

## Authentication

Most endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

### Admin Authentication
Admin endpoints require hard-coded credentials in the request body:
```json
{
  "email": "admin@example.com",
  "password": "SuperSecret123"
}
```

### Public Endpoints (No Auth Required)
- `/auth/login`
- `/auth/signup` 
- `/health` (all services)
- `/docs`
- `/openapi.json`
- `/chat/match` (create chat sessions)
- `/chat/sessions/{session_id}` (get session details)
- `GET /venues/*` (browse venues - GET requests only)

---

## 1. Gateway Service (Port 8000)

The API Gateway routes requests to appropriate microservices and handles authentication.

### Health Check
```
GET /health
```
**Response:**
```json
{
  "gateway": "healthy"
}
```

### Route Mapping
All requests go through the gateway with these prefixes:
- `/auth/*` → User Service `/auth/*`
- `/users/*` → User Service `/users/*`  
- `/admin/*` → User Service `/admin/*`
- `/matches/*` → Matching Service `/matches/*`
- `/bookings/*` → Booking Service `/bookings/*`
- `/venues/*` → Venue Service `/venues/*`
- `/chat/*` → Chat Service `/*`

---

## 2. User Service (Port 8006)

### Authentication Endpoints

#### User Signup
```
POST /auth/signup
Content-Type: multipart/form-data
```
**Form Data:**
- `name`: string (required)
- `email`: string (required)
- `phone`: string (required)
- `gender`: string (required)
- `dob`: string (required, YYYY-MM-DD)
- `password`: string (required)
- `bio`: string (optional)
- `id_document`: file (required)
- `selfie`: file (required)

**Response:**
```json
{
  "user_id": "uuid",
  "registration_status": "pending",
  "message": "Registration submitted. Await admin approval."
}
```

#### User Login
```
POST /auth/login
```
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "user_id": "uuid",
  "email": "user@example.com"
}
```

#### Verify Token
```
POST /auth/verify-token
Authorization: Bearer <token>
```
**Response:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "token_valid": true
}
```

### User Management Endpoints

#### Create User
```
POST /users/
Authorization: Bearer <token>
```
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "gender": "male",
  "dob": "1990-01-01",
  "password": "password123",
  "bio": "Hello world"
}
```

#### Get User
```
GET /users/{user_id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "gender": "male",
  "dob": "1990-01-01",
  "bio": "Hello world",
  "profile_photo": null,
  "verified": true,
  "kyc_level": "verified",
  "registration_status": "approved",
  "rejection_reason": null
}
```

#### Update User
```
PUT /users/{user_id}
Authorization: Bearer <token>
```
**Request:**
```json
{
  "name": "John Updated",
  "bio": "Updated bio"
}
```

### Admin Endpoints

**Note:** All admin endpoints require admin credentials in the request body.

#### List Registrations
```
GET /admin/registrations?status=pending
```
**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SuperSecret123"
}
```
**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "gender": "male",
    "dob": "1990-01-01",
    "bio": "Hello world",
    "profile_photo": null,
    "id_document_path": "/path/to/id.jpg",
    "selfie_path": "/path/to/selfie.jpg",
    "registration_status": "pending",
    "rejection_reason": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Registration Details
```
GET /admin/registrations/{user_id}
```
**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SuperSecret123"
}
```

#### Approve Registration
```
POST /admin/registrations/{user_id}/approve
```
**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SuperSecret123"
}
```
**Response:**
```json
{
  "id": "uuid",
  "registration_status": "approved",
  "verified": true,
  "kyc_level": "verified",
  "rejection_reason": null
}
```

#### Reject Registration
```
POST /admin/registrations/{user_id}/reject
```
**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "SuperSecret123",
  "reason": "Invalid documents"
}
```
**Response:**
```json
{
  "id": "uuid",
  "registration_status": "rejected",
  "verified": false,
  "rejection_reason": "Invalid documents"
}
```

---

## 3. Chat Service (Port 8001)

### Create Match Chat Session
```
POST /match
```
**Note:** This endpoint does NOT require authentication.

**Request:**
```json
{
  "user1_id": "uuid1",
  "user2_id": "uuid2",
  "meeting_time": "2024-01-01T18:00:00Z",
  "duration_minutes": 120
}
```
**Response:**
```json
{
  "session_id": "uuid",
  "status": "pending"
}
```

### Get Session Details
```
GET /sessions/{session_id}
```
**Note:** This endpoint does NOT require authentication.

**Response:**
```json
{
  "session_id": "uuid",
  "user1_id": "uuid1",
  "user2_id": "uuid2",
  "start_time": "2024-01-01T17:30:00Z",
  "end_time": "2024-01-01T20:30:00Z",
  "status": "active",
  "messages_count": 5
}
```

### WebSocket Connection
```
WS /ws/{session_id}/{user_id}
```
**Message Format:**
```json
{
  "content": "Hello!",
  "type": "text"
}
```

---

## 4. Matching Service (Port 8002)

### User Preferences

#### Create/Update Preferences
```
POST /matches/preferences
Authorization: Bearer <token>
```
**Request:**
```json
{
  "user_id": 1,
  "gender": "male",
  "seeking_gender": "female",
  "age_min": 25,
  "age_max": 35,
  "interests": "hiking, movies, cooking",
  "bio": "Looking for meaningful connections"
}
```

#### Get Preferences
```
GET /matches/preferences/{user_id}
Authorization: Bearer <token>
```

#### Update Preferences
```
PUT /matches/preferences/{user_id}
Authorization: Bearer <token>
```

### Matching

#### Find Match
```
POST /matches/find
Authorization: Bearer <token>
```
**Request:**
```json
{
  "user_id": 1
}
```
**Response (Match Found):**
```json
{
  "id": 1,
  "user_1_id": 2,
  "user_2_id": 1,
  "status": "pending",
  "user_1_approved": false,
  "user_2_approved": false,
  "matched_at": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```
**Response (Added to Queue):**
```json
{
  "id": -1,
  "user_1_id": 1,
  "user_2_id": null,
  "status": "waiting",
  "user_1_approved": false,
  "user_2_approved": false,
  "matched_at": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Note:** The first user to find a match typically goes to the waiting queue. When the second compatible user searches, they get matched with the first user from the queue.

#### Approve/Reject Match
```
POST /matches/approve?user_id=1
Authorization: Bearer <token>
```
**Request:**
```json
{
  "match_id": 1,
  "approved": true
}
```

#### Get User Matches
```
GET /matches/user/{user_id}
Authorization: Bearer <token>
```

#### Get Match Details
```
GET /matches/{match_id}
Authorization: Bearer <token>
```

### Queue Management

#### Get Queue Status
```
GET /matches/queue/status/{user_id}
Authorization: Bearer <token>
```
**Response:**
```json
{
  "status": "waiting",
  "position": 3,
  "users_ahead": 2,
  "waiting_since": "2024-01-01T00:00:00Z",
  "seeking_gender": "female"
}
```

#### Get Available Matches for Gender
```
GET /matches/queue/available/{gender}
Authorization: Bearer <token>
```

#### Leave Queue
```
DELETE /matches/queue/{user_id}
Authorization: Bearer <token>
```

---

## 5. Booking Service (Port 8003)

### Booking Management

#### Create Booking
```
POST /bookings/create
Authorization: Bearer <token>
```
**Request:**
```json
{
  "match_id": 1,
  "user_1_id": 1,
  "user_2_id": 2
}
```

#### Propose Venue
```
POST /bookings/propose-venue?booking_id=1&venue_id=1&user_id=1
Authorization: Bearer <token>
```

#### Approve Venue
```
POST /bookings/approve-venue?user_id=1
Authorization: Bearer <token>
```
**Request:**
```json
{
  "booking_id": 1,
  "venue_id": 1,
  "approved": true
}
```

#### Reject Venue
```
POST /bookings/reject-venue?booking_id=1&user_id=1
Authorization: Bearer <token>
```

#### Propose Time
```
POST /bookings/propose-time?booking_id=1&date=2024-01-01&time=18:00&user_id=1
Authorization: Bearer <token>
```

#### Approve Time
```
POST /bookings/approve-time?user_id=1
Authorization: Bearer <token>
```
**Request:**
```json
{
  "booking_id": 1,
  "date": "2024-01-01",
  "time": "18:00",
  "approved": true
}
```

#### Reject Time
```
POST /bookings/reject-time?booking_id=1&user_id=1
Authorization: Bearer <token>
```

#### Confirm Booking
```
POST /bookings/confirm
Authorization: Bearer <token>
```
**Request:**
```json
{
  "booking_id": 1
}
```

#### Get Booking
```
GET /bookings/{booking_id}
Authorization: Bearer <token>
```

#### Get Available Times
```
GET /bookings/available-times/{venue_id}?date=2024-01-01
Authorization: Bearer <token>
```

#### View Other User Proposal
```
GET /bookings/{booking_id}/other-proposal/{user_id}
Authorization: Bearer <token>
```

#### Get User Bookings
```
GET /bookings/user/{user_id}
Authorization: Bearer <token>
```

#### Cancel Booking
```
POST /bookings/cancel
Authorization: Bearer <token>
```
**Request:**
```json
{
  "booking_id": 1,
  "reason": "Schedule conflict"
}
```

#### Complete Booking
```
POST /bookings/complete/{booking_id}
Authorization: Bearer <token>
```

---

## 6. Venue Service (Port 8004)

### Venue Management

#### Create Venue
```
POST /venues/
Authorization: Bearer <token>
```
**Request:**
```json
{
  "name": "Cozy Cafe",
  "address": "123 Main St",
  "city": "New York",
  "description": "A romantic cafe perfect for dates",
  "phone": "+1234567890",
  "email": "info@cozycafe.com",
  "capacity": 50,
  "price_per_hour": 25.0
}
```

#### List Venues
```
GET /venues/?city=New York&active_only=true
```
**Note:** This endpoint does NOT require authentication (public browsing).

#### Get Venue
```
GET /venues/{venue_id}
```
**Note:** This endpoint does NOT require authentication (public browsing).

#### Update Venue
```
PUT /venues/{venue_id}
Authorization: Bearer <token>
```

#### Delete Venue
```
DELETE /venues/{venue_id}
Authorization: Bearer <token>
```

### Time Slot Management

#### Create Time Slot
```
POST /venues/timeslots/
Authorization: Bearer <token>
```
**Request:**
```json
{
  "venue_id": 1,
  "date": "2024-01-01",
  "time": "18:00"
}
```

#### Bulk Create Time Slots
```
POST /venues/timeslots/bulk
Authorization: Bearer <token>
```
**Request:**
```json
{
  "venue_id": 1,
  "dates": ["2024-01-01", "2024-01-02"],
  "times": ["18:00", "19:00", "20:00"]
}
```

#### Get Venue Time Slots
```
GET /venues/{venue_id}/timeslots?date=2024-01-01&available_only=true
Authorization: Bearer <token>
```

#### Delete Time Slot
```
DELETE /venues/timeslots/{slot_id}
Authorization: Bearer <token>
```

#### Mark Slot Unavailable
```
PUT /venues/timeslots/{slot_id}/mark-unavailable
Authorization: Bearer <token>
```

#### Mark Slot Available
```
PUT /venues/timeslots/{slot_id}/mark-available
Authorization: Bearer <token>
```

### Reviews

#### Add Review
```
POST /venues/reviews/
Authorization: Bearer <token>
```
**Request:**
```json
{
  "venue_id": 1,
  "user_id": 1,
  "rating": 5,
  "comment": "Great atmosphere!"
}
```

#### Get Venue Reviews
```
GET /venues/{venue_id}/reviews
Authorization: Bearer <token>
```

#### Delete Review
```
DELETE /venues/reviews/{review_id}
Authorization: Bearer <token>
```

### Analytics

#### Get Venue Stats
```
GET /venues/{venue_id}/stats
Authorization: Bearer <token>
```
**Response:**
```json
{
  "venue_id": 1,
  "venue_name": "Cozy Cafe",
  "total_time_slots": 100,
  "available_slots": 75,
  "booked_slots": 25,
  "average_rating": 4.5,
  "total_reviews": 20,
  "price_per_hour": 25.0,
  "capacity": 50
}
```

---

## Testing Through Gateway

All API calls should go through the Gateway (Port 8000) with the appropriate prefixes:

### Example: User Signup through Gateway
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=+1234567890" \
  -F "gender=male" \
  -F "dob=1990-01-01" \
  -F "password=password123" \
  -F "bio=Hello world" \
  -F "id_document=@/path/to/id.jpg" \
  -F "selfie=@/path/to/selfie.jpg"
```

### Example: Login through Gateway
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

### Example: Authenticated Request through Gateway
```bash
curl -X GET "http://localhost:8000/users/user-id" \
  -H "Authorization: Bearer your-jwt-token"
```

---

## Error Responses

All services return consistent error responses:

```json
{
  "detail": "Error message"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Data Models

### User
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "gender": "string",
  "dob": "string",
  "bio": "string",
  "profile_photo": "string",
  "verified": "boolean",
  "kyc_level": "string",
  "registration_status": "string",
  "rejection_reason": "string"
}
```

### Match
```json
{
  "id": "integer",
  "user_1_id": "integer",
  "user_2_id": "integer",
  "status": "string",
  "user_1_approved": "boolean",
  "user_2_approved": "boolean",
  "matched_at": "datetime",
  "created_at": "datetime"
}
```

### Booking
```json
{
  "id": "integer",
  "match_id": "integer",
  "user_1_id": "integer",
  "user_2_id": "integer",
  "venue_id": "integer",
  "booking_date": "string",
  "booking_time": "string",
  "status": "string",
  "confirmation_code": "string",
  "created_at": "datetime"
}
```

### Venue
```json
{
  "id": "integer",
  "name": "string",
  "address": "string",
  "city": "string",
  "description": "string",
  "phone": "string",
  "email": "string",
  "rating": "float",
  "capacity": "integer",
  "price_per_hour": "float",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```