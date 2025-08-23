import axios from 'axios';
import { API_TIMEOUT_MS } from './config';

// Create axios instance with default configuration
export const api = axios.create({
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add custom headers
api.interceptors.request.use((config) => {
  // Add any global headers here if needed
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    
    return Promise.reject(error);
  }
); 