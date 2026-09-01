"use client";
import { useState, useEffect } from "react";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { RefreshCw } from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const COLORS = ["#1e3a5f","#16a34a","#f97316","#ef4444","#8b5cf6","#06b6d4","#84cc16"];

export default function SuperAdminAnalytics() {
    const [trend, setTrend] = useState<any[]>([]);
    const [overview, setOverview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("7d");
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("civicpath_superadmin");
        if (stored) { const u = JSON.parse(stored); setUserEmail(u.email); fetchData(u.email); }
    }, []);

    useEffect(() => { if (userEmail) fetchData(userEmail); }, [range]);

    const fetchData = async (email: string) => {
        setLoading(true);
        try {
            const headers = { "x-user-email": email };
            const [tr, ov] = await Promise.all([
                fetch(`${API}/api/v1/superadmin/trend`, { headers }).then(r => r.json()),
                fetch(`${API}/api/v1/superadmin/overview`, { headers }).then(r => r.json()),
            ]);
            if (tr.success) setTrend(tr.data);
            if (ov.success) setOverview(ov.data);
        } catch { toast.error("Failed to load analytics"); }
        finally { setLoading(false); }
    };

    const c = overview?.complaints;

    const statusData = c ? [
        { name: "Submitted", value: parseInt(c.pending) || 0 },
        { name: "Resolved", value: parseInt(c.resolved) || 0 },
        { name: "Closed", value: parseInt(c.closed) || 0 },
    ].filter(d => d.value > 0) : [];

    const resolutionRate = c && parseInt(c.total) > 0
        ? Math.round((parseInt(c.resolved) / parseInt(c.total)) * 100)
        : 0;

    return (
        <SuperAdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Analytics</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Platform-wide performance metrics</p>
                    </div>
                    <button onClick={() => fetchData(userEmail)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64"><RefreshCw className="w-8 h-8 animate-spin text-slate-400" /></div>
                ) : (
                    <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: "Total Complaints", value: c?.total || 0, color: "text-blue-600" },
                                { label: "Resolution Rate", value: `${resolutionRate}%`, color: "text-green-600" },
                                { label: "Pending", value: c?.pending || 0, color: "text-orange-600" },
                                { label: "This Week", value: c?.this_week || 0, color: "text-purple-600" },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                                    <p className={`text-3xl font-black ${color}`}>{value}</p>
                                    <p className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wide">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Trend chart */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 mb-4">7-Day Complaint Trend</h3>
                            {trend.length === 0 ? (
                                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data for this period</div>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                                        <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                                        <Line type="monotone" dataKey="submitted" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 4 }} name="Submitted" />
                                        <Line type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} name="Resolved" />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Status breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-700 mb-4">Status Distribution</h3>
                                {statusData.length === 0 ? (
                                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                                                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-700 mb-4">Platform Summary</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: "Total Users", value: overview?.users?.total || 0, sub: `${overview?.users?.admins || 0} admins, ${overview?.users?.mlas || 0} MLAs` },
                                        { label: "Active Officers", value: overview?.officers?.active || 0, sub: `${overview?.officers?.total || 0} total` },
                                        { label: "Complaints Today", value: c?.today || 0, sub: "New submissions" },
                                        { label: "This Week", value: c?.this_week || 0, sub: "Last 7 days" },
                                    ].map(({ label, value, sub }) => (
                                        <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">{label}</p>
                                                <p className="text-xs text-gray-400">{sub}</p>
                                            </div>
                                            <p className="text-2xl font-black text-gray-900">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </SuperAdminLayout>
    );
}
