#!/bin/bash

# ML Monitoring Dashboard - Development Startup Script

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting ML Monitoring Dashboard (Development Mode)${NC}"

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Check if virtual environment exists
if [ ! -d "env" ]; then
    echo -e "${YELLOW}Virtual environment not found. Running setup...${NC}"
    ./scripts/setup.sh
fi

# Activate virtual environment
source env/bin/activate

# Initialize database if it doesn't exist
if [ ! -f "ml_monitoring.db" ]; then
    echo -e "${BLUE}Initializing database...${NC}"
    python -c "from api.database import init_database; init_database()"
fi

# Start backend API
echo -e "${GREEN}Starting backend API on http://localhost:8000${NC}"
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend development server
echo -e "${GREEN}Starting frontend on http://localhost:5173${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Start request simulation (optional)
read -p "Start request simulation? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Starting request simulation...${NC}"
    sleep 5  # Wait for services to be ready
    python simulate_requests.py &
    SIMULATION_PID=$!
fi

echo -e "\n${GREEN}✅ All services started successfully!${NC}"
echo -e "\n📊 Access your dashboard:"
echo -e "   Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "   Backend API: ${BLUE}http://localhost:8000${NC}"
echo -e "   API Documentation: ${BLUE}http://localhost:8000/docs${NC}"
echo -e "\n💡 Press Ctrl+C to stop all services"

# Wait for user to stop
wait 