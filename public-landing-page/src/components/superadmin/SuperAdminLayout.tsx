"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    Shield, LayoutDashboard, FileText, Users, UserCheck,
    BarChart2, LogOut, Menu, X, ChevronRight, MapPin
} from "lucide-react";
import toast from "react-hot-toast";

const NAV = [
    { href: "/superadmin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/superadmin/complaints", label: "All Complaints", icon: FileText },
    { href: "/superadmin/constituencies", label: "Constituencies", icon: MapPin },
    { href: "/superadmin/officers", label: "Officers", icon: UserCheck },
    { href: "/superadmin/users", label: "Users", icon: Users },
    { href: "/superadmin/analytics", label: "Analytics", icon: BarChart2 },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("civicpath_superadmin");
        if (!stored) { router.push("/superadmin/login"); return; }
        setUserEmail(JSON.parse(stored).email);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("civicpath_superadmin");
        toast.success("Logged out");
        router.push("/superadmin/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}>
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
                    <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-black text-sm leading-none">CivicPath</p>
                        <p className="text-slate-400 text-xs mt-0.5">Super Admin</p>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 hover:bg-slate-700 rounded">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {NAV.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href;
                        return (
                            <Link key={href} href={href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                    active ? "bg-white/15 text-white" : "text-slate-400 hover:bg-white/8 hover:text-white"
                                }`}>
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {label}
                                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Portal links */}
                <div className="px-3 py-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500 px-3 mb-2 uppercase tracking-wide">Quick Access</p>
                    {[
                        { href: "/admin/dashboard", label: "Admin Portal" },
                        { href: "/mla/dashboard", label: "MLA Portal" },
                        { href: "/citizen", label: "Citizen Portal" },
                        { href: "/officer/dashboard", label: "Officer Portal" },
                    ].map(({ href, label }) => (
                        <Link key={href} href={href} target="_blank"
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/8 rounded-lg transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            {label}
                        </Link>
                    ))}
                </div>

                {/* User */}
                <div className="px-4 py-4 border-t border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs">{userEmail.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{userEmail}</p>
                            <p className="text-xs text-slate-400">Super Admin</p>
                        </div>
                        <button onClick={handleLogout} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors" title="Logout">
                            <LogOut className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                        <Menu className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">
                            {NAV.find(n => n.href === pathname)?.label || "Super Admin"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 hidden sm:block">{userEmail}</span>
                        <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">{userEmail.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 sm:p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
