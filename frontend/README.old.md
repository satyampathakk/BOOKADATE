# BOOKADATE - Backend API Documentation

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Service Ports](#service-ports)
- [Authentication](#authentication)
- [API Gateway](#api-gateway)
- [Services](#services)
  - [User Service](#1-user-service)
  - [Matching Service](#2-matching-service)
  - [Booking Service](#3-booking-service)
  - [Admin Service](#4-admin-service)
  - [Face Authentication Service](#5-face-authentication-service)
  - [Chat Service](#6-chat-service)
- [Complete Workflow](#complete-workflow)
- [Error Handling](#error-handling)

---

## Overview

BOOKADATE is a microservices-based backend for a blind dating application. Users can create profiles, get matched with compatible partners, book venues for dates, and communicate through a time-limited chat system.

### Key Features
- User registration and authentication with JWT tokens
- Preference-based matching algorithm
- Collaborative booking system (both users agree on venue and time)
- Face authentication for verification
- Time-limited chat sessions around meeting times
- Venue management and reviews

---

## Architecture

The system consists of 7 microservices:

1. **API Gateway** (Port 8000) - Routes and authenticates all requests
2. **User Service** (Port 8006) - User management, auth, photos, preferences
3. **Matching Service** (Port 8002) - User matching based on preferences
4. **Booking Service** (Port 8003) - Blind date booking management
5. **Admin Service** (Port 8004) - Venue management
6. **Face Auth Service** (Port 8005) - Face verification
7. **Chat Service** (Port 8001) - WebSocket-based chat

All services are accessible through the **API Gateway** at `http://localhost:8000`

---

## Getting Started

### Prerequisites
- Python 3.8+
- Docker (optional)
- PostgreSQL/SQLite

### Important Notes

⚠️ **CORS Configuration**: The API Gateway is currently configured to accept requests from **any origin** (`allow_origins=["*"]`). This is suitable for development but should be restricted to specific domains in production.

⚠️ **Request Routing**: All API requests **must go through the API Gateway** (`http://localhost:8000`). The gateway forwards requests to the appropriate microservices. Direct access to individual services should only be used for debugging.

### Running the Services

**Option 1: Using the run script**
```bash
# Windows
run_all_services.bat

# PowerShell
.\run_all_services.ps1

# Python
python run_all_services.py
```

**Option 2: Using Docker Compose**
```bash
docker-compose up -d
```

**Option 3: Individual Services**
```bash
# Gateway
cd gateway && python main.py

# User Service
cd user_service && python main.py

# Matching Service
cd matching_service && python main.py

# Booking Service
cd booking_service && python main.py

# Venue Service
cd venue_service && python main.py

# Face Auth Service
cd faceauth_service && python main.py

# Chat Service
cd chat_service && python main.py
```

---

## Service Ports

| Service | Port | Direct URL | Gateway Route |
|---------|------|------------|---------------|
| API Gateway | 8000 | http://localhost:8000 | - |
| Chat Service | 8001 | http://localhost:8001 | /chat/* |
| Matching Service | 8002 | http://localhost:8002 | /matches/* |
| Booking Service | 8003 | http://localhost:8003 | /bookings/* |
| Admin Service | 8004 | http://localhost:8004 | /venues/* |
| Face Auth Service | 8005 | http://localhost:8005 | /faceauth/* |
| User Service | 8006 | http://localhost:8006 | /users/*, /auth/* |

---

## Authentication

### JWT Token Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Public Routes (No Authentication Required)
- `POST /auth/signup`
- `POST /auth/login`
- `GET /health`

### Getting a Token

**Sign Up:**
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "gender": "male",
  "dob": "1990-01-15",
  "password": "securePassword123",
  "bio": "Looking for meaningful connections"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com"
}
```

**Login:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com"
}
```

---

## API Gateway

### Base URL
```
http://localhost:8000
```

### Gateway Features
- **CORS Configuration**: Currently configured to accept requests from **any origin** (`allow_origins=["*"]`) for development. Change this to specific domains in production.
- **Authentication Middleware**: Verifies JWT tokens for protected routes
- **Request Forwarding**: **All requests are forwarded** to appropriate microservices based on the URL path. The gateway acts as a reverse proxy.
- **Service Health Monitoring**: Monitors all microservice health

### How Request Forwarding Works

The API Gateway forwards **all incoming requests** to the appropriate microservice:

1. **Public routes** (signup, login, health) are forwarded directly without authentication
2. **Protected routes** are verified for JWT token, then forwarded with the original headers
3. **URL-based routing**: The gateway routes based on path prefixes:
   - `/auth/*` → User Service
   - `/users/*` → User Service
   - `/matches/*` → Matching Service
   - `/bookings/*` → Booking Service
   - `/venues/*` → Admin Service
   - `/faceauth/*` → Face Auth Service
   - `/chat/*` → Chat Service

**Important:** You should **always** make requests through the API Gateway (`http://localhost:8000`) rather than directly to individual microservices. Direct service access should only be used for debugging.

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "gateway": "healthy",
  "services": {
    "user_service": {
      "status": "healthy",
      "status_code": 200
    },
    "match_service": {
      "status": "healthy",
      "status_code": 200
    },
    "booking_service": {
      "status": "healthy",
      "status_code": 200
    },
    "venue_service": {
      "status": "healthy",
      "status_code": 200
    },
    "faceauth_service": {
      "status": "healthy",
      "status_code": 200
    },
    "chat_service": {
      "status": "healthy",
      "status_code": 200
    }
  }
}
```

---

## Services

## 1. User Service

### Base Path: `/users` and `/auth`

### Authentication Endpoints

#### 1.1 Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567891",
  "gender": "female",
  "dob": "1992-03-20",
  "password": "myPassword123",
  "bio": "Coffee lover and book enthusiast"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "email": "jane@example.com"
}
```

#### 1.2 Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "myPassword123"
}
```

#### 1.3 Verify Token
```http
POST /auth/verify-token
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "email": "jane@example.com",
  "token_valid": true
}
```

### User Management Endpoints

#### 1.4 Get User Profile
```http
GET /users/{user_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567891",
  "gender": "female",
  "dob": "1992-03-20",
  "bio": "Coffee lover and book enthusiast",
  "profile_photo": "/uploads/photo123.jpg",
  "verified": false,
  "kyc_level": "basic"
}
```

#### 1.5 Update User Profile
```http
PUT /users/{user_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "bio": "Updated bio"
}
```

#### 1.6 Upload Photo
```http
POST /users/{user_id}/photos
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

**Response:**
```json
{
  "photo_url": "/uploads/uuid_filename.jpg"
}
```

#### 1.7 Get User Photos
```http
GET /users/{user_id}/photos
Authorization: Bearer <token>
```

**Response:**
```json
[
  "/uploads/photo1.jpg",
  "/uploads/photo2.jpg",
  "/uploads/photo3.jpg"
]
```

### Preferences Endpoints

#### 1.8 Update Preferences
```http
PUT /users/{user_id}/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "age_min": 25,
  "age_max": 35,
  "gender_preference": "male",
  "interests": ["hiking", "movies", "cooking"],
  "location_preference": "New York"
}
```

#### 1.9 Get Preferences
```http
GET /users/{user_id}/preferences
Authorization: Bearer <token>
```

---

## 2. Matching Service

### Base Path: `/matches`

### Preference Management

#### 2.1 Create/Update Matching Preferences
```http
POST /matches/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 123,
  "gender": "female",
  "seeking_gender": "male",
  "age_min": 25,
  "age_max": 35,
  "interests": "hiking, reading, music",
  "bio": "Looking for someone adventurous"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 123,
  "gender": "female",
  "seeking_gender": "male",
  "age_min": 25,
  "age_max": 35,
  "interests": "hiking, reading, music",
  "bio": "Looking for someone adventurous",
  "created_at": "2026-01-07T10:00:00"
}
```

#### 2.2 Get User Preferences
```http
GET /matches/preferences/{user_id}
Authorization: Bearer <token>
```

#### 2.3 Update Preferences
```http
PUT /matches/preferences/{user_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "age_min": 28,
  "age_max": 40,
  "interests": "updated interests"
}
```

### Matching Endpoints

#### 2.4 Find a Match
```http
POST /matches/find
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 123
}
```

**Response (Match Found):**
```json
{
  "id": 45,
  "user_1_id": 123,
  "user_2_id": 456,
  "status": "pending",
  "user_1_approved": false,
  "user_2_approved": false,
  "matched_at": null,
  "created_at": "2026-01-07T10:15:00"
}
```

**Response (No Match - Added to Queue):**
```json
{
  "id": -1,
  "user_1_id": 123,
  "user_2_id": null,
  "status": "waiting",
  "user_1_approved": false,
  "user_2_approved": false,
  "matched_at": null,
  "created_at": "2026-01-07T10:15:00"
}
```

#### 2.5 Approve/Reject Match
```http
POST /matches/approve?user_id=123
Authorization: Bearer <token>
Content-Type: application/json

{
  "match_id": 45,
  "approved": true
}
```

**Response (Both Approved):**
```json
{
  "id": 45,
  "user_1_id": 123,
  "user_2_id": 456,
  "status": "matched",
  "user_1_approved": true,
  "user_2_approved": true,
  "matched_at": "2026-01-07T10:20:00",
  "created_at": "2026-01-07T10:15:00"
}
```

**Note:** If `approved: false`, the match is rejected and recorded to prevent re-matching.

#### 2.6 Get User Matches
```http
GET /matches/user/{user_id}
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 45,
    "user_1_id": 123,
    "user_2_id": 456,
    "status": "matched",
    "user_1_approved": true,
    "user_2_approved": true,
    "matched_at": "2026-01-07T10:20:00",
    "created_at": "2026-01-07T10:15:00"
  }
]
```

#### 2.7 Get Match Details
```http
GET /matches/{match_id}
Authorization: Bearer <token>
```

### Queue Management

#### 2.8 Get Queue Status
```http
GET /matches/queue/status/{user_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "waiting",
  "position": 3,
  "users_ahead": 2,
  "waiting_since": "2026-01-07T10:15:00",
  "seeking_gender": "male"
}
```

#### 2.9 Get Available Matches for Gender
```http
GET /matches/queue/available/{gender}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "gender": "male",
  "available_matches": 15,
  "waiting_in_queue": 3,
  "imbalance_ratio": 0.2
}
```

#### 2.10 Leave Queue
```http
DELETE /matches/queue/{user_id}
Authorization: Bearer <token>
```

---

## 3. Booking Service

### Base Path: `/bookings`

The booking service implements a **collaborative proposal system** where both users must agree on venue and time.

### Booking Workflow

#### 3.1 Create Booking
```http
POST /bookings/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "match_id": 45,
  "user_1_id": 123,
  "user_2_id": 456
}
```

**Response:**
```json
{
  "id": 78,
  "match_id": 45,
  "user_1_id": 123,
  "user_2_id": 456,
  "user_1_proposed_venue_id": null,
  "user_1_proposed_date": null,
  "user_1_proposed_time": null,
  "user_2_proposed_venue_id": null,
  "user_2_proposed_date": null,
  "user_2_proposed_time": null,
  "venue_id": null,
  "booking_date": null,
  "booking_time": null,
  "status": "pending_venue_approval",
  "user_1_venue_approved": false,
  "user_2_venue_approved": false,
  "user_1_time_approved": false,
  "user_2_time_approved": false,
  "confirmation_code": null,
  "created_at": "2026-01-07T10:25:00"
}
```

#### 3.2 Propose Venue
```http
POST /bookings/propose-venue?booking_id=78&venue_id=5&user_id=123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 78,
  "match_id": 45,
  "user_1_id": 123,
  "user_2_id": 456,
  "user_1_proposed_venue_id": 5,
  "user_2_proposed_venue_id": null,
  "status": "pending_venue_approval",
  "user_1_venue_approved": false,
  "user_2_venue_approved": false,
  ...
}
```

#### 3.3 Approve Venue
```http
POST /bookings/approve-venue?user_id=456
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": 78,
  "venue_id": 5,
  "approved": true
}
```

**Response (Both Approved):**
```json
{
  "id": 78,
  "venue_id": 5,
  "status": "pending_time_approval",
  "user_1_venue_approved": true,
  "user_2_venue_approved": true,
  ...
}
```

#### 3.4 Reject Venue
```http
POST /bookings/reject-venue?booking_id=78&user_id=456
Authorization: Bearer <token>
```

#### 3.5 Propose Time
```http
POST /bookings/propose-time?booking_id=78&date=2026-01-15&time=19:00&user_id=123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 78,
  "user_1_proposed_date": "2026-01-15",
  "user_1_proposed_time": "19:00",
  "user_2_proposed_date": null,
  "user_2_proposed_time": null,
  ...
}
```

#### 3.6 Approve Time
```http
POST /bookings/approve-time?user_id=456
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": 78,
  "date": "2026-01-15",
  "time": "19:00",
  "approved": true
}
```

**Response (Both Approved):**
```json
{
  "id": 78,
  "booking_date": "2026-01-15",
  "booking_time": "19:00",
  "status": "both_approved",
  "user_1_time_approved": true,
  "user_2_time_approved": true,
  ...
}
```

#### 3.7 Reject Time
```http
POST /bookings/reject-time?booking_id=78&user_id=456
Authorization: Bearer <token>
```

#### 3.8 Confirm Booking
```http
POST /bookings/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": 78
}
```

**Response:**
```json
{
  "id": 78,
  "status": "confirmed",
  "confirmation_code": "A7B3C9D2",
  "venue_id": 5,
  "booking_date": "2026-01-15",
  "booking_time": "19:00",
  ...
}
```

#### 3.9 Get Available Times
```http
GET /bookings/available-times/{venue_id}?date=2026-01-15
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 101,
    "venue_id": 5,
    "date": "2026-01-15",
    "time": "18:00",
    "available": true
  },
  {
    "id": 102,
    "venue_id": 5,
    "date": "2026-01-15",
    "time": "19:00",
    "available": true
  },
  {
    "id": 103,
    "venue_id": 5,
    "date": "2026-01-15",
    "time": "20:00",
    "available": true
  }
]
```

#### 3.10 Get Booking Details
```http
GET /bookings/{booking_id}
Authorization: Bearer <token>
```

#### 3.11 View Other User's Proposal
```http
GET /bookings/{booking_id}/other-proposal/{user_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "other_user_id": 456,
  "proposed_venue_id": 5,
  "proposed_date": "2026-01-15",
  "proposed_time": "19:00",
  "venue_status": "approved",
  "time_status": "pending",
  "booking_status": "pending_time_approval"
}
```

#### 3.12 Get User Bookings
```http
GET /bookings/user/{user_id}
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 78,
    "match_id": 45,
    "user_1_id": 123,
    "user_2_id": 456,
    "venue_id": 5,
    "booking_date": "2026-01-15",
    "booking_time": "19:00",
    "status": "confirmed",
    "confirmation_code": "A7B3C9D2",
    ...
  }
]
```

#### 3.13 Cancel Booking
```http
POST /bookings/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": 78,
  "reason": "Schedule conflict"
}
```

#### 3.14 Complete Booking
```http
POST /bookings/complete/{booking_id}
Authorization: Bearer <token>
```

---

## 4. Admin Service

### Base Path: `/venues`

### Venue Management

#### 4.1 Create Venue
```http
POST /venues/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "The Cozy Corner",
  "address": "123 Main St",
  "city": "New York",
  "description": "Romantic restaurant with Italian cuisine",
  "phone": "+1234567890",
  "email": "info@cozycorner.com",
  "capacity": 50,
  "price_per_hour": 75.00
}
```

**Response:**
```json
{
  "id": 5,
  "name": "The Cozy Corner",
  "address": "123 Main St",
  "city": "New York",
  "description": "Romantic restaurant with Italian cuisine",
  "phone": "+1234567890",
  "email": "info@cozycorner.com",
  "rating": 0.0,
  "capacity": 50,
  "price_per_hour": 75.00,
  "is_active": true,
  "created_at": "2026-01-07T11:00:00",
  "updated_at": "2026-01-07T11:00:00"
}
```

#### 4.2 List Venues
```http
GET /venues/?city=New York&active_only=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `city` (optional): Filter by city
- `active_only` (optional): Show only active venues (default: true)

**Response:**
```json
[
  {
    "id": 5,
    "name": "The Cozy Corner",
    "address": "123 Main St",
    "city": "New York",
    "rating": 4.5,
    "price_per_hour": 75.00,
    "is_active": true
  }
]
```

#### 4.3 Get Venue Details
```http
GET /venues/{venue_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 5,
  "name": "The Cozy Corner",
  "address": "123 Main St",
  "city": "New York",
  "description": "Romantic restaurant with Italian cuisine",
  "phone": "+1234567890",
  "email": "info@cozycorner.com",
  "rating": 4.5,
  "capacity": 50,
  "price_per_hour": 75.00,
  "is_active": true,
  "created_at": "2026-01-07T11:00:00",
  "updated_at": "2026-01-07T11:00:00"
}
```

#### 4.4 Update Venue
```http
PUT /venues/{venue_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "The Cozy Corner Bistro",
  "price_per_hour": 80.00,
  "is_active": true
}
```

#### 4.5 Delete Venue
```http
DELETE /venues/{venue_id}
Authorization: Bearer <token>
```

### Time Slot Management

#### 4.6 Create Time Slot
```http
POST /venues/timeslots/
Authorization: Bearer <token>
Content-Type: application/json

{
  "venue_id": 5,
  "date": "2026-01-15",
  "time": "19:00"
}
```

**Response:**
```json
{
  "id": 101,
  "venue_id": 5,
  "date": "2026-01-15",
  "time": "19:00",
  "available": true,
  "booked_by": null,
  "created_at": "2026-01-07T11:05:00"
}
```

#### 4.7 Bulk Create Time Slots
```http
POST /venues/timeslots/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "venue_id": 5,
  "dates": ["2026-01-15", "2026-01-16", "2026-01-17"],
  "times": ["18:00", "19:00", "20:00", "21:00"]
}
```

**Response:**
```json
[
  {
    "id": 101,
    "venue_id": 5,
    "date": "2026-01-15",
    "time": "18:00",
    "available": true,
    "booked_by": null,
    "created_at": "2026-01-07T11:05:00"
  },
  // ... more slots
]
```

#### 4.8 Get Venue Time Slots
```http
GET /venues/{venue_id}/timeslots?date=2026-01-15&available_only=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `date` (optional): Filter by specific date
- `available_only` (optional): Show only available slots (default: true)

**Response:**
```json
[
  {
    "id": 101,
    "venue_id": 5,
    "date": "2026-01-15",
    "time": "18:00",
    "available": true,
    "booked_by": null,
    "created_at": "2026-01-07T11:05:00"
  }
]
```

#### 4.9 Delete Time Slot
```http
DELETE /venues/timeslots/{slot_id}
Authorization: Bearer <token>
```

#### 4.10 Mark Time Slot Unavailable
```http
PUT /venues/timeslots/{slot_id}/mark-unavailable
Authorization: Bearer <token>
```

#### 4.11 Mark Time Slot Available
```http
PUT /venues/timeslots/{slot_id}/mark-available
Authorization: Bearer <token>
```

### Review Management

#### 4.12 Add Venue Review
```http
POST /venues/reviews/
Authorization: Bearer <token>
Content-Type: application/json

{
  "venue_id": 5,
  "user_id": 123,
  "rating": 5,
  "comment": "Amazing ambiance and great food!"
}
```

**Response:**
```json
{
  "id": 1,
  "venue_id": 5,
  "user_id": 123,
  "rating": 5,
  "comment": "Amazing ambiance and great food!",
  "created_at": "2026-01-07T11:10:00"
}
```

**Note:** Rating must be between 1-5. The venue's average rating is automatically updated.

#### 4.13 Get Venue Reviews
```http
GET /venues/{venue_id}/reviews
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "venue_id": 5,
    "user_id": 123,
    "rating": 5,
    "comment": "Amazing ambiance and great food!",
    "created_at": "2026-01-07T11:10:00"
  }
]
```

#### 4.14 Delete Review
```http
DELETE /venues/reviews/{review_id}
Authorization: Bearer <token>
```

### Analytics

#### 4.15 Get Venue Statistics
```http
GET /venues/{venue_id}/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "venue_id": 5,
  "venue_name": "The Cozy Corner",
  "total_time_slots": 100,
  "available_slots": 75,
  "booked_slots": 25,
  "average_rating": 4.5,
  "total_reviews": 23,
  "price_per_hour": 75.00,
  "capacity": 50
}
```

---

## 5. Face Authentication Service

### Base Path: `/faceauth`

#### 5.1 Verify User Face
```http
POST /faceauth/verify/{user_id}
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <image_file>
```

**Response (Success):**
```json
{
  "id": "uuid-1234",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "is_validated": true,
  "confidence": 0.95,
  "created_at": "2026-01-07T11:15:00"
}
```

**Response (Failed - 401):**
```json
{
  "detail": "Face validation failed"
}
```

#### 5.2 Get Validation Status
```http
GET /faceauth/status/{user_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid-1234",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "is_validated": true,
  "confidence": 0.95,
  "created_at": "2026-01-07T11:15:00"
}
```

---

## 6. Chat Service

### Base Path: `/chat`

The chat service uses WebSockets for real-time communication with **time-limited sessions** that are active only around the scheduled meeting time.

### Chat Session Management

#### 6.1 Create Chat Session (Match)
```http
POST /chat/match
Authorization: Bearer <token>
Content-Type: application/json

{
  "user1_id": "550e8400-e29b-41d4-a716-446655440000",
  "user2_id": "660e8400-e29b-41d4-a716-446655440001",
  "meeting_time": "2026-01-15T19:00:00",
  "duration_minutes": 120
}
```

**Response:**
```json
{
  "session_id": "abc-123-def-456",
  "status": "pending"
}
```

**Session Timeline:**
- **Pending**: Before (meeting_time - 30 minutes)
- **Active**: From (meeting_time - 30 min) to (meeting_time + duration + 30 min)
- **Expired**: After end time

#### 6.2 Get Session Details
```http
GET /chat/sessions/{session_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "session_id": "abc-123-def-456",
  "user1_id": "550e8400-e29b-41d4-a716-446655440000",
  "user2_id": "660e8400-e29b-41d4-a716-446655440001",
  "start_time": "2026-01-15T18:30:00",
  "end_time": "2026-01-15T21:30:00",
  "status": "active",
  "messages_count": 15
}
```

### WebSocket Connection

#### 6.3 Connect to Chat Session

**WebSocket URL:**
```
ws://localhost:8001/ws/{session_id}/{user_id}
```

**Example (JavaScript):**
```javascript
const sessionId = "abc-123-def-456";
const userId = "550e8400-e29b-41d4-a716-446655440000";
const socket = new WebSocket(`ws://localhost:8001/ws/${sessionId}/${userId}`);

socket.onopen = () => {
  console.log("Connected to chat");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Received:", data);
  
  if (data.type === "message") {
    // Handle incoming message
    console.log("Message from:", data.data.sender_id);
    console.log("Content:", data.data.content);
  } else if (data.type === "session_expired") {
    console.log("Chat session has expired");
  } else if (data.type === "session_active") {
    console.log("Chat session is now active");
  }
};

socket.onerror = (error) => {
  console.error("WebSocket error:", error);
};

socket.onclose = () => {
  console.log("Disconnected from chat");
};
```

#### 6.4 Send Message

**Message Format:**
```javascript
const message = {
  content: "Hello! Nice to meet you!",
  type: "text"
};

socket.send(JSON.stringify(message));
```

#### 6.5 Receive Message

**Message Types:**

**Regular Message:**
```json
{
  "type": "message",
  "data": {
    "id": "msg-uuid-123",
    "sender_id": "660e8400-e29b-41d4-a716-446655440001",
    "content": "Hello! Nice to meet you!",
    "timestamp": "2026-01-15T19:15:00",
    "type": "text"
  }
}
```

**Session Active:**
```json
{
  "type": "session_active",
  "message": "Chat session is now active"
}
```

**Session Expired:**
```json
{
  "type": "session_expired",
  "message": "Chat session has expired"
}
```

**Error:**
```json
{
  "error": "Chat session has expired"
}
```

### WebSocket Connection Rules

1. **Authentication**: User must be part of the session (user1_id or user2_id)
2. **Timing**: Connection only allowed during active session window
3. **Auto-disconnect**: Connection closes when session expires
4. **Message Storage**: All messages stored in-memory (use database in production)

---

## Complete Workflow

### End-to-End User Journey

#### 1. User Registration & Setup
```bash
# Step 1: Sign up
POST /auth/signup
{
  "name": "Alice",
  "email": "alice@example.com",
  "phone": "+1234567890",
  "gender": "female",
  "dob": "1995-05-10",
  "password": "securePass123",
  "bio": "Love traveling and coffee"
}

# Step 2: Upload photos
POST /users/{user_id}/photos
[Upload profile picture]

# Step 3: Set preferences
PUT /users/{user_id}/preferences
{
  "age_min": 25,
  "age_max": 35,
  "gender_preference": "male",
  "interests": ["travel", "coffee", "hiking"]
}

# Step 4: Verify face (optional)
POST /faceauth/verify/{user_id}
[Upload face image]
```

#### 2. Matching Process
```bash
# Step 1: Create matching preferences
POST /matches/preferences
{
  "user_id": 123,
  "gender": "female",
  "seeking_gender": "male",
  "age_min": 25,
  "age_max": 35,
  "interests": "travel, coffee",
  "bio": "Looking for adventure"
}

# Step 2: Find a match
POST /matches/find
{
  "user_id": 123
}

# Step 3: Approve match (both users)
POST /matches/approve?user_id=123
{
  "match_id": 45,
  "approved": true
}
```

#### 3. Booking Process
```bash
# Step 1: Create booking
POST /bookings/create
{
  "match_id": 45,
  "user_1_id": 123,
  "user_2_id": 456
}

# Step 2: Browse venues
GET /venues/?city=New York

# Step 3: User 1 proposes venue
POST /bookings/propose-venue?booking_id=78&venue_id=5&user_id=123

# Step 4: User 2 approves venue
POST /bookings/approve-venue?user_id=456
{
  "booking_id": 78,
  "venue_id": 5,
  "approved": true
}

# Step 5: Check available times
GET /bookings/available-times/5?date=2026-01-15

# Step 6: User 1 proposes time
POST /bookings/propose-time?booking_id=78&date=2026-01-15&time=19:00&user_id=123

# Step 7: User 2 approves time
POST /bookings/approve-time?user_id=456
{
  "booking_id": 78,
  "date": "2026-01-15",
  "time": "19:00",
  "approved": true
}

# Step 8: Confirm booking
POST /bookings/confirm
{
  "booking_id": 78
}
```

#### 4. Chat & Meeting
```bash
# Step 1: Create chat session
POST /chat/match
{
  "user1_id": "user-uuid-1",
  "user2_id": "user-uuid-2",
  "meeting_time": "2026-01-15T19:00:00",
  "duration_minutes": 120
}

# Step 2: Connect via WebSocket (30 min before meeting)
ws://localhost:8001/ws/{session_id}/{user_id}

# Step 3: Exchange messages
[Send/receive messages during active window]

# Step 4: Complete booking (after meeting)
POST /bookings/complete/{booking_id}

# Step 5: Leave review
POST /venues/reviews/
{
  "venue_id": 5,
  "user_id": 123,
  "rating": 5,
  "comment": "Great place!"
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or request format |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Example Error Responses

#### 401 Unauthorized
```json
{
  "detail": "Missing or invalid authorization header"
}
```

#### 404 Not Found
```json
{
  "detail": "Booking not found"
}
```

#### 400 Bad Request
```json
{
  "detail": "Both venue and time must be approved first"
}
```

#### 403 Forbidden
```json
{
  "detail": "User not part of this booking"
}
```

---

## Data Models

### Key Schemas

#### User
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "gender": "string",
  "dob": "string (YYYY-MM-DD)",
  "bio": "string",
  "profile_photo": "string (path)",
  "verified": "boolean",
  "kyc_level": "string"
}
```

#### Match
```json
{
  "id": "integer",
  "user_1_id": "integer",
  "user_2_id": "integer",
  "status": "string (pending|matched|rejected|waiting)",
  "user_1_approved": "boolean",
  "user_2_approved": "boolean",
  "matched_at": "datetime|null",
  "created_at": "datetime"
}
```

#### Booking
```json
{
  "id": "integer",
  "match_id": "integer",
  "user_1_id": "integer",
  "user_2_id": "integer",
  "venue_id": "integer|null",
  "booking_date": "string (YYYY-MM-DD)|null",
  "booking_time": "string (HH:MM)|null",
  "status": "string",
  "confirmation_code": "string|null",
  "user_1_venue_approved": "boolean",
  "user_2_venue_approved": "boolean",
  "user_1_time_approved": "boolean",
  "user_2_time_approved": "boolean",
  "created_at": "datetime"
}
```

**Booking Status Values:**
- `pending_venue_approval`
- `pending_time_approval`
- `both_approved`
- `confirmed`
- `cancelled`
- `completed`

#### Venue
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

---

## Testing

### Using cURL

**Sign Up:**
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "gender": "male",
    "dob": "1990-01-01",
    "password": "testpass123",
    "bio": "Test bio"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

**Authenticated Request:**
```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:8000/users/your-user-id \
  -H "Authorization: Bearer $TOKEN"
```

### Using the Test HTML File

Open `test_all_services.html` in a browser for an interactive testing interface.

---

## Production Considerations

### Security
1. **CORS**: Currently set to `allow_origins=["*"]` which allows requests from **any origin**. For production, update this to specific allowed domains:
   ```python
   # gateway/main.py
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com", "https://app.yourdomain.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
2. **Environment Variables**: Use proper secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
3. **HTTPS**: Enable SSL/TLS for all endpoints
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Input Validation**: Add comprehensive validation for all inputs
6. **API Keys**: Consider adding API keys for additional security on top of JWT tokens

### Database
1. **Migrations**: Use Alembic for database migrations
2. **Connections**: Implement connection pooling
3. **Backups**: Regular automated backups
4. **Indexes**: Add proper database indexes for performance

### Monitoring
1. **Logging**: Centralized logging (e.g., ELK stack)
2. **Metrics**: Application metrics (e.g., Prometheus)
3. **Health Checks**: Kubernetes/Docker health probes
4. **Error Tracking**: Error monitoring (e.g., Sentry)

### Scalability
1. **Load Balancing**: Use load balancers for each service
2. **Caching**: Implement Redis for caching
3. **Message Queue**: Use RabbitMQ/Kafka for async tasks
4. **CDN**: Use CDN for static assets and photos

---

## Support & Contact

For issues, questions, or contributions:
- Create an issue in the repository
- Contact the development team
- Check the service health at `/health` endpoints

---

## License

[Your License Here]

---

**Last Updated:** January 7, 2026
**Version:** 1.0.0
