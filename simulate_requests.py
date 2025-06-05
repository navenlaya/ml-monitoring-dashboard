import pandas as pd
import requests
import time
import os
import csv
from datetime import datetime

# Load the test data
df = pd.read_csv('data/simulated_stream.csv')

# Remove rows with NaN in actual prices column
df = df.dropna(subset=['actual_prices'])


# API endpoint
url = "http://127.0.0.1:8000/predict"

# Log file path
log_path = "logs/predictions.csv"

# Create log file with headers if not exists
if not os.path.exists(log_path):
    with open(log_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            "timestamp", "MedInc", "HouseAge", "AveRooms", "AveBedrms",
            "Population", "AveOccup", "Latitude", "Longitude",
            "prediction", "confidence", "actual_prices", "error"
        ])

# Loop through each row
for i, row in df.iterrows():
    payload = {
        "MedInc": row['MedInc'],
        "HouseAge": row['HouseAge'],
        "AveRooms": row['AveRooms'],
        "AveBedrms": row['AveBedrms'],
        "Population": row['Population'],
        "AveOccup": row['AveOccup'],
        "Latitude": row['Latitude'],
        "Longitude": row['Longitude'],
        "actual_prices": row["actual_prices"]
    }

    try:
        response = requests.post(url, json=payload)
        result = response.json()

        actual = row["actual_prices"]
        prediction = result.get("predicted_price")
        error = actual - prediction

        print(f"[{i}] Sent: {payload}")
        print("   Response:", response.json())
    except Exception as e:
        print("Error sending request:", e)

    time.sleep(2) # 2 Seconds delay between requests