from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os

# Define the FastAPI app
app = FastAPI(title="ML Monitoring Inference API")

# Load the pre-trained model
# model = joblib.load('model/model.pkl')

# Input format
class HouseData(BaseModel):
    MedInc: float
    HouseAge: float
    AveRooms: float
    AveBedrms: float
    Population: float
    AveOccup: float
    Latitude: float
    Longitude: float

model_path = os.path.join(os.path.dirname(__file__), "..", "model", "model.pkl")
model_path = os.path.abspath(model_path)

try:
    model = joblib.load(model_path)
except Exception as e:
    raise RuntimeError(f"❌ Failed to load model from {model_path}: {e}")

# Prediction Route
@app.post("/predict")
def predict(data: HouseData):
    # Convert data into 2D array
    input_data = np.array([[data.MedInc, data.HouseAge, data.AveRooms, data.AveBedrms, data.Population,
                            data.AveOccup, data.Latitude, data.Longitude]])
    
    # Make prediction
    prediction = model.predict(input_data)[0]

    confidence = max(0.0, min(1.0, 1- abs(prediction = 2.0)/5)) # Placeholder logic

    return {
        "predicted_price": round(prediction,3),
        "confidence": round(confidence, 3)
    }