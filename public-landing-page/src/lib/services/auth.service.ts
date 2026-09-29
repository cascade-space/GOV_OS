import api from '../api-client';
import { AuthUser, UserRole } from '../store';

const STORAGE_KEY = 'govos_auth';

/**
 * Parses the JWT payload (base64 decode of middle segment) without external libraries.
 * The backend JWT contains: sub (userId), tid (tenantId), rid (roleCode), wid (wardId).
 */
function decodeJwtPayload(token: string): Record<string, any> {
    try {
        const base64 = token.split('.')[1];
        const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json);
    } catch {
        throw new Error('Invalid JWT format');
    }
}

/**
 * Persists session to BOTH localStorage and document.cookie.
 * Cookie is required for Next.js Edge middleware route protection.
 */
export function persistSession(authUser: AuthUser): void {
    if (typeof window === 'undefined') return;
    const json = JSON.stringify(authUser);
    localStorage.setItem(STORAGE_KEY, json);
    // Also set fallback token for legacy api-client hooks
    localStorage.setItem('govos_auth_token', authUser.token);
    localStorage.setItem('civicpath_token', authUser.token);
    if (authUser.tenantId) {
        localStorage.setItem('govos_tenant_id', authUser.tenantId);
    }
    
    const maxAge = Math.max(0, Math.floor((authUser.expiresAt - Date.now()) / 1000));
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(json)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Clears unified session and all legacy storage keys across portals.
 */
export function clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = `${STORAGE_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    // Clear legacy keys
    localStorage.removeItem('civicpath_user');
    localStorage.removeItem('civic_user');
    localStorage.removeItem('civic_token');
    localStorage.removeItem('civicpath_token');
    localStorage.removeItem('officer_session');
    localStorage.removeItem('civicpath_superadmin');
    localStorage.removeItem('govos_auth_token');
    localStorage.removeItem('govos_tenant_id');
}

export const authService = {
    /**
     * Request an OTP for phone or email.
     * Calls: POST /api/v1/auth/otp/request
     */
    requestOtp: async (identifier: string): Promise<{ sent: boolean; maskedDestination: string }> => {
        return api.post('/auth/otp/request', { identifier });
    },

    /**
     * OTP-based login flow (all roles use this).
     * Sends { identifier, otp } to match backend OtpVerifyDto.
     * Returns AuthUser and persists in govos_auth (localStorage + cookie).
     */
    loginWithOtp: async (phone: string, otpCode: string, displayName?: string): Promise<AuthUser> => {
        const data = await api.post('/auth/otp/verify', { 
            identifier: phone, 
            otp: otpCode 
        }) as any;

        if (!data.accessToken) {
            throw new Error('Login failed: no token returned from server');
        }

        const claims = decodeJwtPayload(data.accessToken);

        const authUser: AuthUser = {
            id: claims.sub,
            name: displayName || data.user?.fullName || data.user?.displayName || phone,
            role: claims.rid as UserRole,
            tenantId: claims.tid,
            wardId: claims.wid || undefined,
            email: data.user?.email,
            phone: data.user?.phone || phone,
            avatarUrl: data.user?.avatarUrl,
            token: data.accessToken,
            refreshToken: data.refreshToken || '',
            expiresAt: (claims.exp * 1000),   // JWT exp is in seconds, convert to ms
        };

        persistSession(authUser);
        return authUser;
    },

    /**
     * Password login (for admin / seeded accounts).
     */
    login: async (credentials: { email?: string; phone?: string; password?: string }): Promise<AuthUser> => {
        const data = await api.post('/auth/login', credentials) as any;

        if (!data.accessToken && !data.token) {
            throw new Error('Login failed: no token returned');
        }

        const token = data.accessToken || data.token;
        const claims = decodeJwtPayload(token);

        const authUser: AuthUser = {
            id: claims.sub,
            name: data.user?.fullName || data.user?.displayName || credentials.email || '',
            role: claims.rid as UserRole,
            tenantId: claims.tid,
            wardId: claims.wid || undefined,
            email: data.user?.email,
            phone: data.user?.phone,
            avatarUrl: data.user?.avatarUrl,
            token,
            refreshToken: data.refreshToken || '',
            expiresAt: (claims.exp * 1000),
        };

        persistSession(authUser);
        return authUser;
    },

    logout: () => {
        clearSession();
    },

    getCurrentUser: (): AuthUser | null => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        try {
            const user: AuthUser = JSON.parse(stored);
            if (Date.now() >= user.expiresAt) {
                clearSession();
                return null;
            }
            return user;
        } catch {
            return null;
        }
    },

    refreshToken: async (): Promise<AuthUser | null> => {
        const current = authService.getCurrentUser();
        if (!current?.refreshToken) return null;
        try {
            const data = await api.post('/auth/refresh', { refreshToken: current.refreshToken }) as any;
            if (!data.accessToken) return null;
            const claims = decodeJwtPayload(data.accessToken);
            const updated: AuthUser = {
                ...current,
                token: data.accessToken,
                refreshToken: data.refreshToken || current.refreshToken,
                expiresAt: claims.exp * 1000,
            };
            persistSession(updated);
            return updated;
        } catch {
            authService.logout();
            return null;
        }
    },

    /** Get just the bearer token for API headers */
    getToken: (): string | null => {
        return authService.getCurrentUser()?.token ?? null;
    },

    /** Check if the current session is valid and not expired */
    isAuthenticated: (): boolean => {
        return authService.getCurrentUser() !== null;
    },
};
