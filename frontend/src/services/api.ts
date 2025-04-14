import axios from 'axios';
import { WeatherReport, WeatherComparison , WeatherHistoryParams, WeatherHistoryResponse } from '../types/weather';

// API Configuration
const API_URL = process.env.SERVER_APP_API_URL || 'http://localhost:8080/api/';

// Axios Instance Configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      if(error.response?.data?.error === 'Invalid token'){
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Types

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token } = response.data;
    localStorage.setItem('token', token);
    return response.data;
  },

  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  validate: async () => {
    const response = await api.get('/auth/validate');
    return response.data;
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout', {}, );
      localStorage.removeItem('token');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Weather API
export const weatherAPI = {
  getCurrent: async (): Promise<WeatherReport> => {
    const response = await api.get('/weather/current');
    return response.data;
  },

  getByDate: async (date: string): Promise<WeatherReport> => {
    const response = await api.get(`/weather/date/${date}`);
    return response.data ;
  },

  getHistory: async (params: WeatherHistoryParams = {}): Promise<WeatherHistoryResponse> => {
    const response = await api.get('/weather/history', { params });
    return response.data;
  },

  compare: async (report1Id: number, report2Id: number): Promise<WeatherComparison> => {
    const response = await api.post('/weather/compare', {
      report1_id: report1Id,
      report2_id: report2Id,
    });
    return response.data;
  },

  getReportsByDates: async (date1: string, date2: string) => {
    const response = await api.get('/weather/compare', {
      params: { date1, date2 }
    });
    return response.data;
  },

  getByTimeRange: async (from: string, to: string) => {
    const response = await api.get('/weather/time-range', {
      params: { from, to }
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      throw error;
    }
  }
};

export default api; 