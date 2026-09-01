"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import {
    Shield, Users, FileText, CheckCircle2, Clock,
    AlertTriangle, Activity, Zap, UserCheck, RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_COLORS: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-700",
    validated: "bg-indigo-100 text-indigo-700",
    assigned: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-orange-100 text-orange-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-600",
    rejected: "bg-red-100 text-red-700",
};

function StatCard({ label, value, sub, icon, gradient, href }: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    gradient: string;
    href?: string;
}) {
    const inner = (
        <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg ${gradient} ${href ? "hover:scale-[1.02] active:scale-[0.99] transition-transform cursor-pointer" : ""}`}>
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-5 shadow-sm">
                {icon}
            </div>
            {/* Value */}
            <p className="text-5xl font-black text-white leading-none tracking-tight">{value}</p>
            {/* Label */}
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest mt-3">{label}</p>
            {/* Sub */}
            {sub && (
                <span className="inline-block mt-2 text-xs font-semibold text-white/60 bg-white/15 px-2.5 py-1 rounded-full">
                    {sub}
                </span>
            )}
            {/* Decorative circles */}
            <div className="absolute -right-5 -bottom-5 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        </div>
    );
    return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function SuperAdminDashboard() {
    const router = useRouter();
    const [overview, setOverview] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [officers, setOfficers] = useState<any[]>([]);
    const [trend, setTrend] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"complaints" | "users" | "officers">("complaints");
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("civicpath_superadmin");
        if (!stored) { router.push("/superadmin/login"); return; }
        const u = JSON.parse(stored);
        setUserEmail(u.email);
        fetchAll(u.email);
    }, []);

    const fetchAll = async (email: string) => {
        setLoading(true);
        try {
            const headers = { "x-user-email": email };
            const [ov, us, of, tr] = await Promise.all([
                fetch(`${API}/api/v1/superadmin/overview`, { headers }).then(r => r.json()),
                fetch(`${API}/api/v1/superadmin/users`, { headers }).then(r => r.json()),
                fetch(`${API}/api/v1/superadmin/officers`, { headers }).then(r => r.json()),
                fetch(`${API}/api/v1/superadmin/trend`, { headers }).then(r => r.json()),
            ]);
            if (ov.success) setOverview(ov.data);
            if (us.success) setUsers(us.data);
            if (of.success) setOfficers(of.data);
            if (tr.success) setTrend(tr.data);
        } catch { toast.error("Failed to load data"); }
        finally { setLoading(false); }
    };

    const c = overview?.complaints;
    const u = overview?.users;
    const o = overview?.officers;

    return (
        <SuperAdminLayout>
            <div className="space-y-7">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">System Overview</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Full platform visibility across all roles</p>
                    </div>
                    <button onClick={() => fetchAll(userEmail)} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <>
                        {/* Complaint KPI Cards — 3 main + 3 secondary */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Complaints</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                <StatCard label="Total" value={c?.total || 0} sub="All time"
                                    href="/superadmin/complaints"
                                    gradient="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800"
                                    icon={<FileText className="w-6 h-6 text-white" />} />
                                <StatCard label="Pending" value={c?.pending || 0}
                                    href="/superadmin/complaints"
                                    gradient="bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700"
                                    icon={<Clock className="w-6 h-6 text-white" />} />
                                <StatCard label="Resolved" value={c?.resolved || 0}
                                    href="/superadmin/complaints"
                                    gradient="bg-gradient-to-br from-emerald-400 via-green-500 to-green-700"
                                    icon={<CheckCircle2 className="w-6 h-6 text-white" />} />
                                <StatCard label="Escalated" value={c?.escalated || 0}
                                    gradient="bg-gradient-to-br from-red-400 via-red-500 to-rose-700"
                                    icon={<AlertTriangle className="w-6 h-6 text-white" />} />
                                <StatCard label="SLA Breached" value={c?.sla_breached || 0}
                                    gradient="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600"
                                    icon={<Zap className="w-6 h-6 text-white" />} />
                                <StatCard label="Today" value={c?.today || 0}
                                    gradient="bg-gradient-to-br from-violet-500 via-purple-600 to-purple-800"
                                    icon={<Activity className="w-6 h-6 text-white" />} />
                            </div>
                        </div>

                        {/* User & Officer Cards */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Users & Officers</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <StatCard label="Total Users" value={u?.total || 0} sub="Admin + MLA"
                                    href="/superadmin/users"
                                    gradient="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800"
                                    icon={<Users className="w-6 h-6 text-white" />} />
                                <StatCard label="Admins" value={u?.admins || 0}
                                    href="/superadmin/users"
                                    gradient="bg-gradient-to-br from-slate-500 via-slate-600 to-slate-800"
                                    icon={<Shield className="w-6 h-6 text-white" />} />
                                <StatCard label="MLAs" value={u?.mlas || 0}
                                    href="/superadmin/users"
                                    gradient="bg-gradient-to-br from-teal-400 via-teal-500 to-teal-700"
                                    icon={<UserCheck className="w-6 h-6 text-white" />} />
                                <StatCard label="Officers" value={o?.total || 0} sub={`${o?.active || 0} active`}
                                    href="/superadmin/officers"
                                    gradient="bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-700"
                                    icon={<Users className="w-6 h-6 text-white" />} />
                            </div>
                        </div>

                        {/* Trend Chart */}
                        {trend.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-700 mb-5">7-Day Complaint Trend</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                                        <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} name="Submitted" />
                                        <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} name="Resolved" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Tabbed data */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex border-b border-gray-100">
                                {(["complaints", "users", "officers"] as const).map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-3.5 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "text-slate-900 border-b-2 border-slate-900 bg-gray-50" : "text-gray-400 hover:text-gray-600"}`}>
                                        {tab === "complaints" ? "Recent Complaints" : tab === "users" ? `Users (${users.length})` : `Officers (${officers.length})`}
                                    </button>
                                ))}
                            </div>
                            <div className="p-5">
                                {activeTab === "complaints" && (
                                    <div className="space-y-2">
                                        {!(overview?.recentComplaints?.length) ? (
                                            <p className="text-center text-gray-400 py-8 text-sm">No complaints yet</p>
                                        ) : overview.recentComplaints.map((item: any) => (
                                            <Link key={item.id} href={`/admin/complaints/${item.id}`} target="_blank"
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{item.citizen_name} · {item.category}</p>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[item.status] || "bg-gray-100 text-gray-600"}`}>
                                                    {item.status.replace("_", " ")}
                                                </span>
                                            </Link>
                                        ))}
                                        <div className="pt-2 text-center">
                                            <Link href="/superadmin/complaints" className="text-sm text-slate-600 font-semibold hover:underline">View all complaints →</Link>
                                        </div>
                                    </div>
                                )}
                                {activeTab === "users" && (
                                    <div className="space-y-2">
                                        {!users.length ? <p className="text-center text-gray-400 py-8 text-sm">No users found</p>
                                        : users.map((user: any) => (
                                            <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-black text-sm">{(user.full_name || user.email).charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{user.full_name || "—"}</p>
                                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user.role === "admin" ? "bg-slate-100 text-slate-700" : "bg-teal-100 text-teal-700"}`}>{user.role}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === "officers" && (
                                    <div className="space-y-2">
                                        {!officers.length ? <p className="text-center text-gray-400 py-8 text-sm">No officers found</p>
                                        : officers.map((off: any) => (
                                            <div key={off.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                <div className="w-9 h-9 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-black text-sm">{off.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{off.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{off.department}{off.mla_name ? ` · MLA: ${off.mla_name}` : ""}</p>
                                                </div>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${off.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{off.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </SuperAdminLayout>
    );
}
