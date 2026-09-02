import axios from 'axios';
import toast from 'react-hot-toast';

// Points to GovOS Spring Boot API (port 8080) — NOT the old Express backend
const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth headers
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            // Citizen token
            const token = localStorage.getItem('civicpath_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Use civicpath_user from localStorage for admin/MLA authentication (Express backend compat)
            const storedUser = localStorage.getItem('civicpath_user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    if (userData.email) {
                        config.headers['x-user-email'] = userData.email;
                    }
                } catch (error) {
                    console.error('Error parsing civicpath_user:', error);
                }
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.response?.data?.error || 'Something went wrong';
        
        if (error.response?.status !== 401) {
            console.warn('API Error:', message);
        } else {
            console.warn('API 401 Unauthorized (retaining session in offline mode):', message);
        }
        
        return Promise.reject(error);
    }
);


export default api;
