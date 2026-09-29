"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Building2,
    ShieldAlert,
    Briefcase,
    Crown,
    ArrowRight,
    Lock,
    Mail,
    ShieldCheck,
    Shield,
    Eye,
    EyeOff,
    CheckCircle2,
    Sparkles,
    Zap,
    LogIn,
    Loader2,
    Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { persistSession } from "@/lib/services/auth.service";
import { useAppStore, AuthUser, UserRole } from "@/lib/store";

interface RoleOption {
    id: "admin" | "mla" | "officer" | "superadmin" | "citizen";
    name: string;
    title: string;
    subtitle: string;
    badge: string;
    email: string;
    targetRoute: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    borderColor: string;
    badgeColor: string;
}

export default function UnifiedLoginPage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<"admin" | "mla" | "officer" | "superadmin" | "citizen">("admin");
    const [email, setEmail] = useState("admin@demo.govos.in");
    const [password, setPassword] = useState("Admin@123");
    const [showPassword, setShowPassword] = useState(false);
    const [loadingRole, setLoadingRole] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const roles: RoleOption[] = [
        {
            id: "admin",
            name: "Municipal Admin",
            title: "Tenant Administrator",
            subtitle: "Department workflows, staff allocation, grievances & SLA management",
            badge: "Municipal Operations",
            email: "admin@demo.govos.in",
            targetRoute: "/admin/dashboard",
            icon: Building2,
            accentColor: "from-blue-600 to-indigo-700",
            borderColor: "border-blue-500/30 hover:border-blue-500",
            badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        },
        {
            id: "mla",
            name: "MLA Representative",
            title: "Legislative Oversight",
            subtitle: "Constituency #71 metrics, ministerial escalations & executive directives",
            badge: "Constituency Desk",
            email: "mla@dharwad.gov.in",
            targetRoute: "/mla/dashboard",
            icon: Crown,
            accentColor: "from-amber-500 to-orange-600",
            borderColor: "border-amber-500/30 hover:border-amber-500",
            badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        },
        {
            id: "officer",
            name: "Field Officer",
            title: "Junior Engineer (PWD)",
            subtitle: "On-ground task resolution, timeline milestones & photo evidence",
            badge: "Field Operations",
            email: "officer@demo.govos.in",
            targetRoute: "/officer/dashboard",
            icon: Briefcase,
            accentColor: "from-emerald-500 to-teal-600",
            borderColor: "border-emerald-500/30 hover:border-emerald-500",
            badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        },
        {
            id: "superadmin",
            name: "Master SuperAdmin",
            title: "GovOS Platform Operator",
            subtitle: "Multi-tenant master administration, platform security & tenant onboarding",
            badge: "Platform Root",
            email: "admin@govos.in",
            targetRoute: "/superadmin/dashboard",
            icon: ShieldCheck,
            accentColor: "from-purple-600 to-indigo-800",
            borderColor: "border-purple-500/30 hover:border-purple-500",
            badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        },
        {
            id: "citizen",
            name: "Citizen Portal",
            title: "Resident of Dharwad",
            subtitle: "Report civic issues, track progress live, and confirm resolutions",
            badge: "Citizen Access",
            email: "citizen@demo.govos.in",
            targetRoute: "/citizen/dashboard",
            icon: Users,
            accentColor: "from-teal-600 to-emerald-700",
            borderColor: "border-teal-500/30 hover:border-teal-500",
            badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
        },
    ];

    // Real DB Login Authenticator
    const authenticateWithDb = async (loginEmail: string, loginPass: string, defaultTargetRoute?: string) => {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
        const res = await fetch(`${baseURL}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: loginEmail, password: loginPass })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || `Authentication failed with status ${res.status}`);
        }

        const authData = await res.json();
        const realToken = authData.accessToken;
        if (!realToken) {
            throw new Error("No access token returned by database authentication server");
        }

        const backendUser = authData.user || {};

        // 1. Decode claims from the real JWT signed by backend
        let tokenRole: string | null = null;
        try {
            const parts = realToken.split(".");
            if (parts.length === 3) {
                const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                const claims = JSON.parse(atob(base64));
                tokenRole = claims.rid;
            }
        } catch (e) {
            console.warn("Failed to parse JWT claims", e);
        }

        // 2. Resolve raw role string from token claim or backendUser object
        const rawRole = tokenRole 
            || backendUser.primaryRole 
            || (backendUser.roles && backendUser.roles[0]) 
            || "CITIZEN";

        // 3. Map to standard UserRole enum
        let primaryRole: UserRole = "CITIZEN";
        if (rawRole === "SUPER_ADMIN") primaryRole = "SUPER_ADMIN";
        else if (rawRole === "TENANT_ADMIN" || rawRole === "admin") primaryRole = "TENANT_ADMIN";
        else if (rawRole === "REP" || rawRole === "REPRESENTATIVE" || rawRole === "mla") primaryRole = "REP";
        else if (rawRole === "OFFICER" || rawRole === "officer") primaryRole = "OFFICER";
        else primaryRole = "CITIZEN";

        const authUser: AuthUser = {
            id: backendUser.id || "usr-db-01",
            name: backendUser.fullName || backendUser.displayName || backendUser.email || loginEmail,
            role: primaryRole,
            tenantId: backendUser.tenantId || (authData.tenant ? authData.tenant.id : "00000000-0000-0000-0000-000000000002"),
            wardId: backendUser.wardId,
            email: backendUser.email || loginEmail,
            token: realToken,
            refreshToken: authData.refreshToken || "",
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        };

        // Persist strictly to unified govos_auth and cookie
        persistSession(authUser);
        useAppStore.getState().setUser(authUser);

        if (typeof window !== "undefined") {
            localStorage.setItem("govos_auth_token", realToken);
            localStorage.setItem("civicpath_token", realToken);
            const userPayload = {
                id: authUser.id,
                email: authUser.email,
                name: authUser.name,
                role: authUser.role,
                loginTime: new Date().toISOString(),
            };
            const userJson = JSON.stringify(userPayload);
            localStorage.setItem("civicpath_user", userJson);
            if (primaryRole === "SUPER_ADMIN") {
                localStorage.setItem("civicpath_superadmin", userJson);
                localStorage.setItem("civicpath_superadmin_token", realToken);
            }
        }

        toast.success(`Successfully authenticated as ${authUser.name} (${primaryRole})!`);

        // Determine destination route based on actual verified role
        let target = "/citizen/dashboard";
        if (primaryRole === "SUPER_ADMIN") target = "/superadmin/dashboard";
        else if (primaryRole === "TENANT_ADMIN") target = "/admin/dashboard";
        else if (primaryRole === "REP") target = "/mla/dashboard";
        else if (primaryRole === "OFFICER") target = "/officer/dashboard";

        setTimeout(() => {
            window.location.href = target;
        }, 250);
    };

    // 1-Click Quick Login Handler: Calls real DB auth with Admin@123
    const handleQuickLogin = async (role: RoleOption) => {
        setLoadingRole(role.id);
        try {
            await authenticateWithDb(role.email, "Admin@123", role.targetRoute);
        } catch (err: any) {
            toast.error(err?.message || "Database login failed");
        } finally {
            setLoadingRole(null);
        }
    };

    // Standard Form Submit: Calls real DB auth with entered credentials
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const currentRole = roles.find((r) => r.id === selectedRole);
            await authenticateWithDb(email, password, currentRole?.targetRoute);
        } catch (err: any) {
            toast.error(err?.message || "Invalid email or password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
            {/* Background Ambient Glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
                            <MapPinIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-extrabold text-white text-lg tracking-tight">GovOS</span>
                            <span className="block text-[11px] text-slate-400 font-medium">Unified Governance Gateway</span>
                        </div>
                    </Link>

                    <Link
                        href="/"
                        className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition flex items-center gap-1.5"
                    >
                        <span>← Citizen Home</span>
                    </Link>
                </div>
            </header>

            {/* Main Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col justify-center space-y-10">
                {/* Title and Intro */}
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-3.5 h-3.5 text-blue-400" />
                        <span>Instant 1-Click Real DB Login</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Stakeholder Portal Gateway
                    </h1>
                    <p className="text-sm text-slate-400">
                        Choose your governance role below for <strong>instant one-click database access</strong>, or sign in with your credentials. Password: <code className="text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded">Admin@123</code>
                    </p>
                </div>

                {/* ── 1-CLICK QUICK ACCESS CARDS (5 Roles) ───────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        const isLoading = loadingRole === role.id;

                        return (
                            <div
                                key={role.id}
                                className={`relative bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border ${role.borderColor} flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 group`}
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div
                                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.accentColor} flex items-center justify-center text-white shadow-md shadow-black/40`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${role.badgeColor}`}>
                                            {role.badge}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-white text-sm group-hover:text-blue-300 transition">
                                            {role.name}
                                        </h3>
                                        <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{role.title}</p>
                                        <p className="text-[11px] text-slate-400/90 mt-1.5 leading-relaxed line-clamp-2">
                                            {role.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 mt-3 border-t border-slate-800/80 space-y-2">
                                    <div className="text-[10px] text-slate-500 font-mono truncate">
                                        ID: <span className="text-slate-300">{role.email}</span>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isLoading || loadingRole !== null}
                                        onClick={() => handleQuickLogin(role)}
                                        className={`w-full py-2.5 px-3 rounded-xl bg-gradient-to-r ${role.accentColor} hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Connecting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Login as {role.name}</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Custom Credentials Form (Collapsible / Alternative) ───── */}
                <div className="max-w-xl mx-auto w-full bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span>Or Sign In with Custom Database Credentials</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-mono">Unified Auth</span>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Select Target Role */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Portal Role</label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {roles.map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedRole(r.id);
                                            setEmail(r.email);
                                            setPassword("Admin@123");
                                        }}
                                        className={`p-2 rounded-xl border text-[11px] font-bold text-center transition ${
                                            selectedRole === r.id
                                                ? "bg-blue-600 border-blue-500 text-white shadow-sm"
                                                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        {r.name.replace(" Master", "").replace(" Portal", "")}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Authorized Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="your-email@demo.govos.in"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    placeholder="Enter your database password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Default unified credentials password: <span className="text-emerald-400 font-bold">Admin@123</span></p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Authenticating with Database...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    <span>Sign In to Portal</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
                <p>Protected by GovOS Security & Role-Based Access Control (RBAC) • Municipal Corporation of Dharwad</p>
            </footer>
        </div>
    );
}

function MapPinIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}
