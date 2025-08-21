# ML Monitoring Dashboard

A comprehensive, production-ready machine learning monitoring system that provides real-time model performance tracking, interactive visualizations, and advanced analytics. Built with FastAPI, React + TypeScript, and SQLite database integration.

## Features

### Core ML Capabilities
- **Linear Regression Model**: Trained on California Housing dataset
- **Real-time Predictions**: Instant property valuation with confidence scores
- **Model Performance Tracking**: MAE, MSE, RMSE, and R² score monitoring
- **Data Drift Detection**: Automated feature and target drift analysis

### Advanced Analytics Dashboard
- **Real-time Metrics**: Live updates of predictions, errors, and system performance
- **Interactive Charts**: Multi-chart visualization with Chart.js and Recharts
- **Performance Trends**: Historical model performance analysis
- **Distribution Analysis**: Prediction and error distribution histograms

### Admin & User Interfaces
- **Public Prediction Interface**: User-friendly property valuation form
- **Protected Admin Dashboard**: Comprehensive system monitoring and controls
- **Role-based Access**: Secure admin authentication system
- **Responsive Design**: Mobile-optimized Material-UI interface

### Database & Monitoring
- **SQLite Database**: Structured storage for predictions, metrics, and alerts
- **System Metrics**: CPU, memory, and disk usage monitoring
- **Alert System**: Automated anomaly detection and notification
- **Request Logging**: Comprehensive API call tracking and analysis

### Production Deployment
- **Docker Containerization**: Full-stack containerized deployment
- **Multi-stage Builds**: Optimized production builds
- **Health Checks**: Container health monitoring and auto-restart
- **Load Balancing**: Nginx reverse proxy configuration

## Tech Stack

### Backend
- **FastAPI 0.115.12**: High-performance Python web framework
- **SQLAlchemy 2.0.36**: Database ORM and migration support
- **scikit-learn 1.6.1**: Machine learning model training and inference
- **Pandas 2.2.3**: Data manipulation and analysis
- **NumPy 2.2.6**: Numerical computing
- **Uvicorn**: ASGI server for production deployment

### Frontend
- **React 19.1.0**: Modern UI framework with TypeScript
- **Material-UI 7.2.0**: Professional component library
- **Chart.js 4.5.0**: Interactive data visualizations
- **Recharts 2.13.3**: Advanced charting components
- **Vite 7.0.4**: Fast build tool and dev server
- **React Router 7.6.3**: Client-side routing

### Database & Infrastructure
- **SQLite**: Lightweight database for development and small production
- **Docker**: Containerization and orchestration
- **Nginx**: Reverse proxy and static file serving
- **Alembic**: Database migration management

## Project Structure

```
ml-monitoring-dashboard/
├── api/                    # FastAPI backend application
│   ├── main.py            # Main API endpoints and configuration
│   ├── database.py        # Database models and connection management
│   └── services.py        # Business logic and monitoring services
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components (Admin, User, Protected)
│   │   ├── contexts/      # Theme and state management
│   │   └── types/         # TypeScript type definitions
│   ├── Dockerfile         # Frontend container configuration
│   └── package.json       # Node.js dependencies
├── model/                 # ML model training and persistence
│   └── train_model.py     # Model training script
├── data/                  # Training data and simulation files
├── database/              # SQLite database files
├── logs/                  # Application and system logs
├── scripts/               # Automation and deployment scripts
├── docker-compose.yml     # Multi-service container orchestration
├── Dockerfile             # Backend container configuration
└── requirements.txt       # Python dependencies
```

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd ml-monitoring-dashboard

# Run automated setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# Start development environment
./scripts/start-dev.sh
```

### Option 2: Docker Deployment
```bash
# Quick Docker start
./scripts/docker-start.sh

# Or manual Docker deployment
docker-compose up --build
```

### Option 3: Manual Setup
```bash
# Backend setup
python3 -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
python model/train_model.py
uvicorn api.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

## Access Points

- **Frontend**: http://localhost:5173 (dev) or http://localhost (docker)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Admin Dashboard**: http://localhost:5173/admin

## API Endpoints

### Core Endpoints
- `POST /predict` - Make property price predictions
- `GET /metrics` - Retrieve system and model metrics
- `GET /predictions` - Get prediction history
- `GET /performance` - Model performance analytics
- `GET /alerts` - System alerts and notifications

### Monitoring Endpoints
- `GET /health` - System health check
- `GET /system-metrics` - Real-time system performance
- `GET /model-metrics` - ML model performance data

## Frontend Features

### User Prediction Interface
- **Interactive Form**: Input property features for valuation
- **Real-time Results**: Instant prediction with confidence scores
- **Historical View**: Previous predictions and accuracy tracking
- **Responsive Design**: Mobile-friendly interface

### Admin Dashboard
- **Performance Metrics**: Real-time model accuracy tracking
- **System Monitoring**: CPU, memory, and API performance
- **Alert Management**: System alerts and anomaly notifications
- **Data Analytics**: Prediction distribution and trend analysis
- **User Management**: Access control and authentication

### Theme & Navigation
- **Dark/Light Mode**: Toggle between themes
- **Responsive Navigation**: Mobile-optimized menu system
- **Material Design**: Professional UI components
- **Accessibility**: Screen reader and keyboard navigation support

## Database Schema

### Core Tables
- **predictions**: Individual prediction records with features and results
- **system_metrics**: Real-time system performance data
- **model_performance**: ML model accuracy and drift metrics
- **alerts**: System notifications and anomaly alerts

### Data Models
```sql
-- Predictions table
CREATE TABLE predictions (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME,
    med_inc FLOAT,
    house_age FLOAT,
    ave_rooms FLOAT,
    ave_bedrms FLOAT,
    population FLOAT,
    ave_occup FLOAT,
    latitude FLOAT,
    longitude FLOAT,
    predicted_price FLOAT,
    confidence FLOAT,
    actual_price FLOAT,
    error FLOAT,
    model_version VARCHAR(50)
);
```

## Configuration

### Environment Variables
```bash
# Database configuration
DATABASE_URL=sqlite:///./ml_monitoring.db

# API configuration
API_HOST=0.0.0.0
API_PORT=8000
API_WORKERS=4

# Frontend configuration
VITE_API_BASE_URL=http://localhost:8000
```

### Database Configuration
- **SQLite** (default): Perfect for development and small production
- **PostgreSQL**: Recommended for production deployments
- **MySQL**: Alternative production database option

## Deployment Options

### Development
- Local Python environment with hot reload
- Frontend development server with Vite
- SQLite database for easy setup

### Docker Development
- Containerized environment with volume mounts
- Hot reload for both frontend and backend
- Persistent database storage

### Production
- Multi-stage Docker builds
- Nginx reverse proxy with SSL
- Health checks and auto-restart
- Load balancing and scaling support

## Monitoring & Analytics

### Real-time Metrics
- **Model Performance**: Accuracy, error rates, confidence scores
- **System Health**: CPU, memory, disk usage, API response times
- **Business Metrics**: Prediction volume, user activity, trends

### Alert System
- **Performance Alerts**: Model accuracy degradation
- **System Alerts**: Resource usage thresholds
- **Data Drift Alerts**: Feature distribution changes
- **Error Alerts**: API failures and exceptions

### Visualization Features
- **Time Series Charts**: Performance trends over time
- **Distribution Histograms**: Prediction and error distributions
- **Real-time Updates**: Live data streaming
- **Interactive Filters**: Date ranges and metric selection

## Security Features

- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Pydantic model validation
- **SQL Injection Protection**: SQLAlchemy ORM protection
- **Rate Limiting**: API request throttling
- **Environment Variable Management**: Secure configuration

## Testing & Simulation

### Request Simulation
```bash
# Run automated prediction simulation
python simulate_requests.py

# Custom simulation parameters
python simulate_requests.py --count 1000 --interval 0.1
```

### Model Training
```bash
# Retrain the model
cd model
python train_model.py

# Custom training parameters
python train_model.py --test-size 0.2 --random-state 42
```

## Development

### Prerequisites
- **Python 3.8+**: Backend development
- **Node.js 16+**: Frontend development
- **Docker**: Containerized deployment (optional)

### Development Workflow
1. **Backend Changes**: Auto-reload with uvicorn
2. **Frontend Changes**: Hot-reload with Vite
3. **Database Changes**: Alembic migrations
4. **Testing**: Automated simulation and validation

### Code Quality
- **TypeScript**: Strict type checking for frontend
- **Pydantic**: Data validation for API
- **ESLint**: Code quality enforcement
- **Black**: Python code formatting

## Troubleshooting

### Common Issues

#### Backend Connection Issues
```bash
# Check backend status
curl http://localhost:8000/docs

# View logs
docker-compose logs backend
```

#### Database Issues
```bash
# Recreate database
python -c "from api.database import init_database; init_database()"

# Check database file
ls -la database/*.db
```

#### Frontend Build Issues
```bash
# Clear dependencies and rebuild
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Performance Issues
- Monitor resource usage with `docker stats`
- Check database query performance
- Analyze network bottlenecks
- Review application logs for errors

## Additional Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Comprehensive deployment guide
- **[API Documentation](http://localhost:8000/docs)**: Interactive API reference
- **Component Documentation**: Frontend component usage examples


