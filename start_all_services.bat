@echo off
echo Starting Blind Dating Platform Services
echo ======================================

echo Starting User Service...
start "User Service" cmd /k "cd user_service && python main.py"
timeout /t 2

echo Starting Matching Service...
start "Matching Service" cmd /k "cd matching_service && python main.py"
timeout /t 2

echo Starting Booking Service...
start "Booking Service" cmd /k "cd booking_service && python main.py"
timeout /t 2

echo Starting Venue Service...
start "Venue Service" cmd /k "cd venue_service && python main.py"
timeout /t 2

echo Starting Chat Service...
start "Chat Service" cmd /k "cd chat_service && python main.py"
timeout /t 2

echo Starting Gateway...
start "Gateway" cmd /k "cd gateway && python main.py"

echo All services started!
echo Check each window for any errors.
pause
