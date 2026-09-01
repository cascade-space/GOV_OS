"use client";
import { AdminRoleProvider } from "@/contexts/AdminRoleContext";
import { usePathname } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    
    // Don't wrap login page with AdminRoleProvider to avoid redirect loops
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }
    
    return (
        <AdminRoleProvider>
            {children}
        </AdminRoleProvider>
    );
}