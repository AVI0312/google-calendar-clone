#!/bin/bash

echo "===================================="
echo "Google Calendar Clone - Setup Script"
echo "===================================="
echo ""

echo "[1/4] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Error installing backend dependencies!"
    exit 1
fi
echo "Backend dependencies installed successfully!"
echo ""

echo "[2/4] Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Error installing frontend dependencies!"
    exit 1
fi
echo "Frontend dependencies installed successfully!"
echo ""

echo "[3/4] Checking PostgreSQL connection..."
cd ../backend
echo "Please ensure PostgreSQL is running and you have created the database 'calendar_db'"
echo ""
read -p "Press enter to continue..."

echo "[4/4] Initializing database..."
npm run init-db
if [ $? -ne 0 ]; then
    echo "Error initializing database!"
    echo "Please check your PostgreSQL connection and database settings in backend/.env"
    exit 1
fi
echo ""

echo "===================================="
echo "Setup completed successfully!"
echo "===================================="
echo ""
echo "To start the application:"
echo "1. Run './start-app.sh' to start both servers"
echo "2. Or manually start:"
echo "   - Backend: cd backend && npm run dev"
echo "   - Frontend: cd frontend && npm start"
echo ""
