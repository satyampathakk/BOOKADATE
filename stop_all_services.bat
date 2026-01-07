@echo off
REM BookADate - Stop All Microservices (Batch)
REM Closes service windows started by run_all_services.bat and frees ports 8000-8006

setlocal ENABLEDELAYEDEXPANSION

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                 BookADate - Stop All Services                           ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

echo [1/2] Closing service windows by title...
call :killWindow "BookADate - User Service (8006)"
call :killWindow "BookADate - Chat Service (8001)"
call :killWindow "BookADate - Face Auth Service (8005)"
call :killWindow "BookADate - Matching Service (8002)"
call :killWindow "BookADate - Booking Service (8003)"
call :killWindow "BookADate - Admin Service (8004)"
call :killWindow "BookADate - API Gateway (8000)"

echo.
echo [2/2] Killing any processes listening on service ports...
call :killPort 8000 "API Gateway"
call :killPort 8001 "Chat Service"
call :killPort 8002 "Matching Service"
call :killPort 8003 "Booking Service"
call :killPort 8004 "Admin Service"
call :killPort 8005 "Face Auth Service"
call :killPort 8006 "User Service"

echo.
echo Done. If any windows remain, close them manually.
echo You can re-run run_all_services.bat to start fresh.
echo.
pause
exit /b 0

:killWindow
REM %1 = exact window title used by START in run_all_services.bat
set "WTITLE=%~1"
taskkill /FI "WINDOWTITLE eq %WTITLE%" /T /F >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo  ✓ Closed window: %WTITLE%
) else (
  echo  - Window not found (may already be closed): %WTITLE%
)
exit /b 0

:killPort
REM %1 = port, %2 = friendly name
echo  Scanning port %1 (%~2)...
set "KILLED=0"
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":%1 " ^| findstr LISTENING') do (
  taskkill /PID %%P /F >nul 2>&1
  if !ERRORLEVEL! EQU 0 (
    echo   ✓ Killed PID %%P on port %1
    set "KILLED=1"
  )
)
if !KILLED! EQU 0 echo   - No LISTENING process found on port %1
exit /b 0
