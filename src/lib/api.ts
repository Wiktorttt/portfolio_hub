import axios from 'axios';

// Create axios instance with default configuration
export const api = axios.create({
  timeout: 240000, // 4 minutes timeout
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
    console.error('API Error:', error);
    return Promise.reject(error);
  }
); 