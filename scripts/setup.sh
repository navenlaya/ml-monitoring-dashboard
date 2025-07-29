#!/bin/bash

# ML Monitoring Dashboard - Enhanced Setup Script
echo "🚀 Setting up ML Monitoring Dashboard (Enhanced Version)"

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

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if Docker is installed (optional)
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. Docker deployment will not be available."
    DOCKER_AVAILABLE=false
else
    DOCKER_AVAILABLE=true
fi

print_status "Creating Python virtual environment..."
python3 -m venv env
source env/bin/activate

print_status "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

print_status "Training ML model..."
cd model
python train_model.py
cd ..

print_status "Initializing database..."
python -c "from api.database import init_database; init_database()"

print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

print_success "✅ Setup completed successfully!"

echo ""
echo "📋 Next Steps:"
echo "1. Development Mode:"
echo "   - Backend: source env/bin/activate && uvicorn api.main:app --reload"
echo "   - Frontend: cd frontend && npm run dev"
echo "   - Simulation: python simulate_requests.py"
echo ""

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "2. Docker Mode:"
    echo "   - Full stack: docker-compose up --build"
    echo "   - Production: docker-compose --profile production up --build"
    echo ""
fi

echo "🌐 URLs:"
echo "   - Frontend: http://localhost:5173 (dev) or http://localhost (docker)"
echo "   - Backend API: http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""

echo "🔧 Enhanced Features:"
echo "   - SQLite database with advanced analytics"
echo "   - Real-time alerts and monitoring"
echo "   - Model performance tracking"  
echo "   - Docker containerization"
echo "   - Production-ready deployment"

print_success "🎉 Your enhanced ML monitoring dashboard is ready!" 