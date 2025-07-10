import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000', // Adjust for prod if needed
    headers: {
        'Content-Type' : 'application/json',

    }
});

// Fetch the predictions.csv file from the local/logs directory
export const getPredictions = async () => {
    const res = await fetch('/logs/predictions.csv');
    return await res.text();
};

// Send input data to the backend /predict endpoint for making predictions
export const sendPrediction = (data) => API.post('/predict', data);

