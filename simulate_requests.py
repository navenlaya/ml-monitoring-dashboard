import pandas as pd
import requests
import time

# Load the test data
df = pd.read_csv('data/simulated_stream.csv')

# API endpoint
url = "http://127.0.0.1:8000/predict"

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
        "Longitude": row['Longitude']
    }

    try:
        response = requests.post(url, json=payload)
        print(f"[{i}] Sent: {payload}")
        print("   Response:", response.json())
    except Exception as e:
        print("Error sending request:", e)

    time.sleep(2) # 2 Seconds delay between requests