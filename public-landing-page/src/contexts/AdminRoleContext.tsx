"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AdminRole = 'admin' | 'mla' | null;

interface User {
    email: string;
    role: AdminRole;
    loginTime: string;
}

interface AdminRoleContextType {
    user: User | null;
    role: AdminRole;
    isAdmin: boolean;
    isMLA: boolean;
    canAccessAdmin: boolean;
    canAccessMLA: boolean;
    hasAdminAccess: boolean;
    checkRole: () => Promise<void>;
    login: (email: string, role: AdminRole) => void;
    logout: () => void;
    loading: boolean;
    error: string | null;
}

const AdminRoleContext = createContext<AdminRoleContextType | undefined>(undefined);

export function AdminRoleProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<AdminRole>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const login = (email: string, userRole: AdminRole) => {
        const userData: User = {
            email,
            role: userRole,
            loginTime: new Date().toISOString()
        };
        
        setUser(userData);
        setRole(userRole);
        setLoading(false); // Ensure loading is false after login
        localStorage.setItem('civicpath_user', JSON.stringify(userData));
        console.log('✅ User logged in:', userData);
    };

    const logout = () => {
        setUser(null);
        setRole(null);
        localStorage.removeItem('civicpath_user');
        console.log('✅ User logged out');
    };

    const checkRole = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // First check localStorage for existing session
            const storedUser = localStorage.getItem('civicpath_user');
            if (storedUser) {
                try {
                    const userData: User = JSON.parse(storedUser);
                    // Check if session is still valid (less than 24 hours old)
                    const loginTime = new Date(userData.loginTime);
                    const now = new Date();
                    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
                    
                    if (hoursDiff < 24) {
                        setUser(userData);
                        setRole(userData.role);
                        console.log('✅ Session restored from localStorage:', userData);
                        return;
                    } else {
                        // Session expired
                        localStorage.removeItem('civicpath_user');
                        console.log('⚠️ Session expired, cleared localStorage');
                    }
                } catch (parseError) {
                    console.error('Error parsing stored user data:', parseError);
                    localStorage.removeItem('civicpath_user');
                }
            }

            // If no valid session in localStorage, user is not authenticated
            // Don't make API calls with test emails - this was causing the auto-login issue
            setUser(null);
            setRole(null);
            console.log('ℹ️ No valid session found, user not authenticated');
            
        } catch (error) {
            console.error('Role check failed:', error);
            setUser(null);
            setRole(null);
            setError(error instanceof Error ? error.message : 'Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkRole();
    }, []);

    const value: AdminRoleContextType = {
        user,
        role,
        isAdmin: role === 'admin',
        isMLA: role === 'mla',
        canAccessAdmin: role === 'admin',
        canAccessMLA: role === 'admin' || role === 'mla',
        hasAdminAccess: role !== null,
        checkRole,
        login,
        logout,
        loading,
        error
    };

    return (
        <AdminRoleContext.Provider value={value}>
            {children}
        </AdminRoleContext.Provider>
    );
}

export function useAdminRole() {
    const context = useContext(AdminRoleContext);
    if (context === undefined) {
        throw new Error('useAdminRole must be used within AdminRoleProvider');
    }
    return context;
}