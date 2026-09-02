"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminRole } from "@/contexts/AdminRoleContext";

interface AdminRoleGuardProps {
    requiredRole: "admin" | "mla";
    children: React.ReactNode;
}

export function AdminRoleGuard({ requiredRole, children }: AdminRoleGuardProps) {
    const { role } = useAdminRole();
    const router = useRouter();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        let activeRole = role;
        if (!activeRole && typeof window !== "undefined") {
            const stored = localStorage.getItem("civicpath_user");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    activeRole = parsed.role;
                } catch { /* empty */ }
            }
        }

        if (!activeRole) {
            setAuthorized(false);
            router.replace("/login");
            return;
        }

        if (requiredRole === "admin" && activeRole !== "admin" && activeRole !== "superadmin") {
            setAuthorized(false);
            router.replace("/login");
            return;
        }

        if (requiredRole === "mla" && activeRole !== "mla" && activeRole !== "admin" && activeRole !== "superadmin") {
            setAuthorized(false);
            router.replace("/login");
            return;
        }

        setAuthorized(true);
    }, [role, requiredRole, router]);

    if (authorized === false) {
        return null;
    }

    return <>{children}</>;
}