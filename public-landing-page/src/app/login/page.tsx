"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    MapPin,
    Shield,
    Building2,
    Crown,
    Briefcase,
    ShieldCheck,
    ArrowRight,
    Lock,
    Mail,
    Eye,
    EyeOff,
    CheckCircle2,
    Sparkles,
    Zap,
    LogIn,
    Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface RoleOption {
    id: "admin" | "mla" | "officer" | "superadmin";
    name: "Municipal Admin" | "MLA Representative" | "Field Officer" | "Master SuperAdmin";
    title: string;
    subtitle: string;
    badge: string;
    email: string;
    targetRoute: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    borderColor: string;
    badgeColor: string;
    sessionData: any;
}

export default function UnifiedLoginPage() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<"admin" | "mla" | "officer" | "superadmin">("admin");
    const [email, setEmail] = useState("admin@civicpath.com");
    const [password, setPassword] = useState("admin123");
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
            email: "admin@civicpath.com",
            targetRoute: "/admin/dashboard",
            icon: Building2,
            accentColor: "from-blue-600 to-indigo-700",
            borderColor: "border-blue-500/30 hover:border-blue-500",
            badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            sessionData: {
                user: {
                    id: "usr-admin-01",
                    email: "admin@civicpath.com",
                    name: "Municipal Tenant Administrator",
                    role: "admin",
                    tenant: "Dharwad Municipal Corporation",
                },
            },
        },
        {
            id: "mla",
            name: "MLA Representative",
            title: "Legislative Oversight",
            subtitle: "Constituency #71 metrics, ministerial escalations & executive directives",
            badge: "Constituency Desk",
            email: "mla@civicpath.com",
            targetRoute: "/mla/dashboard",
            icon: Crown,
            accentColor: "from-amber-500 to-orange-600",
            borderColor: "border-amber-500/30 hover:border-amber-500",
            badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            sessionData: {
                user: {
                    id: "usr-mla-01",
                    email: "mla@civicpath.com",
                    name: "Hon. MLA Representative",
                    role: "mla",
                    constituency: "Dharwad (AC-71)",
                },
            },
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
            sessionData: {
                token: "officer-demo-jwt-" + Date.now(),
                officer: {
                    id: 1,
                    name: "Suresh Patil (Junior Engineer)",
                    email: "officer@demo.govos.in",
                    department: "Roads & Public Works",
                    role: "field_officer",
                },
            },
        },
        {
            id: "superadmin",
            name: "Master SuperAdmin",
            title: "GovOS Platform Operator",
            subtitle: "Multi-tenant master administration, platform security & tenant onboarding",
            badge: "Platform Root",
            email: "superadmin@civicpath.gov.in",
            targetRoute: "/superadmin/dashboard",
            icon: ShieldCheck,
            accentColor: "from-purple-600 to-indigo-800",
            borderColor: "border-purple-500/30 hover:border-purple-500",
            badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
            sessionData: {
                superadmin: {
                    email: "superadmin@civicpath.gov.in",
                    role: "SUPER_ADMIN",
                    fullName: "GovOS Master SuperAdmin",
                },
            },
        },
    ];

    // 1-Click Login Handler
    const handleQuickLogin = (role: RoleOption) => {
        setLoadingRole(role.id);

        // Store role-specific credentials in localStorage
        if (role.id === "officer") {
            localStorage.setItem(
                "officer_session",
                JSON.stringify({
                    ...role.sessionData,
                    loginTime: new Date().toISOString(),
                })
            );
        } else if (role.id === "superadmin") {
            localStorage.setItem(
                "civicpath_superadmin",
                JSON.stringify({
                    ...role.sessionData.superadmin,
                    loginTime: new Date().toISOString(),
                })
            );
        }

        // Shared civicpath_user session
        localStorage.setItem(
            "civicpath_user",
            JSON.stringify({
                id: `demo-${role.id}-session`,
                email: role.email,
                name: role.title,
                role: role.id,
                loginTime: new Date().toISOString(),
            })
        );

        toast.success(`Logged in as ${role.name}!`);

        setTimeout(() => {
            router.push(role.targetRoute);
        }, 400);
    };

    // Standard Form Submit
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const currentRole = roles.find((r) => r.id === selectedRole) || roles[0];
        handleQuickLogin(currentRole);
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
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-extrabold text-white text-lg tracking-tight">CivicPath</span>
                            <span className="block text-[11px] text-slate-400 font-medium">GovOS Unified Governance Gateway</span>
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
            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col justify-center space-y-10">
                {/* Title and Intro */}
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-3.5 h-3.5 text-blue-400" />
                        <span>Instant 1-Click Role Login</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Stakeholder Portal Gateway
                    </h1>
                    <p className="text-sm text-slate-400">
                        Choose your governance role below for <strong>instant one-click access</strong>, or sign in with assigned credentials.
                    </p>
                </div>

                {/* ── 1-CLICK QUICK ACCESS CARDS (4 Roles) ───────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        const isLoading = loadingRole === role.id;

                        return (
                            <div
                                key={role.id}
                                className={`relative bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border ${role.borderColor} flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 group`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div
                                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.accentColor} flex items-center justify-center text-white shadow-md shadow-black/40`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${role.badgeColor}`}>
                                            {role.badge}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-white text-base group-hover:text-blue-300 transition">
                                            {role.name}
                                        </h3>
                                        <p className="text-xs font-semibold text-slate-400 mt-0.5">{role.title}</p>
                                        <p className="text-xs text-slate-400/90 mt-2 leading-relaxed">
                                            {role.subtitle}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 mt-4 border-t border-slate-800/80 space-y-2">
                                    <div className="text-[11px] text-slate-500 font-mono">
                                        ID: <span className="text-slate-400">{role.email}</span>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isLoading || loadingRole !== null}
                                        onClick={() => handleQuickLogin(role)}
                                        className={`w-full py-2.5 px-4 rounded-xl bg-gradient-to-r ${role.accentColor} hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Authenticating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Login as {role.name}</span>
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
                            <span>Or Sign In with Custom Credentials</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">CivicPath Auth v2.0</span>
                    </div>

                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Select Target Role */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Portal Role</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {roles.map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedRole(r.id);
                                            setEmail(r.email);
                                        }}
                                        className={`p-2 rounded-xl border text-[11px] font-bold text-center transition ${
                                            selectedRole === r.id
                                                ? "bg-blue-600 border-blue-500 text-white shadow-sm"
                                                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        {r.name.replace(" Master", "")}
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
                                    placeholder="your-email@civicpath.gov.in"
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
                                    placeholder="Enter your password"
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
                                    <span>Authenticating...</span>
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
