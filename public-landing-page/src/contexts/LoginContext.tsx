"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AdminRole = 'admin' | 'mla' | null;

interface User {
    id?: string;
    email?: string;
    phone?: string;
    fullName?: string;
    role: AdminRole | 'CITIZEN';
    loginTime: string;
}

interface LoginContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, userData: any) => void;
    logout: () => void;
    checkExistingSession: () => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export function LoginProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkExistingSession = () => {
        try {
            setLoading(true);
            
            const token = localStorage.getItem('civicpath_token');
            const storedUser = localStorage.getItem('civicpath_user');
            
            if (token && storedUser) {
                try {
                    const userData: User = JSON.parse(storedUser);
                    setUser(userData);
                    console.log('✅ Existing session found:', userData.role);
                    return;
                } catch (parseError) {
                    console.error('Error parsing stored user data:', parseError);
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
        localStorage.setItem('civicpath_token', token);
        const userObj: User = {
            ...userData,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('civicpath_user', JSON.stringify(userObj));
        setUser(userObj);
    };

    const logout = () => {
        localStorage.removeItem('civicpath_token');
        localStorage.removeItem('civicpath_user');
        setUser(null);
    };

    useEffect(() => {
        checkExistingSession();
    }, []);

    const value: LoginContextType = {
        user,
        loading,
        login,
        logout,
        checkExistingSession
    };

    return (
        <LoginContext.Provider value={value}>
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