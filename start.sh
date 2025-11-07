#!/bin/bash

echo "🏎️  F1 AI Game - Full Stack Startup"
echo "===================================="

# Check if in correct directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Run this script from project root"
    exit 1
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Backend
echo ""
echo "🔧 Starting Backend..."
echo "====================="
cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv and install dependencies
source venv/bin/activate
echo "📥 Installing backend dependencies..."
pip install -q -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Error installing backend dependencies"
    exit 1
fi

# Start backend in background
echo "🚀 Backend starting on http://localhost:8000"
python run.py &
BACKEND_PID=$!

cd ..

# Start Frontend
echo ""
echo "🎨 Starting Frontend..."
echo "======================"
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
echo "🚀 Frontend starting on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

cd ..

# Display info
echo ""
echo "✅ Both servers started!"
echo ""
echo "   🔗 Backend:  http://localhost:8000"
echo "   🔗 API Docs: http://localhost:8000/docs"
echo "   🔗 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
