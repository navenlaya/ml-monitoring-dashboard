import streamlit as st
from streamlit_autorefresh import st_autorefresh
import pandas as pd
import os
import numpy as np

# Page Config
st.set_page_config(page_title="ML Monitoring Dashboard", layout="wide")

# Auto-refresh every 5 seconds
st_autorefresh(interval=5000, key="refresh")

# App Title
st.title("Real-Time ML Monitoring Dashboard")

log_path = os.path.join("logs", "predictions.csv")

# Check if log file exists
if not os.path.exists(log_path):
    st.warning("Log file not found.")
    st.stop()

# Read the log file
df = pd.read_csv(log_path)
df['timestamp'] = pd.to_datetime(df['timestamp'])

# KPIs
latest = df.sort_values("timestamp").iloc[-1]
avg_conf = df['confidence'].mean()
avg_error = df['error'].mean()
total_preddictions = len(df)

k1, k2, k3 = st.columns(3)
k1.metric("Latest Prediction", latest['prediction'])
k2.metric("Average Confidence", f"{avg_conf:.2f}")
k3.metric("Average Error", f"{avg_error:.2f}")

st.divider()

# Layout/Charts
col1, col2 = st.columns(2)

with col1:
    st.subheader("Predictions Over Time")
    st.line_chart(df.set_index('timestamp')["prediction"])

with col2:
    st.subheader("Confidence Over Time")
    st.line_chart(df.set_index('timestamp')["confidence"])

st.subheader("Prediction Error Over Time")
st.line_chart(df.set_index('timestamp')["error"]) 

# Display the latest predictions
st.divider()
st.subheader("Latest Predictions")
st.dataframe(df.sort_values("timestamp", ascending=False).head(10))

st.caption("Auto-refreshing every 5 seconds to show new predictions.")
