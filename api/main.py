from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
import time
from datetime import datetime
from typing import Optional, List, Dict
from sqlalchemy.orm import Session

from .database import get_database, init_database
from .services import MonitoringService, AlertService, AnalyticsService, GeocodingService

# Define the FastAPI app
app = FastAPI(
    title="ML Monitoring Inference API",
    description="Enhanced ML monitoring system with database integration and analytics",
    version="2.0.0"
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_database()

# Cors for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model with an absolute path to avoid loading errors
model_path = os.path.join(os.path.dirname(__file__), "..", "model", "model.pkl")
model_path = os.path.abspath(model_path)
model = joblib.load(model_path)

# Define the input format
class HouseData(BaseModel):
    MedInc: float
    HouseAge: float
    AveRooms: float
    AveBedrms: float
    Population: float
    AveOccup: float
    Latitude: Optional[float] = None
    Longitude: Optional[float] = None

class AddressHouseData(BaseModel):
    address: str
    MedInc: float
    HouseAge: float
    AveRooms: float
    AveBedrms: float
    Population: float
    AveOccup: float

# Prediction route
@app.post("/predict")
def predict(data: HouseData, db: Session = Depends(get_database)):
    start_time = time.time()
    
    try:
        # Convert input data to 2D NumPy array
        input_data = np.array([[data.MedInc, data.HouseAge, data.AveRooms,
                                data.AveBedrms, data.Population, data.AveOccup,
                                data.Latitude, data.Longitude]])

        # Predict
        prediction = model.predict(input_data)[0]

        # Calculate confidence based on error (higher error = lower confidence)
        confidence = None
        actual_price = None
        max_error = 5.0
        
        try:
            df = pd.read_csv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "simulated_stream.csv")))
            feature_cols = ["MedInc", "HouseAge", "AveRooms", "AveBedrms", "Population", "AveOccup", "Latitude", "Longitude"]
            df_clean = df.dropna(subset=feature_cols + ["actual_prices"])
            if not df_clean.empty:
                X = df_clean[feature_cols].values.astype(float)
                input_vec = np.array([data.MedInc, data.HouseAge, data.AveRooms, data.AveBedrms, data.Population, data.AveOccup, data.Latitude, data.Longitude], dtype=float)
                dists = np.linalg.norm(X - input_vec, axis=1)
                idx = np.argmin(dists)
                closest_actual = df_clean.iloc[idx]["actual_prices"]
                if pd.notnull(closest_actual):
                    actual_price = float(closest_actual)
                    error_val = abs(prediction - actual_price)
                    confidence = max(0.0, min(1.0, 1 - (error_val / max_error)))
        except Exception as e:
            pass

        # Log prediction to database
        input_dict = {
            "MedInc": data.MedInc,
            "HouseAge": data.HouseAge,
            "AveRooms": data.AveRooms,
            "AveBedrms": data.AveBedrms,
            "Population": data.Population,
            "AveOccup": data.AveOccup,
            "Latitude": data.Latitude,
            "Longitude": data.Longitude
        }
        
        MonitoringService.log_prediction(
            db=db,
            input_data=input_dict,
            predicted_price=prediction,
            confidence=confidence,
            actual_price=actual_price,
            model_version="v1.0"
        )
        
        # Log system metrics
        response_time_ms = (time.time() - start_time) * 1000
        MonitoringService.log_system_metrics(
            db=db,
            response_time_ms=response_time_ms,
            request_count=1,
            error_count=0
        )

        return {
            "predicted_price": round(prediction, 3),
            "confidence": round(confidence, 3) if confidence is not None else None,
            "model_version": "v1.0",
            "response_time_ms": round(response_time_ms, 2)
        }
        
    except Exception as e:
        # Log error metrics
        response_time_ms = (time.time() - start_time) * 1000
        MonitoringService.log_system_metrics(
            db=db,
            response_time_ms=response_time_ms,
            request_count=1,
            error_count=1
        )
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Address-based prediction route
@app.post("/predict/address")
def predict_from_address(data: AddressHouseData, db: Session = Depends(get_database)):
    start_time = time.time()
    
    try:
        # Geocode the address to get coordinates
        coordinates = GeocodingService.geocode_address(data.address)
        
        if not coordinates:
            raise HTTPException(
                status_code=400, 
                detail=f"Could not geocode address: {data.address}. Please check the address or provide coordinates manually."
            )
        
        lat, lon = coordinates
        
        # Create HouseData object with geocoded coordinates
        house_data = HouseData(
            MedInc=data.MedInc,
            HouseAge=data.HouseAge,
            AveRooms=data.AveRooms,
            AveBedrms=data.AveBedrms,
            Population=data.Population,
            AveOccup=data.AveOccup,
            Latitude=lat,
            Longitude=lon
        )
        
        # Convert input data to 2D NumPy array
        input_data = np.array([[house_data.MedInc, house_data.HouseAge, house_data.AveRooms,
                                house_data.AveBedrms, house_data.Population, house_data.AveOccup,
                                house_data.Latitude, house_data.Longitude]])

        # Predict
        prediction = model.predict(input_data)[0]

        # Calculate confidence based on error (higher error = lower confidence)
        confidence = None
        actual_price = None
        max_error = 5.0
        
        try:
            df = pd.read_csv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "simulated_stream.csv")))
            feature_cols = ["MedInc", "HouseAge", "AveRooms", "AveBedrms", "Population", "AveOccup", "Latitude", "Longitude"]
            df_clean = df.dropna(subset=feature_cols + ["actual_prices"])
            if not df_clean.empty:
                X = df_clean[feature_cols].values.astype(float)
                input_vec = np.array([house_data.MedInc, house_data.HouseAge, house_data.AveRooms,
                                    house_data.AveBedrms, house_data.Population, house_data.AveOccup,
                                    house_data.Latitude, house_data.Longitude], dtype=float)
                dists = np.linalg.norm(X - input_vec, axis=1)
                idx = np.argmin(dists)
                closest_actual = df_clean.iloc[idx]["actual_prices"]
                if pd.notnull(closest_actual):
                    actual_price = float(closest_actual)
                    error_val = abs(prediction - actual_price)
                    confidence = max(0.0, min(1.0, 1 - (error_val / max_error)))
        except Exception as e:
            pass

        # Log prediction to database
        input_dict = {
            "MedInc": house_data.MedInc,
            "HouseAge": house_data.HouseAge,
            "AveRooms": house_data.AveRooms,
            "AveBedrms": house_data.AveBedrms,
            "Population": house_data.Population,
            "AveOccup": house_data.AveOccup,
            "Latitude": house_data.Latitude,
            "Longitude": house_data.Longitude
        }
        
        MonitoringService.log_prediction(
            db=db,
            features=input_dict,
            predicted_price=prediction,
            confidence=confidence,
            actual_price=actual_price,
            model_version="v1.0"
        )
        
        # Log system metrics
        response_time_ms = (time.time() - start_time) * 1000
        MonitoringService.log_system_metrics(
            db=db,
            response_time_ms=response_time_ms,
            request_count=1,
            error_count=0
        )

        return {
            "predicted_price": round(prediction, 3),
            "confidence": round(confidence, 3) if confidence is not None else None,
            "model_version": "v1.0",
            "response_time_ms": round(response_time_ms, 2),
            "geocoded_coordinates": {
                "latitude": round(lat, 6),
                "longitude": round(lon, 6)
            },
            "address": data.address
        }
        
    except Exception as e:
        # Log error metrics
        response_time_ms = (time.time() - start_time) * 1000
        MonitoringService.log_system_metrics(
            db=db,
            response_time_ms=response_time_ms,
            request_count=1,
            error_count=1
        )
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Enhanced API Endpoints

@app.get("/api/dashboard/stats")
def get_dashboard_stats(hours: int = 24, db: Session = Depends(get_database)):
    """Get comprehensive dashboard statistics"""
    return MonitoringService.get_dashboard_stats(db, hours)

@app.get("/api/predictions/timeline")
def get_predictions_timeline(
    hours: int = 24, 
    limit: int = 100, 
    db: Session = Depends(get_database)
):
    """Get predictions timeline for charts"""
    return MonitoringService.get_predictions_timeline(db, hours, limit)

@app.get("/api/analytics/performance")
def get_model_performance(
    model_version: str = "v1.0",
    hours: int = 24,
    db: Session = Depends(get_database)
):
    """Get model performance metrics"""
    performance = AnalyticsService.calculate_model_performance(db, model_version, hours)
    if performance is None:
        raise HTTPException(status_code=404, detail="Insufficient data for performance calculation")
    return performance

@app.get("/api/analytics/distribution")
def get_prediction_distribution(
    hours: int = 24,
    bins: int = 20,
    db: Session = Depends(get_database)
):
    """Get prediction distribution for histogram"""
    return AnalyticsService.get_prediction_distribution(db, hours, bins)

@app.get("/api/alerts")
def get_active_alerts(limit: int = 50, db: Session = Depends(get_database)):
    """Get active alerts"""
    alerts = AlertService.get_active_alerts(db, limit)
    return [
        {
            "id": alert.id,
            "timestamp": alert.timestamp.isoformat(),
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "title": alert.title,
            "message": alert.message,
            "is_resolved": alert.is_resolved
        }
        for alert in alerts
    ]

@app.post("/api/alerts/check")
def check_anomalies(db: Session = Depends(get_database)):
    """Manually trigger anomaly detection"""
    alerts = AlertService.check_prediction_anomalies(db)
    return {"alerts_created": len(alerts)}

# Legacy endpoint for backward compatibility
@app.get("/logs/predictions.csv")
def get_prediction_log_csv(db: Session = Depends(get_database)):
    """Legacy CSV export endpoint"""
    predictions = MonitoringService.get_predictions_timeline(db, hours=168, limit=1000)  # Last week
    return {"message": "CSV export deprecated. Use /api/predictions/timeline endpoint", "data": predictions}
