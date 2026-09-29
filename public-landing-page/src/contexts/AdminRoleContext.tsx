"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAppStore, AuthUser, UserRole } from '@/lib/store';

/**
 * Auth Context -- uses JWT 'rid' claim as single source of truth for role.
 * Replaces the old 'admin'/'mla' string system. Role values now match backend
 * Spring Security authority codes: SUPER_ADMIN, TENANT_ADMIN, OFFICER, REP, CITIZEN.
 *
 * localStorage key: 'govos_auth' (unified -- eliminates the old civicpath_user / civic_user split)
 */

interface AuthContextType {
    user: AuthUser | null;
    role: UserRole | null;
    // Role predicates
    isSuperAdmin: boolean;
    isTenantAdmin: boolean;
    isOfficer: boolean;
    isRep: boolean;
    isCitizen: boolean;
    // Legacy aliases for existing components (will be cleaned up gradually)
    isAdmin: boolean;    // = isTenantAdmin || isSuperAdmin
    isMLA: boolean;      // = isRep
    canAccessAdmin: boolean;   // SUPER_ADMIN or TENANT_ADMIN
    canAccessMLA: boolean;     // SUPER_ADMIN, TENANT_ADMIN, or REP
    canAccessOfficer: boolean; // SUPER_ADMIN, TENANT_ADMIN, or OFFICER
    hasAdminAccess: boolean;   // any authenticated user
    // Actions
    login: (authUser: AuthUser) => void;
    logout: () => void;
    checkRole: () => void;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AdminRoleProvider({ children }: { children: ReactNode }) {
    const { user, setUser, clearAuth } = useAppStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback((authUser: AuthUser) => {
        setUser(authUser);
        setLoading(false);
    }, [setUser]);

    const logout = useCallback(() => {
        clearAuth();
    }, [clearAuth]);

    const checkRole = useCallback(() => {
        setLoading(true);
        setError(null);
        try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('govos_auth') : null;
            if (stored) {
                const parsed: AuthUser = JSON.parse(stored);
                // Validate token expiry
                if (Date.now() < parsed.expiresAt) {
                    setUser(parsed);
                } else {
                    clearAuth();
                }
            } else {
                // Check legacy key and migrate if present
                const legacy = localStorage.getItem('civicpath_user');
                if (legacy) {
                    console.warn('[GovOS] Legacy civicpath_user session found -- clearing. Please log in again.');
                    clearAuth();
                }
            }
        } catch {
            setError('Failed to restore session');
            clearAuth();
        } finally {
            setLoading(false);
        }
    }, [setUser, clearAuth]);

    useEffect(() => {
        checkRole();
    }, [checkRole]);

    const role = user?.role ?? null;

    const value: AuthContextType = {
        user,
        role,
        isSuperAdmin: role === 'SUPER_ADMIN',
        isTenantAdmin: role === 'TENANT_ADMIN',
        isOfficer: role === 'OFFICER',
        isRep: role === 'REP',
        isCitizen: role === 'CITIZEN',
        // Legacy aliases
        isAdmin: role === 'TENANT_ADMIN' || role === 'SUPER_ADMIN',
        isMLA: role === 'REP',
        canAccessAdmin: role === 'SUPER_ADMIN' || role === 'TENANT_ADMIN',
        canAccessMLA: role === 'SUPER_ADMIN' || role === 'TENANT_ADMIN' || role === 'REP',
        canAccessOfficer: role === 'SUPER_ADMIN' || role === 'TENANT_ADMIN' || role === 'OFFICER',
        hasAdminAccess: role !== null,
        login,
        logout,
        checkRole,
        loading,
        error,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAdminRole() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAdminRole must be used within AdminRoleProvider');
    }
    return context;
}

// Named export for new code to use
export { useAdminRole as useAuth };
