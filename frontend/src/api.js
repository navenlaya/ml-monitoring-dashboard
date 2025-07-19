import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Send prediction request
export const sendPrediction = (data) => API.post('/predict', data);

// Fetch predictions CSV log
export const getPredictions = async () => {
  const res = await fetch(`http://127.0.0.1:8000/logs/predictions.csv?nocache=${Date.now()}`);
  return await res.text();
};
