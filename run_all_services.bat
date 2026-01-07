@echo off
REM BookADate - Run All Microservices
REM This script starts all microservices in separate terminal windows

setlocal ENABLEDELAYEDEXPANSION

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                 BookADate - All Microservices Starter                  ║
echo ║    Starting: User, Chat, Matching, Booking, Venue + Gateway           ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Check if services directories exist
for %%S in (user_service chat_service matching_service booking_service venue_service gateway) do (
    if not exist "%%S" (
        echo ERROR: %%S directory not found!
        echo Please run this script from the BOOKADATE root directory.
        pause
        exit /b 1
    )
)

echo [1/6] Starting USER SERVICE on port 8006...
start "BookADate - User Service (8006)" cmd /k "cd user_service && python -m pip install -r requirements.txt && python main.py"
timeout /t 2 /nobreak

echo [2/6] Starting CHAT SERVICE on port 8001...
start "BookADate - Chat Service (8001)" cmd /k "cd chat_service && if exist requirements.txt (python -m pip install -r requirements.txt) & python main.py"
timeout /t 2 /nobreak

echo [3/6] Starting MATCHING SERVICE on port 8002...
start "BookADate - Matching Service (8002)" cmd /k "cd matching_service && if exist requirements.txt (python -m pip install -r requirements.txt) & python main.py"
timeout /t 2 /nobreak

echo [4/6] Starting BOOKING SERVICE on port 8003...
start "BookADate - Booking Service (8003)" cmd /k "cd booking_service && if exist requirements.txt (python -m pip install -r requirements.txt) & python main.py"
timeout /t 2 /nobreak

echo [5/6] Starting VENUE SERVICE on port 8004...
start "BookADate - Venue Service (8004)" cmd /k "cd venue_service && if exist requirements.txt (python -m pip install -r requirements.txt) & python main.py"
timeout /t 2 /nobreak

echo [6/6] Starting API GATEWAY on port 8000...
start "BookADate - API Gateway (8000)" cmd /k "cd gateway && if exist requirements.txt (python -m pip install -r requirements.txt) & python main.py"
timeout /t 2 /nobreak

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                 Monitoring Service Health (Ctrl+C to stop)            ║
echo ╚════════════════════════════════════════════════════════════════════════╝

:monitor
cls
echo Checking health... (refreshes every 5 seconds)
echo.
call :health 8000 "API Gateway"
call :health 8001 "Chat Service"
call :health 8002 "Matching Service"
call :health 8003 "Booking Service"
call :health 8004 "Venue Service"
call :health 8006 "User Service"
echo.
echo Test Interface:  file:///d:/BOOKADATE/test_all_services.html
echo Docs examples:   http://localhost:8002/docs  (change port)
echo.
timeout /t 5 /nobreak >nul
goto monitor

:health
REM %1 = port, %2 = name
powershell -NoProfile -ExecutionPolicy Bypass -Command "\
    $u=\"http://localhost:%1/health\"; \
    try { \
        $r=Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop; \
        if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { \
            Write-Host ('  ✓ %2 (:%1) healthy') -ForegroundColor Green \
        } else { \
            Write-Host ('  ✗ %2 (:%1) responded ' + $r.StatusCode) -ForegroundColor Yellow \
        } \
    } catch { \
        Write-Host ('  ✗ %2 (:%1) not responding') -ForegroundColor Red \
    }"
exit /b 0
