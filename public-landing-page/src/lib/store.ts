import { create } from 'zustand';
import { ComplaintStatus, Priority } from './constants';

interface AppState {
    // UI State
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;

    // Auth State (Mock)
    user: {
        id: string;
        name: string;
        role: string;
        department?: string;
    } | null;
    setUser: (user: any) => void;

    // Dashboard Filters
    filters: {
        status: ComplaintStatus | 'all';
        priority: Priority | 'all';
        search: string;
    };
    setFilters: (filters: Partial<AppState['filters']>) => void;

    // Notifications
    notifications: Array<{
        id: string;
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
        read: boolean;
    }>;
    addNotification: (n: any) => void;
    markAsRead: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
    sidebarOpen: true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    user: null,
    setUser: (user) => set({ user }),

    filters: {
        status: 'all',
        priority: 'all',
        search: '',
    },
    setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
    })),

    notifications: [
        {
            id: '1',
            title: 'New Complaint',
            message: 'New road issue reported in Ward 12',
            type: 'info',
            read: false,
        }
    ],
    addNotification: (n) => set((state) => ({
        notifications: [{ ...n, id: Math.random().toString(), read: false }, ...state.notifications]
    })),
    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    })),
}));
