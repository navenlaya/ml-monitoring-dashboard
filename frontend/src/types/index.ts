// API Response Types
export interface PredictionRequest {
  MedInc: number;
  HouseAge: number;
  AveRooms: number;
  AveBedrms: number;
  Population: number;
  AveOccup: number;
  Latitude: number;
  Longitude: number;
}

export interface PredictionResponse {
  predicted_price: number;
  confidence?: number;
  model_version?: string;
  timestamp?: string;
}

export interface PredictionLog {
  timestamp: string;
  prediction: string;
  confidence: string;
  error: string;
  [key: string]: string;
}

// Theme Types
export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Form Types
export interface FormErrors {
  [key: string]: string;
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: string;
  value: number;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  color: string;
}

// Admin Types
export interface AdminUser {
  username: string;
  isAuthenticated: boolean;
}

// API Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Dashboard Stats
export interface DashboardStats {
  totalPredictions: number;
  averageConfidence: number;
  averageError: number;
  uptime: string;
} 