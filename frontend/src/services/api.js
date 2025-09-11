// services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Flask backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Authentication API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    verifyToken: () => api.get('/auth/verify'),
    getProfile: () => api.get('/auth/profile'),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getActivities: () => api.get('/dashboard/activities'),
};

// Loan API
export const loanAPI = {
    createApplication: (applicationData) => api.post('/loans/applications', applicationData),
    getApplications: (searchTerm = '') => api.get(`/loans/applications?search=${searchTerm}`),
    updateApplicationStatus: (id, status) => api.put(`/loans/applications/${id}/status`, { status }),
};

// Upload API
export const uploadAPI = {
    uploadPhoto: (formData) => api.post('/upload/photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
};

// Services API
export const servicesAPI = {
    getServices: () => api.get('/services'),
};

// Debug API (for development)
export const debugAPI = {
    getUsers: () => api.get('/debug/users'),
    initSampleData: () => api.post('/init-data'),
};

export default api;