import axios, { AxiosResponse, AxiosError } from 'axios';
import { PredictionRequest, PredictionResponse, ApiError } from './types';

// Create axios instance with default config
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
API.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: error.message || 'An unexpected error occurred',
      status: error.response?.status,
      code: error.code,
    };
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      apiError.message = 'Service not found. Please ensure the backend is running.';
    } else if (error.response?.status === 500) {
      apiError.message = 'Server error. Please try again later.';
    } else if (error.code === 'ECONNREFUSED') {
      apiError.message = 'Unable to connect to the server. Please check if the backend is running.';
    }
    
    return Promise.reject(apiError);
  }
);

// Send prediction request
export const sendPrediction = async (data: PredictionRequest): Promise<PredictionResponse> => {
  try {
    const response = await API.post<PredictionResponse>('/predict', data);
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

// Fetch predictions CSV log with cache busting
export const getPredictions = async (): Promise<string> => {
  try {
    const response = await fetch(
      `${API.defaults.baseURL}/logs/predictions.csv?nocache=${Date.now()}`,
      {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    const apiError: ApiError = {
      message: 'Failed to fetch prediction logs',
      status: (error as any)?.status,
    };
    throw apiError;
  }
};

// Check API health
export const checkHealth = async (): Promise<{ status: string; timestamp: string }> => {
  try {
    const response = await API.get('/health');
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

// Get model information
export const getModelInfo = async (): Promise<{ version: string; accuracy: number }> => {
  try {
    const response = await API.get('/model/info');
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
};

export default API; 