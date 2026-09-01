"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminRoleProvider } from "@/contexts/AdminRoleContext";
import { AdminRoleGuard } from "@/components/auth/AdminRoleGuard";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { MOCK_STATS, MOCK_TREND_DATA, MOCK_CATEGORY_DATA, MOCK_OFFICERS } from "@/lib/mockData";
import { formatNumber, cn } from "@/lib/utils";
import {
    TrendingUp, CheckCircle2, Clock, AlertTriangle, Users,
    MapPin, Star, Download, Share2, LogOut, BarChart2, UserPlus
} from "lucide-react";
import CreateOfficerModal from "@/components/mla/CreateOfficerModal";
import OfficersList from "@/components/mla/OfficersList";
import toast from "react-hot-toast";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const SLA_TREND = [
    { month: "Sep", rate: 78 },
    { month: "Oct", rate: 82 },
    { month: "Nov", rate: 79 },
    { month: "Dec", rate: 85 },
    { month: "Jan", rate: 88 },
    { month: "Feb", rate: 91 },
];

function MLADashboardContent() {
    const router = useRouter();
    const { user, logout } = useAdminRole();
    const [departmentPerformance, setDepartmentPerformance] = useState([]);
    const [stats, setStats] = useState({
        totalIssues: 0, resolved: 0, pending: 0, totalTrend: '+0%', resolvedTrend: '+0%'
    });
    const [loading, setLoading] = useState(true);
    const [showCreateOfficer, setShowCreateOfficer] = useState(false);
    const [officers, setOfficers] = useState<any[]>([]);
    const [backendOnline, setBackendOnline] = useState(false);
    const topOfficers = [...MOCK_OFFICERS].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 3);

    useEffect(() => {
        fetchDepartmentPerformance();
        fetchStats();
        fetchOfficers();

        // Only auto-refresh if backend is reachable — check every 30s
        const statsInterval = setInterval(() => { fetchStats(); }, 30000);
        const deptInterval = setInterval(() => { fetchDepartmentPerformance(); }, 60000);
        return () => { clearInterval(statsInterval); clearInterval(deptInterval); };
    }, []);

    const fetchOfficers = async () => {
        try {
            const storedUser = localStorage.getItem('civicpath_user');
            const userData = storedUser ? JSON.parse(storedUser) : null;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/v1/officers`, {
                headers: { 'x-user-email': userData?.email || '' }
            });
            const data = await res.json();
            if (data.success) {
                setOfficers(data.data);
                setBackendOnline(true);
            }
        } catch { /* silent fail */ }
    };

    const fetchStats = async () => {
        try {
            const storedUser = localStorage.getItem('civicpath_user');
            const userData = storedUser ? JSON.parse(storedUser) : null;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/v1/complaints/stats/dashboard`, {
                headers: { 'x-user-email': userData?.email || '' }
            });
            const data = await response.json();
            if (data.success) {
                const statsData = data.data;
                const total = parseInt(statsData.total_complaints) || 0;
                const resolved = parseInt(statsData.resolved) || 0;
                const pending = parseInt(statsData.submitted) + parseInt(statsData.in_progress) || 0;
                setStats({
                    totalIssues: total,
                    resolved: resolved,
                    pending: pending,
                    totalTrend: '+12%',
                    resolvedTrend: '+8%'
                });
            }
        } catch { /* silent fail */ }
    };

    const fetchDepartmentPerformance = async () => {
        try {
            const storedUser = localStorage.getItem('civicpath_user');
            const userData = storedUser ? JSON.parse(storedUser) : null;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/v1/mla/department-performance`, {
                headers: { 'x-user-email': userData?.email || '' }
            });
            const data = await response.json();
            if (data.success) setDepartmentPerformance(data.data);
        } catch { /* silent fail */ }
        finally { setLoading(false); }
    };

    const handleLogout = () => {
        logout();
        router.push('/admin-login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <header className="bg-gradient-hero text-white px-5 py-4 shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-black text-base leading-none">CivicPath</p>
                            <p className="text-blue-200 text-xs">MLA Leadership View</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl border border-white/15 text-sm font-medium transition-colors">
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                        <button className="flex items-center gap-2 bg-civic-orange text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">
                            <Share2 className="w-4 h-4" />
                            Share Stats
                        </button>
                        <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Logout">
                            <LogOut className="w-4 h-4 text-blue-200" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Welcome */}
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Executive Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Constituency Performance Overview — February 2024</p>
                </div>

                {/* Backend offline warning */}
                {!backendOnline && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <span className="text-amber-500 text-lg">⚠️</span>
                        <div>
                            <p className="text-sm font-semibold text-amber-800">Backend not running</p>
                            <p className="text-xs text-amber-600">Run <code className="bg-amber-100 px-1 rounded">node backend/src/server.js</code> to load live data and officers</p>
                        </div>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Total Issues", value: formatNumber(stats.totalIssues), sub: "All time", icon: <BarChart2 className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50", trend: stats.totalTrend },
                        { label: "Resolved", value: formatNumber(stats.resolved), sub: "This month", icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, bg: "bg-green-50", trend: stats.resolvedTrend },
                        { label: "Pending", value: formatNumber(stats.pending), sub: "Awaiting action", icon: <Clock className="w-5 h-5 text-orange-600" />, bg: "bg-orange-50", trend: " " },
                    ].map((s) => (
                        <div key={s.label} className="civic-card p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>{s.icon}</div>
                                {s.trend.trim() && (
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{s.trend}</span>
                                )}
                            </div>
                            <p className="text-3xl font-black text-gray-900">{s.value}</p>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">{s.label}</p>
                            <p className="text-xs text-gray-400">{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Trend */}
                    <div className="civic-card p-5 lg:col-span-2">
                        <h3 className="section-title mb-5">Monthly Performance Trend</h3>
                        <ResponsiveContainer width="100%" height={230}>
                            <LineChart data={MOCK_TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                                <Legend wrapperStyle={{ fontSize: "12px" }} />
                                <Line type="monotone" dataKey="submitted" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 3 }} name="Submitted" />
                                <Line type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3 }} name="Resolved" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* SLA Trend */}
                    <div className="civic-card p-5">
                        <h3 className="section-title mb-5">SLA Compliance Trend</h3>
                        <ResponsiveContainer width="100%" height={170}>
                            <LineChart data={SLA_TREND} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} unit="%" />
                                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} formatter={(v) => [`${v}%`, "SLA Rate"]} />
                                <Line type="monotone" dataKey="rate" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4, fill: "#16a34a" }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-400">Current Rate</span>
                            <span className="text-lg font-black text-civic-green">91%</span>
                        </div>
                    </div>
                </div>

                {/* Top Officers */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="civic-card p-5">
                        <h3 className="section-title mb-5">Top Performing Officers</h3>
                        <div className="space-y-4">
                            {topOfficers.map((o, i) => (
                                <div key={o.id} className="flex items-center gap-3">
                                    <span className="text-lg flex-shrink-0">{["🥇", "🥈", "🥉"][i]}</span>
                                    <div className="w-10 h-10 bg-gradient-civic rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-black">{o.name.charAt(0)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800">{o.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{o.department}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-black text-civic-blue">{o.performanceScore}%</p>
                                        <p className="text-xs text-gray-400">{o.resolvedTotal} done</p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Users className="w-3.5 h-3.5" />
                                    {MOCK_OFFICERS.filter((o) => o.isActive).length} officers active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Officer Management */}
                <div className="civic-card p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="section-title">Officer Management</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{officers.length} officer{officers.length !== 1 ? 's' : ''} created</p>
                        </div>
                        <button
                            onClick={() => setShowCreateOfficer(true)}
                            className="flex items-center gap-2 bg-civic-blue text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            Create Officer
                        </button>
                    </div>
                    <OfficersList
                        officers={officers}
                        onStatusChange={(id, status) =>
                            setOfficers(prev => prev.map(o => o.id === id ? { ...o, status } : o))
                        }
                        onDelete={(id) => setOfficers(prev => prev.filter(o => o.id !== id))}
                    />
                </div>

                {/* Create Officer Modal */}
                {showCreateOfficer && (
                    <CreateOfficerModal
                        onClose={() => setShowCreateOfficer(false)}
                        onSuccess={(newOfficer) => {
                            setOfficers(prev => [newOfficer, ...prev]);
                            setShowCreateOfficer(false);
                            toast.success(`Officer ${newOfficer.name} created successfully!`);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default function MLADashboardPage() {
    return (
        <AdminRoleGuard requiredRole="mla">
            <MLADashboardContent />
        </AdminRoleGuard>
    );
}
