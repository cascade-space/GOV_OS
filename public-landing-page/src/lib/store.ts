import { create } from 'zustand';
import { ComplaintStatus, Priority } from './constants';

/** Backend JWT role codes — matches 'rid' claim in JWT and roles.code in DB */
export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'OFFICER' | 'REP' | 'CITIZEN';

/** Authenticated user — shape matches JWT claims */
export interface AuthUser {
    id: string;          // JWT 'sub' claim (user UUID)
    name: string;        // display name from profile
    role: UserRole;      // JWT 'rid' claim
    tenantId: string;    // JWT 'tid' claim
    wardId?: string;     // JWT 'wid' claim (officers only)
    email?: string;
    phone?: string;
    avatarUrl?: string;
    token: string;       // JWT access token
    refreshToken: string;
    expiresAt: number;   // unix timestamp ms
}

interface AppState {
    // UI State
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;

    // Auth State — single source of truth from JWT
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    clearAuth: () => void;

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

    // RBAC helpers
    hasRole: (roles: UserRole[]) => boolean;
    isAuthenticated: () => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
    sidebarOpen: true,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    user: null,
    setUser: (user) => {
        set({ user });
        if (typeof window !== 'undefined') {
            if (user) {
                const json = JSON.stringify(user);
                localStorage.setItem('govos_auth', json);
                localStorage.setItem('govos_auth_token', user.token);
                localStorage.setItem('civicpath_token', user.token);
                if (user.tenantId) {
                    localStorage.setItem('govos_tenant_id', user.tenantId);
                }
                const maxAge = Math.max(0, Math.floor((user.expiresAt - Date.now()) / 1000));
                document.cookie = `govos_auth=${encodeURIComponent(json)}; path=/; max-age=${maxAge}; SameSite=Lax`;
            } else {
                localStorage.removeItem('govos_auth');
                document.cookie = 'govos_auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
        }
    },
    clearAuth: () => {
        set({ user: null });
        if (typeof window !== 'undefined') {
            localStorage.removeItem('govos_auth');
            document.cookie = 'govos_auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            // Also clear legacy keys to prevent ghost sessions
            localStorage.removeItem('civicpath_user');
            localStorage.removeItem('civic_user');
            localStorage.removeItem('civic_token');
            localStorage.removeItem('civicpath_token');
            localStorage.removeItem('officer_session');
            localStorage.removeItem('civicpath_superadmin');
            localStorage.removeItem('govos_auth_token');
            localStorage.removeItem('govos_tenant_id');
        }
    },

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

    // RBAC helpers
    hasRole: (roles) => {
        const user = get().user;
        return user !== null && roles.includes(user.role);
    },
    isAuthenticated: () => {
        const user = get().user;
        if (!user) return false;
        return Date.now() < user.expiresAt;
    },
}));

/** Load persisted auth state on app boot (call once at root layout) */
export function loadPersistedAuth(set: (partial: any) => void) {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('govos_auth');
    if (!stored) return;
    try {
        const user: AuthUser = JSON.parse(stored);
        if (Date.now() < user.expiresAt) {
            set({ user });
        } else {
            localStorage.removeItem('govos_auth');
        }
    } catch {
        localStorage.removeItem('govos_auth');
    }
}
