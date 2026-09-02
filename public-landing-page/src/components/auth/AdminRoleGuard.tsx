"use client";
import { useAdminRole } from '@/contexts/AdminRoleContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminRoleGuardProps {
    requiredRole: 'admin' | 'mla';
    children: React.ReactNode;
}

export function AdminRoleGuard({ requiredRole, children }: AdminRoleGuardProps) {
    const { user, role, loading, canAccessAdmin, canAccessMLA, error } = useAdminRole();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            const storedUser = typeof window !== "undefined" ? localStorage.getItem('civicpath_user') : null;
            let storedRole: string | null = null;
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    storedRole = parsed.role;
                } catch { /* empty */ }
            }

            const activeRole = role || storedRole;

            if (!activeRole) {
                router.replace('/login');
                return;
            }

            if (requiredRole === 'admin' && activeRole !== 'admin' && activeRole !== 'superadmin') {
                router.replace('/login');
                return;
            }
            
            if (requiredRole === 'mla' && activeRole !== 'mla' && activeRole !== 'admin' && activeRole !== 'superadmin') {
                router.replace('/login');
                return;
            }
        }
    }, [loading, user, role, requiredRole, canAccessAdmin, canAccessMLA, router, error]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying session...</p>
                </div>
            </div>
        );
    }


    // If no user, don't render anything (redirect will happen via useEffect)
    if (!user || !role) {
        return null;
    }

    // Check access permissions
    if (requiredRole === 'admin' && !canAccessAdmin) {
        return null; // Will redirect via useEffect
    }
    
    if (requiredRole === 'mla' && !canAccessMLA) {
        return null; // Will redirect via useEffect
    }

    // Access granted - render children
    return <>{children}</>;
}