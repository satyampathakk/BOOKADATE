# 🎉 BookADate - Complete Setup & Running Guide

## Overview
BookADate is a microservices-based blind dating platform with **7 independent services**:
- **API Gateway** (Port 8000) - Central entry point
- **Chat Service** (Port 8001) - Real-time messaging
- **Matching Service** (Port 8002) - User matching engine
- **Booking Service** (Port 8003) - Blind date booking
- **Admin Service** (Port 8004) - Venue management
- **Face Auth Service** (Port 8005) - Facial recognition verification
- **User Service** (Port 8006) - User profile management

---

## 📋 Prerequisites

### Required
- Python 3.9+ ([Download](https://www.python.org/downloads/))
- pip (comes with Python)

### Optional (for Docker)
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose

---

## 🚀 Quick Start

### Option 1: Batch File (Windows - Easiest)

Simply double-click `run_all_services.bat`:

```
run_all_services.bat
```

This will:
- Start all 7 services in separate terminal windows
- Show you the URLs for each service
- Automatically handle paths and commands

✅ **Pros:** Simple, visual, Windows-native
❌ **Cons:** Windows only

---

### Option 2: PowerShell Script (Windows - Recommended)

```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\run_all_services.ps1
```

This will:
- Check Python installation
- Install dependencies automatically
- Start all services with proper error handling
- Show service status

✅ **Pros:** Checks dependencies, error handling
❌ **Cons:** Windows only

---

### Option 3: Python Script (Cross-Platform)

```bash
# Windows (CMD)
python run_all_services.py

# Linux/Mac
python3 run_all_services.py
```

This will:
- Verify directories exist
- Install missing dependencies
- Start all services
- Keep running until Ctrl+C

✅ **Pros:** Works on any OS with Python
❌ **Cons:** Need Python installed

---

### Option 4: Docker Compose (All Platforms - Production)

```bash
# Make sure Docker Desktop is running, then:
docker-compose up
```

This will:
- Pull PostgreSQL image
- Build all service images
- Start services in containers
- Create isolated network
- Create persistent database

✅ **Pros:** Production-ready, isolated, clean
❌ **Cons:** Need Docker installed, slower startup

Stop with: `Ctrl+C` or `docker-compose down`

---

### Option 5: Manual Start (Any OS)

Start each service in a separate terminal:

**Terminal 1 - API Gateway:**
```bash
cd gateway
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

**Terminal 2 - User Service:**
```bash
cd user_service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8006
```

**Terminal 3 - Chat Service:**
```bash
cd chat_service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8001
```

**Terminal 4 - Face Auth Service:**
```bash
cd faceauth_service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8005
```

**Terminal 5 - Matching Service:**
```bash
cd matching_service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8002
```

**Terminal 6 - Booking Service:**
```bash
cd booking_service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8003
```

**Terminal 7 - Venue Service:**
```bash
cd venue_service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8004
```

---

## 🧪 Testing the Services

### 1. Using the Web Interface (Easiest)

Open `test_all_services.html` in your browser:
```
File → Open → D:\BOOKADATE\test_all_services.html
```

Or paste in address bar:
```
file:///d:/BOOKADATE/test_all_services.html
```

Features:
- ✅ Three tabs (Matching, Booking, Admin)
- ✅ Real-time API health check
- ✅ Pre-filled test data
- ✅ Beautiful UI with response display
- ✅ No installation needed

---

### 2. Using API Documentation

Open in browser:
```
http://localhost:8000/docs          # API Gateway
http://localhost:8001/docs          # Chat Service
http://localhost:8002/docs          # Matching Service
http://localhost:8003/docs          # Booking Service
http://localhost:8004/docs          # Admin Service
http://localhost:8005/docs          # Face Auth Service
http://localhost:8006/docs          # User Service
```

Features:
- Interactive Swagger UI
- Try out API endpoints
- See request/response examples
- Full API documentation

---

### 3. Using cURL Commands

```bash
# Health Check
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health
curl http://localhost:8005/health
curl http://localhost:8006/health

# Create preference (Matching)
curl -X POST http://localhost:8002/matches/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 101,
    "gender": "male",
    "seeking_gender": "female",
    "age_min": 20,
    "age_max": 35,
    "interests": "hiking, movies",
    "bio": "Love outdoor activities"
  }'

# Find match
curl -X POST http://localhost:8002/matches/find \
  -H "Content-Type: application/json" \
  -d '{"user_id": 101}'
```

---

## 📊 Complete Testing Flow

### Scenario: User 101 (Male) and User 102 (Female) Book a Date

**Step 1: User Service - Create User Profiles**
```
User Service → Create User Profile
User 101: John Doe
User 102: Jane Smith
```

**Step 2: Face Auth Service - Verify Identity** (Optional)
```
Face Auth → Verify User Face
User 101 & 102: Facial recognition verification
```

**Step 3: Matching Service - Create Preferences**
```
Matching → Create User Preferences
User 101: Male seeking Female
User 102: Female seeking Male
```

**Step 4: Matching Service - Find & Approve Matches**
```
Matching → Find a Match (User 101)
Matching → Approve Match (Both users)
→ Result: MATCHED status
```

**Step 5: Admin Service - Add Venue & Time Slots**
```
Admin → Add Venue (e.g., "The Cozy Café")
Admin → Add Time Slots (dates and times)
```

**Step 6: Booking Service - Create Booking**
```
Booking → Create Booking
→ Status: PENDING_VENUE_APPROVAL
```

**Step 7: Booking Service - Propose & Approve Venue**
```
Booking → Propose Venue (User 101 proposes venue 10)
Booking → View Other's Proposal (User 102 views)
Booking → Approve Venue (User 102 approves)
→ Status: PENDING_TIME_APPROVAL
```

**Step 8: Booking Service - Propose & Approve Time**
```
Booking → Propose Time (User 102 proposes 2026-02-14 19:00)
Booking → View Other's Proposal (User 101 views)
Booking → Approve Time (User 101 approves)
→ Status: BOTH_APPROVED
```

**Step 9: Booking Service - Confirm**
```
Booking → Confirm Booking
→ Status: CONFIRMED
→ Confirmation Code: A7F3E2B1
```

**Step 10: Chat Service - Communication**
```
Chat → Send Message (Before/After date)
User 101 ↔ User 102: Real-time messaging
```

---

## 🔧 Troubleshooting

### Services Won't Start

**Error: "Python not found"**
- Solution: Install Python or add to PATH
- Check: `python --version`

**Error: "Port already in use"**
- Solution: Kill existing process on that port
  ```bash
  # Windows
  netstat -ano | findstr :8002
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -i :8002
  kill -9 <PID>
  ```

**Error: "Module not found"**
- Solution: Install dependencies
  ```bash
  pip install -r user_service/requirements.txt
  pip install -r chat_service/requirements.txt
  pip install -r faceauth_service/requirements.txt
  pip install -r matching_service/requirements.txt
  pip install -r booking_service/requirements.txt
  pip install -r venue_service/requirements.txt
  ```

---

### Services Running but API Returns Errors

**Database Connection Error**
- Make sure you're not using Docker Compose with local Python
- Either use all Docker or all local Python
- For local: SQLite fallback (modify DATABASE_URL in .env)

**CORS Errors**
- All services have CORS enabled
- Try the web interface instead of direct fetch

**API Returns 404**
- Service may not be running
- Check terminal for errors
- Try: `http://localhost:8002/health`

---

### Testing Interface Shows "Unhealthy"

**Red dots in API Status**
- Check if service is running: `http://localhost:8002/health`
- Check terminal for startup errors
- Try refreshing the page
- Services take 2-3 seconds to start

---

## 📁 Directory Structure

```
BOOKADATE/
├── gateway/                # API Gateway (Router)
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── user_service/           # User profile management
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── requirements.txt
│   └── Dockerfile
│
├── chat_service/           # Real-time messaging
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── faceauth_service/       # Facial recognition
│   ├── main.py
│   ├── models/
│   ├── services/
│   ├── requirements.txt
│   └── Dockerfile
│
├── matching_service/       # User matching engine
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── requirements.txt
│   └── Dockerfile
│
├── booking_service/        # Date booking
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── requirements.txt
│   └── Dockerfile
│
├── venue_service/          # Venue management
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── requirements.txt
│   └── Dockerfile
│
├── test_all_services.html  # Web testing interface
├── run_all_services.bat    # Windows batch starter
├── run_all_services.ps1    # PowerShell starter
├── run_all_services.py     # Python starter
├── docker-compose.yml      # Docker configuration
└── README.md              # This file
```

---

## 🌐 Service URLs

Once running, access:

| Service | URL | Docs |
|---------|-----|------|
| API Gateway | http://localhost:8000 | http://localhost:8000/docs |
| Chat | http://localhost:8001 | http://localhost:8001/docs |
| Matching | http://localhost:8002 | http://localhost:8002/docs |
| Booking | http://localhost:8003 | http://localhost:8003/docs |
| Admin | http://localhost:8004 | http://localhost:8004/docs |
| Face Auth | http://localhost:8005 | http://localhost:8005/docs |
| User | http://localhost:8006 | http://localhost:8006/docs |
| Test Interface | file:///d:/BOOKADATE/test_all_services.html | - |

---

## 📝 Example API Calls

### Create User Profile (User Service)
```bash
curl -X POST http://localhost:8006/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28,
    "gender": "male"
  }'
```

### Create User Preference (Matching Service)
```bash
curl -X POST http://localhost:8002/matches/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 101,
    "gender": "male",
    "seeking_gender": "female",
    "age_min": 20,
    "age_max": 35,
    "interests": "hiking, coffee",
    "bio": "Adventure seeker"
  }'
```

### Find a Match
```bash
curl -X POST http://localhost:8002/matches/find \
  -H "Content-Type: application/json" \
  -d '{"user_id": 101}'
```

### Create Booking
```bash
curl -X POST http://localhost:8003/bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "match_id": 1,
    "user_1_id": 101,
    "user_2_id": 102
  }'
```

### Add Venue
```bash
curl -X POST http://localhost:8004/venues/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Cozy Coffee Shop",
    "address": "123 Main St",
    "city": "New York",
    "capacity": 50,
    "price_per_hour": 100
  }'
```

### Send Chat Message
```bash
curl -X POST http://localhost:8001/messages/ \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": 101,
    "receiver_id": 102,
    "message": "Hey! Looking forward to our date!"
  }'
```

---

## 🛑 Stopping Services

**Batch/PowerShell:** Close the terminal windows

**Python Script:** Press `Ctrl+C` in the terminal

**Docker:** Press `Ctrl+C` or run:
```bash
docker-compose down
```

---

## 📞 Support

For issues, check:
1. Service health: Visit `/health` endpoint
2. API docs: Visit `/docs` endpoint
3. Terminal output for error messages
4. Test interface for API status

---

**Happy Dating! 💕**

## 📋 Prerequisites

### Required
- Python 3.9+ ([Download](https://www.python.org/downloads/))
- pip (comes with Python)

### Optional (for Docker)
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose

---

## 🚀 Quick Start

### Option 1: Batch File (Windows - Easiest)

Simply double-click `run_all_services.bat`:

```
run_all_services.bat
```

This will:
- Start all 3 services in separate terminal windows
- Show you the URLs for each service
- Automatically handle paths and commands

✅ **Pros:** Simple, visual, Windows-native
❌ **Cons:** Windows only

---

### Option 2: PowerShell Script (Windows - Recommended)

```powershell
# Run PowerShell as Administrator, then:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\run_all_services.ps1
```

This will:
- Check Python installation
- Install dependencies automatically
- Start all services with proper error handling
- Show service status

✅ **Pros:** Checks dependencies, error handling
❌ **Cons:** Windows only

---

### Option 3: Python Script (Cross-Platform)

```bash
# Windows (CMD)
python run_all_services.py

# Linux/Mac
python3 run_all_services.py
```

This will:
- Verify directories exist
- Install missing dependencies
- Start all services
- Keep running until Ctrl+C

✅ **Pros:** Works on any OS with Python
❌ **Cons:** Need Python installed

---

### Option 4: Docker Compose (All Platforms - Production)

```bash
# Make sure Docker Desktop is running, then:
docker-compose up
```

This will:
- Pull PostgreSQL image
- Build all service images
- Start services in containers
- Create isolated network
- Create persistent database

✅ **Pros:** Production-ready, isolated, clean
❌ **Cons:** Need Docker installed, slower startup

Stop with: `Ctrl+C` or `docker-compose down`

---

### Option 5: Manual Start (Any OS)

Start each service in a separate terminal:

**Terminal 1 - Matching Service:**
```bash
cd matching_service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8002
```

**Terminal 2 - Booking Service:**
```bash
cd booking_service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8003
```

**Terminal 3 - Venue Service:**
```bash
cd venue_service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8004
```

---

## 🧪 Testing the Services

### 1. Using the Web Interface (Easiest)

Open `test_all_services.html` in your browser:
```
File → Open → D:\BOOKADATE\test_all_services.html
```

Or paste in address bar:
```
file:///d:/BOOKADATE/test_all_services.html
```

Features:
- ✅ Three tabs (Matching, Booking, Venue)
- ✅ Real-time API health check
- ✅ Pre-filled test data
- ✅ Beautiful UI with response display
- ✅ No installation needed

---

### 2. Using API Documentation

Open in browser:
```
http://localhost:8002/docs          # Matching Service
http://localhost:8003/docs          # Booking Service
http://localhost:8004/docs          # Admin Service
```

Features:
- Interactive Swagger UI
- Try out API endpoints
- See request/response examples
- Full API documentation

---

### 3. Using cURL Commands

```bash
# Health Check
curl http://localhost:8002/health
curl http://localhost:8003/health
curl http://localhost:8004/health

# Create preference (Matching)
curl -X POST http://localhost:8002/matches/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 101,
    "gender": "male",
    "seeking_gender": "female",
    "age_min": 20,
    "age_max": 35,
    "interests": "hiking, movies",
    "bio": "Love outdoor activities"
  }'

# Find match
curl -X POST http://localhost:8002/matches/find \
  -H "Content-Type: application/json" \
  -d '{"user_id": 101}'
```

---

## 📊 Complete Testing Flow

### Scenario: User 101 (Male) and User 102 (Female) Book a Date

**Step 1: Matching Service - Create Preferences**
```
Matching → Create User Preferences
User 101: Male seeking Female
User 102: Female seeking Male
```

**Step 2: Matching Service - Find & Approve Matches**
```
Matching → Find a Match (User 101)
Matching → Approve Match (Both users)
→ Result: MATCHED status
```

**Step 3: Admin Service - Add Venue & Time Slots**
```
Admin → Add Venue (e.g., "The Cozy Café")
Admin → Add Time Slots (dates and times)
```

**Step 4: Booking Service - Create Booking**
```
Booking → Create Booking
→ Status: PENDING_VENUE_APPROVAL
```

**Step 5: Booking Service - Propose & Approve Venue**
```
Booking → Propose Venue (User 101 proposes venue 10)
Booking → View Other's Proposal (User 102 views)
Booking → Approve Venue (User 102 approves)
→ Status: PENDING_TIME_APPROVAL
```

**Step 6: Booking Service - Propose & Approve Time**
```
Booking → Propose Time (User 102 proposes 2026-02-14 19:00)
Booking → View Other's Proposal (User 101 views)
Booking → Approve Time (User 101 approves)
→ Status: BOTH_APPROVED
```

**Step 7: Booking Service - Confirm**
```
Booking → Confirm Booking
→ Status: CONFIRMED
→ Confirmation Code: A7F3E2B1
```

---

## 🔧 Troubleshooting

### Services Won't Start

**Error: "Python not found"**
- Solution: Install Python or add to PATH
- Check: `python --version`

**Error: "Port already in use"**
- Solution: Kill existing process on that port
  ```bash
  # Windows
  netstat -ano | findstr :8002
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -i :8002
  kill -9 <PID>
  ```

**Error: "Module not found"**
- Solution: Install dependencies
  ```bash
  pip install -r matching_service/requirements.txt
  pip install -r booking_service/requirements.txt
  pip install -r venue_service/requirements.txt
  ```

---

### Services Running but API Returns Errors

**Database Connection Error**
- Make sure you're not using Docker Compose with local Python
- Either use all Docker or all local Python
- For local: SQLite fallback (modify DATABASE_URL in .env)

**CORS Errors**
- All services have CORS enabled
- Try the web interface instead of direct fetch

**API Returns 404**
- Service may not be running
- Check terminal for errors
- Try: `http://localhost:8002/health`

---

### Testing Interface Shows "Unhealthy"

**Red dots in API Status**
- Check if service is running: `http://localhost:8002/health`
- Check terminal for startup errors
- Try refreshing the page
- Services take 2-3 seconds to start

---

## 📁 Directory Structure

```
BOOKADATE/
├── matching_service/       # User matching microservice
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── requirements.txt
│   └── Dockerfile
│
├── booking_service/        # Date booking microservice
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── requirements.txt
│   └── Dockerfile
│
├── venue_service/          # Venue management microservice
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   ├── requirements.txt
│   └── Dockerfile
│
├── test_all_services.html  # Web testing interface
├── run_all_services.bat    # Windows batch starter
├── run_all_services.ps1    # PowerShell starter
├── run_all_services.py     # Python starter
├── docker-compose.yml      # Docker configuration
└── README.md              # This file
```

---

## 🌐 Service URLs

Once running, access:

| Service | URL | Docs |
|---------|-----|------|
| Matching | http://localhost:8002 | http://localhost:8002/docs |
| Booking | http://localhost:8003 | http://localhost:8003/docs |
| Admin | http://localhost:8004 | http://localhost:8004/docs |
| Test Interface | file:///d:/BOOKADATE/test_all_services.html | - |

---

## 📝 Example API Calls

### Create User Preference
```bash
curl -X POST http://localhost:8002/matches/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 101,
    "gender": "male",
    "seeking_gender": "female",
    "age_min": 20,
    "age_max": 35,
    "interests": "hiking, coffee",
    "bio": "Adventure seeker"
  }'
```

### Find a Match
```bash
curl -X POST http://localhost:8002/matches/find \
  -H "Content-Type: application/json" \
  -d '{"user_id": 101}'
```

### Create Booking
```bash
curl -X POST http://localhost:8003/bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "match_id": 1,
    "user_1_id": 101,
    "user_2_id": 102
  }'
```

### Add Venue
```bash
curl -X POST http://localhost:8004/venues/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Cozy Coffee Shop",
    "address": "123 Main St",
    "city": "New York",
    "capacity": 50,
    "price_per_hour": 100
  }'
```

---

## 🛑 Stopping Services

**Batch/PowerShell:** Close the terminal windows

**Python Script:** Press `Ctrl+C` in the terminal

**Docker:** Press `Ctrl+C` or run:
```bash
docker-compose down
```

---

## 📞 Support

For issues, check:
1. Service health: Visit `/health` endpoint
2. API docs: Visit `/docs` endpoint
3. Terminal output for error messages
4. Test interface for API status

---

**Happy Dating! 💕**
