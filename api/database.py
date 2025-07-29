from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
from datetime import datetime
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ml_monitoring.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Input features
    med_inc = Column(Float)
    house_age = Column(Float)
    ave_rooms = Column(Float)
    ave_bedrms = Column(Float)
    population = Column(Float)
    ave_occup = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    
    # Prediction results
    predicted_price = Column(Float)
    confidence = Column(Float, nullable=True)
    actual_price = Column(Float, nullable=True)
    error = Column(Float, nullable=True)
    
    # Model info
    model_version = Column(String(50), default="v1.0")

class SystemMetrics(Base):
    __tablename__ = "system_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # API metrics
    response_time_ms = Column(Float)
    request_count = Column(Integer, default=1)
    error_count = Column(Integer, default=0)
    
    # System metrics
    cpu_usage = Column(Float)
    memory_usage = Column(Float)
    disk_usage = Column(Float)

class ModelPerformance(Base):
    __tablename__ = "model_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    model_version = Column(String(50), default="v1.0")
    
    # Performance metrics
    mae = Column(Float)  # Mean Absolute Error
    mse = Column(Float)  # Mean Squared Error
    rmse = Column(Float)  # Root Mean Squared Error
    r2_score = Column(Float)
    prediction_count = Column(Integer)
    
    # Data drift indicators
    feature_drift_score = Column(Float, nullable=True)
    target_drift_score = Column(Float, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    alert_type = Column(String(50))  # 'performance', 'drift', 'system', 'error'
    severity = Column(String(20))    # 'low', 'medium', 'high', 'critical'
    title = Column(String(200))
    message = Column(Text)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)

# Database dependency
def get_database():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database initialization
def init_database():
    create_tables()
    print("Database initialized successfully!")

if __name__ == "__main__":
    init_database() 