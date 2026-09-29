"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAppStore, AuthUser, UserRole } from '@/lib/store';
import { persistSession, clearSession } from '@/lib/services/auth.service';

interface LegacyUser {
    id?: string;
    email?: string;
    phone?: string;
    fullName?: string;
    name?: string;
    role: any;
    loginTime?: string;
}

interface LoginContextType {
    user: LegacyUser | null;
    loading: boolean;
    login: (token: string, userData: any) => void;
    logout: () => void;
    checkExistingSession: () => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export function LoginProvider({ children }: { children: ReactNode }) {
    const { user: storeUser, setUser: setStoreUser, clearAuth } = useAppStore();
    const [user, setUser] = useState<LegacyUser | null>(null);
    const [loading, setLoading] = useState(true);

    const checkExistingSession = () => {
        try {
            setLoading(true);
            
            // 1. Check primary unified govos_auth store
            const govosAuthStr = localStorage.getItem('govos_auth');
            if (govosAuthStr) {
                try {
                    const parsed: AuthUser = JSON.parse(govosAuthStr);
                    if (Date.now() < parsed.expiresAt) {
                        const legacy: LegacyUser = {
                            id: parsed.id,
                            email: parsed.email,
                            phone: parsed.phone,
                            fullName: parsed.name,
                            name: parsed.name,
                            role: parsed.role,
                            loginTime: new Date().toISOString()
                        };
                        setUser(legacy);
                        if (!storeUser) setStoreUser(parsed);
                        return;
                    }
                } catch { /* ignore */ }
            }

            // 2. Fallback check for legacy civicpath_user
            const token = localStorage.getItem('civicpath_token');
            const storedUser = localStorage.getItem('civicpath_user');
            
            if (token && storedUser) {
                try {
                    const userData: LegacyUser = JSON.parse(storedUser);
                    setUser(userData);
                    // Also upgrade to govos_auth
                    const upgraded: AuthUser = {
                        id: userData.id || 'usr-legacy-citizen',
                        name: userData.fullName || userData.name || userData.phone || 'Citizen',
                        role: (userData.role as UserRole) || 'CITIZEN',
                        tenantId: '00000000-0000-0000-0000-000000000001',
                        phone: userData.phone,
                        email: userData.email,
                        token,
                        refreshToken: '',
                        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
                    };
                    persistSession(upgraded);
                    setStoreUser(upgraded);
                    return;
                } catch {
                    localStorage.removeItem('civicpath_user');
                    localStorage.removeItem('civicpath_token');
                }
            }

            setUser(null);
        } catch (error) {
            console.error('Session check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (token: string, userData: any) => {
        const role: UserRole = (userData.role === 'admin' || userData.role === 'TENANT_ADMIN')
            ? 'TENANT_ADMIN'
            : (userData.role === 'mla' || userData.role === 'REP')
            ? 'REP'
            : (userData.role === 'officer' || userData.role === 'OFFICER')
            ? 'OFFICER'
            : (userData.role === 'superadmin' || userData.role === 'SUPER_ADMIN')
            ? 'SUPER_ADMIN'
            : 'CITIZEN';

        const authUser: AuthUser = {
            id: userData.id || `usr-${Date.now()}`,
            name: userData.fullName || userData.name || userData.displayName || userData.phone || 'GovOS User',
            role,
            tenantId: userData.tenantId || '00000000-0000-0000-0000-000000000001',
            wardId: userData.wardId,
            email: userData.email,
            phone: userData.phone,
            avatarUrl: userData.avatarUrl,
            token,
            refreshToken: userData.refreshToken || '',
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };

        persistSession(authUser);
        setStoreUser(authUser);

        const legacyUser: LegacyUser = {
            ...userData,
            role,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('civicpath_user', JSON.stringify(legacyUser));
        localStorage.setItem('civicpath_token', token);
        setUser(legacyUser);
    };

    const logout = () => {
        clearSession();
        clearAuth();
        setUser(null);
    };

    useEffect(() => {
        checkExistingSession();
    }, []);

    // Keep legacy user state synchronized with storeUser
    useEffect(() => {
        if (storeUser) {
            setUser({
                id: storeUser.id,
                name: storeUser.name,
                fullName: storeUser.name,
                email: storeUser.email,
                phone: storeUser.phone,
                role: storeUser.role,
                loginTime: new Date().toISOString()
            });
        }
    }, [storeUser]);

    return (
        <LoginContext.Provider value={{ user, loading, login, logout, checkExistingSession }}>
            {children}
        </LoginContext.Provider>
    );
}

export function useLogin() {
    const context = useContext(LoginContext);
    if (context === undefined) {
        throw new Error('useLogin must be used within LoginProvider');
    }
    return context;
}