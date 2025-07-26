# Real-Time ML Monitoring Dashboard

A full-stack project that deploys a machine learning model with a real-time monitoring dashboard. The system simulates live user input and visualizes predictions, confidence scores, and prediction errors all in real time.

## Features

- Trained a Linear Regression model using the California Housing dataset
- REST API using FastAPI to serve real-time predictions
- Simulated user requests from test data using a custom script
- Logged predictions, confidence, actual values, and errors
- Interactive React + Vite dashboard with live-updating visualizations

## Tech Stack

- **Backend:** FastAPI, Joblib
- **Frontend:** React + Vite
- **ML:** scikit-learn
- **Logging:** CSV-based real-time logging
- **Others:** Python, Pandas, NumPy

## How to Run

- **1.** python train_model.py
- **2.** uvicron api.main:app --reload
- **3.** python simulate_requests.py (For simulating real-time users)
- **4.** npm run dev

