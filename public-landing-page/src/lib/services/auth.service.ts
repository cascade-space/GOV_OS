import api from '../api-client';

export const authService = {
    login: async (credentials: any) => {
        const data = await api.post('/auth/login', credentials) as any;
        if (data.token) {
            localStorage.setItem('civic_token', data.token);
            localStorage.setItem('civic_user', JSON.stringify(data.user));
        }
        return data;
    },

    logout: () => {
        localStorage.removeItem('civic_token');
        localStorage.removeItem('civic_user');
    },

    getCurrentUser: () => {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('civic_user');
            return user ? JSON.parse(user) : null;
        }
        return null;
    }
};
