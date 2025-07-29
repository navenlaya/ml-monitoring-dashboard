# Real-Time ML Monitoring Dashboard

A comprehensive full-stack machine learning monitoring system that deploys ML models with real-time prediction tracking, admin controls, and interactive visualizations. The system simulates live user input and provides detailed insights into model performance, prediction accuracy, and system health.

## Features

### Core Functionality
- **ML Model**: Linear Regression trained on California Housing dataset
- **Real-time API**: FastAPI backend serving predictions with confidence scores
- **Live Dashboard**: React + TypeScript frontend with real-time chart updates
- **Admin Interface**: Protected admin dashboard with system controls
- **User Interface**: Public prediction interface for end users
- **Data Simulation**: Automated request simulation for testing and demonstration

### Monitoring Capabilities
- Real-time prediction tracking
- Confidence score visualization
- Prediction error analysis
- Request logging and history
- Interactive charts and metrics

## Tech Stack

- **Backend**: FastAPI, scikit-learn, Joblib, Pandas, NumPy
- **Frontend**: React + TypeScript, Vite, Chart.js/D3 (for visualizations)
- **ML**: scikit-learn (Linear Regression)
- **Data**: CSV-based logging and data storage
- **Development**: Python virtual environments, npm/Node.js

## Project Structure

```
ml-monitoring-dashboard/
├── api/                    # FastAPI backend
├── frontend/              # React + TypeScript frontend
├── model/                 # ML model training scripts
├── data/                  # Training and simulation data
├── logs/                  # System and prediction logs
└── simulate_requests.py   # Request simulation script
```

## Setup and Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
1. **Create virtual environment**:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Train the model**:
   ```bash
   python model/train_model.py
   ```

### Frontend Setup
1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### 1. Start the Backend API
```bash
# Make sure virtual environment is activated
uvicorn api.main:app --reload
```
API will be available at `http://localhost:8000`

### 2. Start the Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will be available at `http://localhost:5173`

### 3. (Optional) Run Prediction Simulation
In a separate terminal:
```bash
python simulate_requests.py
```

## Usage

- **User Interface**: Access the public prediction interface to make housing price predictions
- **Admin Dashboard**: Use the admin interface to monitor system performance and manage settings
- **Real-time Monitoring**: Watch live updates of predictions, confidence scores, and errors
- **API Documentation**: Visit `http://localhost:8000/docs` for interactive API documentation

## 🚀 **Enhanced Features (New!)**

### **Database Integration**
- **SQLite Database**: Replaced CSV logging with structured database storage
- **Advanced Analytics**: Model performance tracking, prediction distribution analysis
- **Real-time Alerts**: Automated anomaly detection and notification system
- **System Monitoring**: CPU, memory, and API performance metrics

### **Production Deployment**
- **Docker Containerization**: Full-stack containerized deployment
- **Multi-stage Builds**: Optimized production builds for frontend
- **Load Balancing**: Nginx reverse proxy configuration
- **Health Checks**: Container health monitoring

### **Enhanced Analytics Dashboard**
- **Performance Metrics**: MAE, MSE, RMSE, R² score tracking
- **Prediction Trends**: Real-time timeline visualizations
- **Distribution Analysis**: Prediction distribution histograms
- **Alert Management**: System alerts and anomaly notifications

### **API Enhancements**
- **RESTful Endpoints**: Comprehensive API with OpenAPI documentation
- **Performance Monitoring**: Response time and error rate tracking
- **Model Versioning**: Support for multiple model versions
- **Advanced Querying**: Flexible data filtering and aggregation

## 🛠 **Quick Start (Enhanced)**

### **Option 1: Automated Setup**
```bash
# One-command setup
./scripts/setup.sh

# Start development environment
./scripts/start-dev.sh
```

### **Option 2: Docker Deployment**
```bash
# Quick Docker start
./scripts/docker-start.sh

# Or manually
docker-compose up --build
```

### **Option 3: Manual Setup**
Follow the original setup instructions below.

## Development

- **Backend**: Auto-reloads with database integration and enhanced logging
- **Frontend**: Hot-reload with new analytics components and real-time updates
- **Database**: SQLite with comprehensive data models for all metrics
- **Scripts**: Automated setup and deployment scripts for streamlined development

