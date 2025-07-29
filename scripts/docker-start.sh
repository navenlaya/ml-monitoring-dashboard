#!/bin/bash

# ML Monitoring Dashboard - Docker Startup Script

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🐳 Starting ML Monitoring Dashboard (Docker Mode)${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available. Please install Docker Compose.${NC}"
    exit 1
fi

# Function to cleanup
cleanup() {
    echo -e "\n${YELLOW}Stopping containers...${NC}"
    docker-compose down
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Check if model exists, if not train it
if [ ! -f "model/model.pkl" ]; then
    echo -e "${YELLOW}Model not found. Training model first...${NC}"
    if [ ! -d "env" ]; then
        python3 -m venv env
    fi
    source env/bin/activate
    pip install -r requirements.txt
    cd model
    python train_model.py
    cd ..
fi

# Ask for deployment type
echo -e "${BLUE}Select deployment mode:${NC}"
echo "1) Development (with hot reload)"
echo "2) Production (optimized build)"
read -p "Enter choice (1 or 2): " -n 1 -r
echo

case $REPLY in
    1)
        echo -e "${GREEN}Starting in development mode...${NC}"
        docker-compose up --build
        ;;
    2)
        echo -e "${GREEN}Starting in production mode...${NC}"
        docker-compose --profile production up --build -d
        echo -e "\n${GREEN}✅ Production deployment started!${NC}"
        echo -e "\n📊 Access your dashboard:"
        echo -e "   Frontend: ${BLUE}http://localhost${NC}"
        echo -e "   Backend API: ${BLUE}http://localhost:8000${NC}"
        echo -e "   API Documentation: ${BLUE}http://localhost:8000/docs${NC}"
        echo -e "\n💡 Run 'docker-compose logs -f' to view logs"
        echo -e "💡 Run 'docker-compose down' to stop services"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac 