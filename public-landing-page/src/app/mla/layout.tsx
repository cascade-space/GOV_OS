"use client";
import { AdminRoleProvider } from "@/contexts/AdminRoleContext";

export default function MLALayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminRoleProvider>
            {children}
        </AdminRoleProvider>
    );
}