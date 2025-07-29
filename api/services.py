from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
import psutil
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from .database import Prediction, SystemMetrics, ModelPerformance, Alert

class MonitoringService:
    """Service for handling monitoring operations"""
    
    @staticmethod
    def log_prediction(
        db: Session,
        input_data: dict,
        predicted_price: float,
        confidence: Optional[float] = None,
        actual_price: Optional[float] = None,
        model_version: str = "v1.0"
    ) -> Prediction:
        """Log a prediction to the database"""
        error = None
        if actual_price is not None:
            error = abs(predicted_price - actual_price)
        
        prediction = Prediction(
            med_inc=input_data["MedInc"],
            house_age=input_data["HouseAge"],
            ave_rooms=input_data["AveRooms"],
            ave_bedrms=input_data["AveBedrms"],
            population=input_data["Population"],
            ave_occup=input_data["AveOccup"],
            latitude=input_data["Latitude"],
            longitude=input_data["Longitude"],
            predicted_price=predicted_price,
            confidence=confidence,
            actual_price=actual_price,
            error=error,
            model_version=model_version
        )
        
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        return prediction
    
    @staticmethod
    def log_system_metrics(
        db: Session,
        response_time_ms: float,
        request_count: int = 1,
        error_count: int = 0
    ) -> SystemMetrics:
        """Log system metrics"""
        cpu_usage = psutil.cpu_percent()
        memory_usage = psutil.virtual_memory().percent
        disk_usage = psutil.disk_usage('/').percent
        
        metrics = SystemMetrics(
            response_time_ms=response_time_ms,
            request_count=request_count,
            error_count=error_count,
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            disk_usage=disk_usage
        )
        
        db.add(metrics)
        db.commit()
        db.refresh(metrics)
        return metrics
    
    @staticmethod
    def get_dashboard_stats(db: Session, hours: int = 24) -> Dict:
        """Get dashboard statistics for the last N hours"""
        since = datetime.utcnow() - timedelta(hours=hours)
        
        # Prediction stats
        prediction_query = db.query(Prediction).filter(Prediction.timestamp >= since)
        total_predictions = prediction_query.count()
        
        avg_confidence = prediction_query.filter(
            Prediction.confidence.isnot(None)
        ).with_entities(func.avg(Prediction.confidence)).scalar() or 0
        
        avg_error = prediction_query.filter(
            Prediction.error.isnot(None)
        ).with_entities(func.avg(Prediction.error)).scalar() or 0
        
        # System stats
        system_query = db.query(SystemMetrics).filter(SystemMetrics.timestamp >= since)
        avg_response_time = system_query.with_entities(
            func.avg(SystemMetrics.response_time_ms)
        ).scalar() or 0
        
        total_requests = system_query.with_entities(
            func.sum(SystemMetrics.request_count)
        ).scalar() or 0
        
        total_errors = system_query.with_entities(
            func.sum(SystemMetrics.error_count)
        ).scalar() or 0
        
        # Calculate actual service uptime based on first prediction/system metric
        actual_uptime_hours = 0
        first_prediction = db.query(Prediction).order_by(Prediction.timestamp).first()
        first_metric = db.query(SystemMetrics).order_by(SystemMetrics.timestamp).first()
        
        if first_prediction or first_metric:
            # Use whichever came first
            earliest_time = None
            if first_prediction and first_metric:
                earliest_time = min(first_prediction.timestamp, first_metric.timestamp)
            elif first_prediction:
                earliest_time = first_prediction.timestamp
            else:
                earliest_time = first_metric.timestamp
            
            if earliest_time:
                actual_uptime_hours = (datetime.utcnow() - earliest_time).total_seconds() / 3600

        return {
            "total_predictions": total_predictions,
            "average_confidence": round(avg_confidence, 3),
            "average_error": round(avg_error, 3),
            "average_response_time": round(avg_response_time, 2),
            "total_requests": total_requests,
            "total_errors": total_errors,
            "error_rate": round(total_errors / max(total_requests, 1) * 100, 2),
            "uptime_hours": round(actual_uptime_hours, 2)
        }
    
    @staticmethod
    def get_predictions_timeline(
        db: Session, 
        hours: int = 24,
        limit: int = 100
    ) -> List[Dict]:
        """Get predictions timeline data"""
        since = datetime.utcnow() - timedelta(hours=hours)
        
        predictions = db.query(Prediction).filter(
            Prediction.timestamp >= since
        ).order_by(desc(Prediction.timestamp)).limit(limit).all()
        
        return [
            {
                "timestamp": pred.timestamp.isoformat(),
                "predicted_price": pred.predicted_price,
                "confidence": pred.confidence,
                "error": pred.error,
                "actual_price": pred.actual_price
            }
            for pred in predictions
        ]

class AlertService:
    """Service for handling alerts and notifications"""
    
    @staticmethod
    def create_alert(
        db: Session,
        alert_type: str,
        severity: str,
        title: str,
        message: str
    ) -> Alert:
        """Create a new alert"""
        alert = Alert(
            alert_type=alert_type,
            severity=severity,
            title=title,
            message=message
        )
        
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert
    
    @staticmethod
    def check_prediction_anomalies(db: Session) -> List[Alert]:
        """Check for prediction anomalies and create alerts"""
        alerts = []
        
        # Check last hour predictions
        since = datetime.utcnow() - timedelta(hours=1)
        recent_predictions = db.query(Prediction).filter(
            Prediction.timestamp >= since,
            Prediction.confidence.isnot(None)
        ).all()
        
        if len(recent_predictions) > 5:  # Need minimum samples
            confidences = [p.confidence for p in recent_predictions]
            avg_confidence = np.mean(confidences)
            
            # Alert if average confidence drops below 70%
            if avg_confidence < 0.7:
                alert = AlertService.create_alert(
                    db=db,
                    alert_type="performance",
                    severity="medium",
                    title="Low Model Confidence",
                    message=f"Average confidence in last hour: {avg_confidence:.2%}"
                )
                alerts.append(alert)
        
        return alerts
    
    @staticmethod
    def get_active_alerts(db: Session, limit: int = 50) -> List[Alert]:
        """Get active alerts"""
        return db.query(Alert).filter(
            Alert.is_resolved == False
        ).order_by(desc(Alert.timestamp)).limit(limit).all()

class AnalyticsService:
    """Service for advanced analytics and model performance monitoring"""
    
    @staticmethod
    def calculate_model_performance(
        db: Session,
        model_version: str = "v1.0",
        hours: int = 24
    ) -> Optional[Dict]:
        """Calculate model performance metrics"""
        since = datetime.utcnow() - timedelta(hours=hours)
        
        predictions = db.query(Prediction).filter(
            and_(
                Prediction.timestamp >= since,
                Prediction.model_version == model_version,
                Prediction.actual_price.isnot(None),
                Prediction.error.isnot(None)
            )
        ).all()
        
        if len(predictions) < 5:  # Need minimum samples
            return None
        
        actual_prices = [p.actual_price for p in predictions]
        predicted_prices = [p.predicted_price for p in predictions]
        
        mae = mean_absolute_error(actual_prices, predicted_prices)
        mse = mean_squared_error(actual_prices, predicted_prices)
        rmse = np.sqrt(mse)
        r2 = r2_score(actual_prices, predicted_prices)
        
        return {
            "model_version": model_version,
            "mae": round(mae, 4),
            "mse": round(mse, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4),
            "prediction_count": len(predictions),
            "time_period_hours": hours
        }
    
    @staticmethod
    def get_prediction_distribution(
        db: Session,
        hours: int = 24,
        bins: int = 20
    ) -> Dict:
        """Get prediction distribution for histogram"""
        since = datetime.utcnow() - timedelta(hours=hours)
        
        predictions = db.query(Prediction).filter(
            Prediction.timestamp >= since
        ).all()
        
        if not predictions:
            return {"bins": [], "counts": []}
        
        prices = [p.predicted_price for p in predictions]
        hist, bin_edges = np.histogram(prices, bins=bins)
        
        return {
            "bins": bin_edges.tolist(),
            "counts": hist.tolist(),
            "total_predictions": len(prices),
            "min_price": float(np.min(prices)),
            "max_price": float(np.max(prices)),
            "avg_price": float(np.mean(prices))
        } 