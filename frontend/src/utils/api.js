import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    if (response?.status === 403) {
      toast.error('Access denied');
    } else if (response?.status === 404) {
      toast.error('Resource not found');
    } else if (response?.status === 422) {
      // Validation errors
      const detail = response.data?.detail;
      if (Array.isArray(detail)) {
        detail.forEach(err => {
          toast.error(`${err.loc[1]}: ${err.msg}`);
        });
      } else {
        toast.error(detail || 'Validation error');
      }
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (!response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Contracts API calls
export const contractsAPI = {
  getContracts: async (params = {}) => {
    const response = await api.get('/api/contracts', { params });
    return response.data;
  },
  
  getContract: async (id) => {
    const response = await api.get(`/api/contracts/${id}`);
    return response.data;
  },
  
  deleteContract: async (id) => {
    const response = await api.delete(`/api/contracts/${id}`);
    return response.data;
  },
  
  getContractChunks: async (id, params = {}) => {
    const response = await api.get(`/api/contracts/${id}/chunks`, { params });
    return response.data;
  },
};

// Upload API calls
export const uploadAPI = {
  uploadContract: async (formData, onUploadProgress) => {
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },
  
  getUploadStatus: async (docId) => {
    const response = await api.get(`/api/upload/status/${docId}`);
    return response.data;
  },
};

// Query API calls
export const queryAPI = {
  askQuestion: async (question, limit = 5) => {
    const response = await api.post('/api/ask', { question, limit });
    return response.data;
  },
  
  getSuggestions: async () => {
    const response = await api.get('/api/ask/suggestions');
    return response.data;
  },
  
  getHistory: async () => {
    const response = await api.get('/api/ask/history');
    return response.data;
  },
};

// Utility functions
export const formatError = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  return error.message || 'An unexpected error occurred';
};

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const message = formatError(error);
  toast.error(message);
  console.error('API Error:', error);
};

// File upload helper
export const createFormData = (file, additionalData = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.keys(additionalData).forEach(key => {
    if (additionalData[key] !== null && additionalData[key] !== undefined) {
      formData.append(key, additionalData[key]);
    }
  });
  
  return formData;
};

// Export the main api instance for custom calls
export default api;
