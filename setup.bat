@echo off
echo ====================================
echo Google Calendar Clone - Setup Script
echo ====================================
echo.

echo [1/4] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Error installing backend dependencies!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo [2/4] Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo Error installing frontend dependencies!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo [3/4] Checking PostgreSQL connection...
cd ..\backend
echo Please ensure PostgreSQL is running and you have created the database 'calendar_db'
echo.
pause

echo [4/4] Initializing database...
call npm run init-db
if errorlevel 1 (
    echo Error initializing database!
    echo Please check your PostgreSQL connection and database settings in backend\.env
    pause
    exit /b 1
)
echo.

echo ====================================
echo Setup completed successfully!
echo ====================================
echo.
echo To start the application:
echo 1. Run 'start-app.bat' to start both servers
echo 2. Or manually start:
echo    - Backend: cd backend ^&^& npm run dev
echo    - Frontend: cd frontend ^&^& npm start
echo.
pause
