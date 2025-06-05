from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import csv
import os
from datetime import datetime

# Define the FastAPI app
app = FastAPI(title="ML Monitoring Inference API")

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
    Latitude: float
    Longitude: float
    actual_prices: float

# Prediction route
@app.post("/predict")
def predict(data: HouseData):
    # Convert input data to 2D NumPy array
    input_data = np.array([[data.MedInc, data.HouseAge, data.AveRooms,
                            data.AveBedrms, data.Population, data.AveOccup,
                            data.Latitude, data.Longitude]])

    # Predict
    prediction = model.predict(input_data)[0]
    error = round(abs(prediction - data.actual_prices), 3)
    confidence = max(0.0, min(1.0, 1 - abs(prediction - 2.0) / 5))

    # Prepare log entry
    log_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "logs", "predictions.csv"))
    log_entry = [
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        data.MedInc,
        data.HouseAge,
        data.AveRooms,
        data.AveBedrms,
        data.Population,
        data.AveOccup,
        data.Latitude,
        data.Longitude,
        round(prediction, 3),
        round(confidence, 3),
        round(data.actual_prices, 3),
        error
    ]

    # Write log to CSV
    write_header = not os.path.exists(log_path)
    with open(log_path, mode="a", newline="") as f:
        writer = csv.writer(f)
        if write_header:
            writer.writerow([
                "timestamp", "MedInc", "HouseAge", "AveRooms", "AveBedrms",
                "Population", "AveOccup", "Latitude", "Longitude",
                "prediction", "confidence", "actual_prices", "error"
            ])
        writer.writerow(log_entry)

    # Return result
    return {
        "predicted_price": round(prediction, 3),
        "confidence": round(confidence, 3),
        "actual_prices": round(data.actual_prices, 3),
        "error": error
    }
