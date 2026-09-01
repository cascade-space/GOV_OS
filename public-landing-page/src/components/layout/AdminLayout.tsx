"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, FileText, Users, BarChart2,
    Settings, MapPin, Bell, ChevronDown, LogOut, Menu, X, Megaphone
} from "lucide-react";
import { useState } from "react";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { useAdminRole } from "@/contexts/AdminRoleContext";

const ICONS: Record<string, React.ReactNode> = {
    LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
    FileText: <FileText className="w-4 h-4" />,
    Users: <Users className="w-4 h-4" />,
    BarChart2: <BarChart2 className="w-4 h-4" />,
    Megaphone: <Megaphone className="w-4 h-4" />,
    Settings: <Settings className="w-4 h-4" />,
};

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { counts } = useNotifications();
    const { user, logout } = useAdminRole();

    const handleLogout = () => {
        logout();
        router.push('/admin-login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-civic-blue flex flex-col transition-transform duration-300 lg:translate-x-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="p-5 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-none">CivicPath</p>
                            <p className="text-blue-200 text-xs">Admin Console</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Main Menu</p>
                    {ADMIN_NAV.map((item) => {
                        // Determine notification count for each item
                        let notificationCount = 0;
                        if (item.href === "/admin/complaints") {
                            notificationCount = counts.pendingComplaints;
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "sidebar-item",
                                    pathname === item.href || pathname.startsWith(item.href + "/")
                                        ? "sidebar-item-active"
                                        : "sidebar-item-inactive"
                                )}
                            >
                                {ICONS[item.icon]}
                                <span>{item.label}</span>
                                {notificationCount > 0 && (
                                    <span className="ml-auto bg-civic-orange text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {notificationCount > 99 ? '99+' : notificationCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User / Logout */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                                {user?.email?.charAt(0).toUpperCase() || 'A'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                                {user?.role === 'admin' ? 'Admin User' : 'MLA User'}
                            </p>
                            <p className="text-blue-300 text-xs truncate">{user?.email || 'admin@civicpath.com'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-blue-200 hover:text-white text-sm rounded-lg hover:bg-white/5 transition-colors mt-1 w-full"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between sticky top-0 z-30 shadow-card">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-base font-bold text-gray-900">
                                {ADMIN_NAV.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.label ?? "Admin Console"}
                            </h1>
                            <p className="text-xs text-gray-500 hidden sm:block">Cascade Technologies Solutions</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            {(counts.newComplaints + counts.slaBreached + counts.escalatedComplaints) > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-civic-orange rounded-full" />
                            )}
                        </button>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200">
                            <div className="w-6 h-6 rounded-full bg-civic-blue flex items-center justify-center">
                                <span className="text-white text-xs font-bold">A</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">Admin</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-5 lg:p-6 overflow-auto animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <NotificationProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </NotificationProvider>
    );
}
