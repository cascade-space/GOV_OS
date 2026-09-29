import axios from 'axios';

export const getBaseUrl = () => {
    const raw = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
    return raw.replace('localhost:8080', '127.0.0.1:8080').replace(/\/+$/, '');
};

// Points to GovOS API
const api = axios.create({
    baseURL: `${getBaseUrl()}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

const refreshPromises: Record<string, Promise<string | null> | null> = {};

export async function getValidAdminToken(): Promise<string | null> {
    return getValidSessionToken('TENANT_ADMIN');
}

export async function getValidSessionToken(forceRole?: string): Promise<string | null> {
    const key = forceRole || 'DEFAULT';
    if (!refreshPromises[key]) {
        refreshPromises[key] = (async () => {
            try {
                const baseURL = getBaseUrl();
                let identifier = 'admin@demo.govos.in';
                let targetRole = forceRole || 'TENANT_ADMIN';

                if (typeof window !== 'undefined') {
                    const currentPath = window.location.pathname;
                    if (forceRole === 'OFFICER' || (!forceRole && currentPath.startsWith('/officer'))) {
                        identifier = 'officer@demo.govos.in';
                        targetRole = 'OFFICER';
                    } else if (forceRole === 'REP' || forceRole === 'MLA' || (!forceRole && currentPath.startsWith('/mla'))) {
                        identifier = 'mla@dharwad.gov.in';
                        targetRole = 'REP';
                    } else if (forceRole === 'SUPER_ADMIN' || (!forceRole && currentPath.startsWith('/superadmin'))) {
                        identifier = 'admin@govos.in';
                        targetRole = 'SUPER_ADMIN';
                    } else if (forceRole === 'ADMIN' || forceRole === 'TENANT_ADMIN' || (!forceRole && currentPath.startsWith('/admin'))) {
                        identifier = 'admin@demo.govos.in';
                        targetRole = 'TENANT_ADMIN';
                    } else {
                        try {
                            const authStr = localStorage.getItem('govos_auth');
                            if (authStr) {
                                const parsed = JSON.parse(authStr);
                                if (parsed?.role === 'OFFICER') {
                                    identifier = 'officer@demo.govos.in';
                                    targetRole = 'OFFICER';
                                } else if (parsed?.role === 'REP') {
                                    identifier = 'mla@dharwad.gov.in';
                                    targetRole = 'REP';
                                } else if (parsed?.role === 'SUPER_ADMIN') {
                                    identifier = 'admin@govos.in';
                                    targetRole = 'SUPER_ADMIN';
                                } else if (parsed?.role === 'TENANT_ADMIN' || parsed?.role === 'ADMIN') {
                                    identifier = 'admin@demo.govos.in';
                                    targetRole = 'TENANT_ADMIN';
                                } else if (parsed?.email) {
                                    identifier = parsed.email;
                                }
                            }
                        } catch (e) { /* ignore */ }
                    }
                }

                let newToken: string | null = null;
                let authUser: any = null;
                let authTenant: any = null;

                // 1. Try OTP verification (mock OTP 123456)
                try {
                    const authRes = await axios.post(`${baseURL}/api/v1/auth/otp/verify`, {
                        identifier,
                        otp: '123456'
                    }, { timeout: 8000 });

                    if (authRes.data?.accessToken) {
                        newToken = authRes.data.accessToken;
                        authUser = authRes.data.user;
                        authTenant = authRes.data.tenant;
                    }
                } catch (otpErr) {
                    console.warn('[GovOS API] OTP auto-reauth failed, attempting password login fallback:', otpErr);
                }

                // 2. Fallback to password login with Admin@123 if OTP fails
                if (!newToken) {
                    try {
                        const loginRes = await axios.post(`${baseURL}/api/v1/auth/login`, {
                            email: identifier,
                            password: 'Admin@123'
                        }, { timeout: 8000 });

                        if (loginRes.data?.accessToken) {
                            newToken = loginRes.data.accessToken;
                            authUser = loginRes.data.user;
                            authTenant = loginRes.data.tenant;
                        }
                    } catch (loginErr) {
                        console.warn('[GovOS API] Password login fallback failed:', loginErr);
                    }
                }

                if (newToken) {
                    if (typeof window !== 'undefined') {
                        const resolvedRole = authUser?.roles?.[0]?.code || targetRole ||
                            (identifier.includes('officer') ? 'OFFICER' :
                             (identifier.includes('mla') || identifier.includes('rep') ? 'REP' :
                              (identifier === 'admin@govos.in' ? 'SUPER_ADMIN' : 'TENANT_ADMIN')));

                        // Save role-isolated token caches
                        localStorage.setItem(`govos_token_${resolvedRole}`, newToken);
                        if (resolvedRole === 'TENANT_ADMIN') {
                            localStorage.setItem('govos_token_ADMIN', newToken);
                        }

                        // Determine if this matches the active portal route
                        const currentPath = window.location.pathname;
                        const isForCurrentPortal =
                            (resolvedRole === 'OFFICER' && currentPath.startsWith('/officer')) ||
                            (resolvedRole === 'REP' && currentPath.startsWith('/mla')) ||
                            (resolvedRole === 'SUPER_ADMIN' && currentPath.startsWith('/superadmin')) ||
                            ((resolvedRole === 'TENANT_ADMIN' || resolvedRole === 'ADMIN') && currentPath.startsWith('/admin')) ||
                            (!currentPath.startsWith('/officer') && !currentPath.startsWith('/mla') && !currentPath.startsWith('/superadmin') && !currentPath.startsWith('/admin'));

                        if (isForCurrentPortal) {
                            localStorage.setItem('civicpath_token', newToken);
                            localStorage.setItem('govos_auth_token', newToken);
                            try {
                                const parsed: any = {};
                                parsed.token = newToken;
                                parsed.expiresAt = Date.now() + 86400000;
                                if (authUser) {
                                    parsed.id = authUser.id;
                                    parsed.name = authUser.fullName || authUser.displayName || (resolvedRole === 'OFFICER' ? 'Rajesh Sharma' : 'GovOS User');
                                    parsed.role = resolvedRole;
                                    parsed.email = authUser.email || identifier;
                                    parsed.wardId = authUser.wardId;
                                } else {
                                    parsed.role = resolvedRole;
                                    parsed.name = resolvedRole === 'OFFICER' ? 'Rajesh Sharma' : (resolvedRole === 'REP' ? 'Hon. Amrut Desai' : 'Municipal Admin');
                                    parsed.email = identifier;
                                }
                                const updatedStr = JSON.stringify(parsed);
                                localStorage.setItem('govos_auth', updatedStr);
                                document.cookie = `govos_auth=${encodeURIComponent(updatedStr)}; path=/; max-age=86400; SameSite=Lax`;
                            } catch (e) { /* ignore */ }
                            if (authTenant?.id) {
                                localStorage.setItem('govos_tenant_id', authTenant.id);
                            }
                        }
                    }
                    return newToken;
                }
            } catch (e) {
                console.warn(`[GovOS API] Auto-reauth failed for ${forceRole}:`, e);
            } finally {
                refreshPromises[key] = null;
            }
            return null;
        })();
    }
    return refreshPromises[key]!;
}

// Request interceptor for adding auth headers
api.interceptors.request.use(
    async (config) => {
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const url = config.url || '';

            // 1. Identify which role this request requires
            let requiredRole: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'OFFICER' | 'REP' | null = null;
            if (currentPath.startsWith('/superadmin') || url.includes('/superadmin')) {
                requiredRole = 'SUPER_ADMIN';
            } else if (
                currentPath.startsWith('/admin') ||
                url.includes('/officers') ||
                url.includes('/verify-close') ||
                url.includes('/request-rework') ||
                url.includes('/assign')
            ) {
                requiredRole = 'TENANT_ADMIN';
            } else if (
                currentPath.startsWith('/officer') ||
                url.includes('/assigned/me') ||
                url.includes('/work-start') ||
                url.includes('/resolve')
            ) {
                requiredRole = 'OFFICER';
            } else if (
                currentPath.startsWith('/mla') ||
                url.includes('/directives') ||
                url.includes('/constituency')
            ) {
                requiredRole = 'REP';
            }

            let token: string | null = null;

            // 2. If a specific role is required, check if govos_auth already has a valid token for that role
            if (requiredRole) {
                try {
                    const currentAuth = localStorage.getItem('govos_auth');
                    if (currentAuth) {
                        const parsed = JSON.parse(currentAuth);
                        const roleMatches = parsed?.role === requiredRole ||
                            (requiredRole === 'TENANT_ADMIN' && parsed?.role === 'SUPER_ADMIN');
                        if (roleMatches && parsed?.token && (!parsed.expiresAt || Date.now() < parsed.expiresAt)) {
                            token = parsed.token;
                        }
                    }
                } catch (e) { /* ignore */ }

                // Check role-cached token
                if (!token) {
                    const cachedToken = localStorage.getItem(`govos_token_${requiredRole}`);
                    if (cachedToken) {
                        token = cachedToken;
                    }
                }

                // If still no token for this role, auto-fetch one now before sending request
                if (!token) {
                    token = await getValidSessionToken(requiredRole);
                }
            }

            // 3. Fallback to general govos_auth store
            if (!token) {
                try {
                    const authStr = localStorage.getItem('govos_auth');
                    if (authStr) {
                        const parsed = JSON.parse(authStr);
                        if (parsed?.token) {
                            token = parsed.token;
                        }
                    }
                } catch (e) { /* ignore */ }
            }

            // 4. Legacy fallbacks
            if (!token) {
                token = localStorage.getItem('civicpath_token')
                     || localStorage.getItem('govos_auth_token')
                     || localStorage.getItem('civic_token');
            }

            if (!token) {
                try {
                    const officerSession = localStorage.getItem('officer_session');
                    if (officerSession) {
                        const parsed = JSON.parse(officerSession);
                        token = parsed.token;
                    }
                } catch (e) { /* ignore */ }
            }

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

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

// Response interceptor: returns server response data directly and auto-recovers on 401 or 403 role mismatch
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        const url = originalRequest?.url || '';
        const status = error?.response?.status;

        // Auto-recover on 401 or 403 role mismatch
        const isSuperAdminUrl = url.includes('/superadmin');
        const isSuperAdminPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/superadmin');
        const isAdminUrl = url.includes('/officers') || url.includes('/verify-close') || url.includes('/request-rework') || url.includes('/assign') || url.includes('/admin');
        const isAdminPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
        const isOfficerUrl = url.includes('/assigned/me') || url.includes('/work-start') || url.includes('/resolve');
        const isOfficerPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/officer');
        const isMlaUrl = url.includes('/directives') || url.includes('/constituency');
        const isMlaPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/mla');

        const isRoleMismatch = status === 403 && (
            isSuperAdminUrl || isSuperAdminPage ||
            isAdminUrl || isAdminPage ||
            isOfficerUrl || isOfficerPage ||
            isMlaUrl || isMlaPage
        );

        if ((status === 401 || isRoleMismatch) && !originalRequest?._retry && typeof window !== 'undefined') {
            originalRequest._retry = true;
            let requiredRole: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'OFFICER' | 'REP' = 'TENANT_ADMIN';
            if (isSuperAdminUrl || isSuperAdminPage) {
                requiredRole = 'SUPER_ADMIN';
            } else if (isAdminUrl || isAdminPage) {
                requiredRole = 'TENANT_ADMIN';
            } else if (isOfficerUrl || isOfficerPage) {
                requiredRole = 'OFFICER';
            } else if (isMlaUrl || isMlaPage) {
                requiredRole = 'REP';
            }

            // Invalidate any stale cached token for this role
            localStorage.removeItem(`govos_token_${requiredRole}`);
            const newToken = await getValidSessionToken(requiredRole);
            if (newToken) {
                if (originalRequest.headers && typeof (originalRequest.headers as any).set === 'function') {
                    (originalRequest.headers as any).set('Authorization', `Bearer ${newToken}`);
                } else if (originalRequest.headers) {
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                }
                return api(originalRequest);
            }
        }

        console.error(`[GovOS API] Error response from ${url}:`, error?.response?.status, error?.message);
        return Promise.reject(error);
    }
);

export default api;
