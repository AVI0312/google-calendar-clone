@echo off
echo ====================================
echo Starting Google Calendar Clone
echo ====================================
echo.

echo Starting Backend Server...
start "Calendar Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Calendar Frontend" cmd /k "cd frontend && npm start"

echo.
echo ====================================
echo Servers are starting...
echo ====================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two terminal windows will open.
echo Close this window or press any key...
pause > nul
