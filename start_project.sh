#!/bin/bash

# ML Monitoring Dashboard - Easy Startup Script
# This script handles all the setup and startup automatically

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    # Kill background processes
    pkill -f "uvicorn api.main:app" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "simulate_requests.py" 2>/dev/null || true
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}🚀 Starting ML Monitoring Dashboard${NC}"
echo -e "${BLUE}================================${NC}"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ] || [ ! -d "api" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the ml-monitoring-dashboard root directory"
    exit 1
fi

# Check Python dependencies
print_status "Checking Python dependencies..."
if ! /usr/bin/python3 -c "import fastapi, uvicorn, sqlalchemy" 2>/dev/null; then
    print_warning "Some Python packages are missing. Installing..."
    
    # Try to install missing packages
    if command -v pip3 &> /dev/null; then
        pip3 install --user fastapi uvicorn sqlalchemy pandas scikit-learn numpy 2>/dev/null || {
            print_warning "Could not install packages. Some features may not work."
        }
    fi
else
    print_success "Python dependencies are available"
fi

# Check if model exists
if [ ! -f "model/model.pkl" ]; then
    print_warning "ML model not found. Training model..."
    if /usr/bin/python3 -c "import joblib" 2>/dev/null; then
        cd model
        /usr/bin/python3 train_model.py
        cd ..
        print_success "Model trained successfully"
    else
        print_warning "Could not train model. Some features may not work."
    fi
fi

# Initialize database if needed
if [ ! -f "ml_monitoring.db" ]; then
    print_status "Initializing database..."
    /usr/bin/python3 -c "from api.database import init_database; init_database()" 2>/dev/null || {
        print_warning "Could not initialize database. Some features may not work."
    }
fi

# Start backend
print_status "Starting backend API..."
/usr/bin/python3 -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
print_status "Waiting for backend to start..."
for i in {1..10}; do
    if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
        print_success "Backend is running on http://localhost:8000"
        break
    fi
    if [ $i -eq 10 ]; then
        print_error "Backend failed to start. Check backend.log for details"
        exit 1
    fi
    sleep 1
done

# Start frontend
print_status "Starting frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
print_status "Waiting for frontend to start..."
for i in {1..15}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        print_success "Frontend is running on http://localhost:5173"
        break
    fi
    if [ $i -eq 15 ]; then
        print_warning "Frontend may still be starting. Check frontend.log for details"
    fi
    sleep 1
done

# Optional: Start request simulation
read -p "Start request simulation? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting request simulation..."
    /usr/bin/python3 simulate_requests.py > simulation.log 2>&1 &
    SIMULATION_PID=$!
    print_success "Request simulation started"
fi

echo -e "\n${GREEN}🎉 ML Monitoring Dashboard is now running!${NC}"
echo -e "\n📊 Access your dashboard:"
echo -e "   Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "   Backend API: ${BLUE}http://localhost:8000${NC}"
echo -e "   API Documentation: ${BLUE}http://localhost:8000/docs${NC}"
echo -e "\n📝 Logs:"
echo -e "   Backend: ${BLUE}backend.log${NC}"
echo -e "   Frontend: ${BLUE}frontend.log${NC}"
if [ ! -z "$SIMULATION_PID" ]; then
    echo -e "   Simulation: ${BLUE}simulation.log${NC}"
fi
echo -e "\n💡 Press Ctrl+C to stop all services"
echo -e "💡 Run this script again anytime to restart the project"

# Wait for user to stop
wait
