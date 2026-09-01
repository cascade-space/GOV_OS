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
        // Only redirect if we're sure about the authentication state
        if (!loading && !error) {
            // If no user is logged in, redirect to login
            if (!user || !role) {
                console.log('No authenticated user, redirecting to login');
                // Use replace instead of push to avoid back button issues
                router.replace('/admin/login');
                return;
            }

            // Check role-based access
            if (requiredRole === 'admin' && !canAccessAdmin) {
                console.log('Access denied: Admin role required, redirecting to unauthorized');
                router.replace('/unauthorized');
                return;
            }
            
            if (requiredRole === 'mla' && !canAccessMLA) {
                console.log('Access denied: MLA role required, redirecting to unauthorized');
                router.replace('/unauthorized');
                return;
            }
        }
    }, [loading, user, role, requiredRole, canAccessAdmin, canAccessMLA, router, error]);

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-blue mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Show error if authentication check failed
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => router.push('/admin/login')}
                        className="bg-civic-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </button>
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