import axios from 'axios';
import { getAuthHeaders } from './authService';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const headers = await getAuthHeaders();
      config.headers = { ...config.headers, ...headers.headers };
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

export const apiRequest = async (url, options) => {
  try {
    const response = await apiClient(url, options);
    return response.data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};
