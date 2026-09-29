"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { UserRole } from "@/lib/store";

/**
 * Generic RBAC route guard for all GovOS portals.
 *
 * Replaces AdminRoleGuard (which only handled 'admin'/'mla' string roles).
 * Now supports all 5 backend roles: SUPER_ADMIN, TENANT_ADMIN, OFFICER, REP, CITIZEN.
 *
 * Usage:
 *   <RoleGuard allowedRoles={['TENANT_ADMIN', 'SUPER_ADMIN']}>
 *     <AdminDashboard />
 *   </RoleGuard>
 */
interface RoleGuardProps {
    allowedRoles: UserRole[];
    redirectTo?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function RoleGuard({
    allowedRoles,
    redirectTo = "/login",
    children,
    fallback = null,
}: RoleGuardProps) {
    const { role, loading } = useAdminRole();
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (loading) return;

        if (!role) {
            setAuthorized(false);
            router.replace(redirectTo);
            return;
        }

        if (allowedRoles.includes(role)) {
            setAuthorized(true);
        } else {
            setAuthorized(false);
            // Redirect to the correct portal based on the user's actual role
            const portalMap: Record<UserRole, string> = {
                SUPER_ADMIN:  '/admin',
                TENANT_ADMIN: '/admin',
                OFFICER:      '/officer',
                REP:          '/mla',
                CITIZEN:      '/citizen',
            };
            router.replace(portalMap[role] ?? redirectTo);
        }
    }, [role, loading, allowedRoles, redirectTo, router]);

    if (loading || authorized === null) {
        return <>{fallback}</>;
    }

    if (!authorized) return null;

    return <>{children}</>;
}

/**
 * Pre-configured guards for each portal \u2014 use these for cleaner imports.
 */
export const AdminGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'TENANT_ADMIN']} redirectTo="/login">
        {children}
    </RoleGuard>
);

export const OfficerGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard allowedRoles={['OFFICER', 'SUPER_ADMIN', 'TENANT_ADMIN']} redirectTo="/officer/login">
        {children}
    </RoleGuard>
);

export const MlaGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard allowedRoles={['REP', 'SUPER_ADMIN', 'TENANT_ADMIN']} redirectTo="/mla/login">
        {children}
    </RoleGuard>
);

export const CitizenGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard allowedRoles={['CITIZEN', 'SUPER_ADMIN', 'TENANT_ADMIN', 'OFFICER']} redirectTo="/citizen/login">
        {children}
    </RoleGuard>
);

export const SuperAdminGuard = ({ children }: { children: React.ReactNode }) => (
    <RoleGuard allowedRoles={['SUPER_ADMIN']} redirectTo="/login">
        {children}
    </RoleGuard>
);

/**
 * Legacy alias \u2014 existing components using AdminRoleGuard still work.
 * Maps 'admin' => TENANT_ADMIN/SUPER_ADMIN, 'mla' => REP/TENANT_ADMIN/SUPER_ADMIN.
 * @deprecated Use RoleGuard with explicit allowedRoles instead.
 */
export function AdminRoleGuard({
    requiredRole,
    children,
}: {
    requiredRole: "admin" | "mla";
    children: React.ReactNode;
}) {
    const roleMap = {
        admin: ['SUPER_ADMIN', 'TENANT_ADMIN'] as UserRole[],
        mla:   ['SUPER_ADMIN', 'TENANT_ADMIN', 'REP'] as UserRole[],
    };
    return <RoleGuard allowedRoles={roleMap[requiredRole]}>{children}</RoleGuard>;
}
