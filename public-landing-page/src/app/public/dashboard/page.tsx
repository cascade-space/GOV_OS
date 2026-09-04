"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
    Activity,
    CheckCircle2,
    Clock,
    TrendingUp,
    Building2,
    MapPin,
    Layers,
    Calendar,
    ArrowUpRight,
    PieChart as PieIcon,
    BarChart3,
    Shield,
    Sparkles,
    ChevronRight,
    Filter,
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    CartesianGrid,
    Legend,
} from "recharts";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { StatCard } from "@/components/ui/StatCard";

export default function PublicDashboardPage() {
    const [timeRange, setTimeRange] = useState<"30d" | "90d" | "1y">("30d");

    // Monthly Improvement Trends
    const monthlyTrend = [
        { month: "Apr", reported: 420, resolved: 410, satisfaction: 94 },
        { month: "May", reported: 580, resolved: 565, satisfaction: 95 },
        { month: "Jun", reported: 710, resolved: 690, satisfaction: 96 },
        { month: "Jul", reported: 640, resolved: 630, satisfaction: 97 },
        { month: "Aug", reported: 820, resolved: 805, satisfaction: 98 },
        { month: "Sep", reported: 540, resolved: 532, satisfaction: 99 },
    ];

    // Category Distribution - Home Page Emerald & Nature Palette
    const categoryData = [
        { name: "Roads & Infra", value: 34, color: "#059669" },
        { name: "Water Supply", value: 24, color: "#0D9488" },
        { name: "Sanitation & Waste", value: 18, color: "#10B981" },
        { name: "Street Lighting", value: 12, color: "#F59E0B" },
        { name: "Drainage", value: 8, color: "#3B82F6" },
        { name: "Public Health", value: 4, color: "#EC4899" },
    ];

    // Department Resolution Performance
    const departmentPerformance = [
        { department: "Roads & Public Works", total: 420, resolved: 408, slaScore: 97.1, avgTime: "3.2 days" },
        { department: "Water Supply & Sewerage", total: 310, resolved: 304, slaScore: 98.0, avgTime: "1.4 days" },
        { department: "Solid Waste Management", total: 240, resolved: 236, slaScore: 98.3, avgTime: "0.8 days" },
        { department: "Street Light Operations", total: 160, resolved: 158, slaScore: 98.7, avgTime: "1.1 days" },
        { department: "Public Health & Safety", total: 95, resolved: 93, slaScore: 97.8, avgTime: "1.8 days" },
    ];

    // Anonymized Public Activity Feed (Zero PII)
    const anonymizedFeed = [
        {
            id: "CP-2026-8941",
            category: "Roads & Public Works",
            action: "Pothole repair verified and quality approved",
            ward: "Ward 1 • Saptapur",
            time: "15 mins ago",
            status: "Verified Completed",
        },
        {
            id: "CP-2026-8938",
            category: "Water Supply",
            action: "Pipeline leakage plugged & pressure restored",
            ward: "Ward 3 • Line Bazaar",
            time: "42 mins ago",
            status: "Verified Completed",
        },
        {
            id: "CP-2026-8935",
            category: "Street Lighting",
            action: "4 LED fixtures replaced along pedestrian pathway",
            ward: "Ward 8 • Sadhankeri",
            time: "1 hour ago",
            status: "Verified Completed",
        },
        {
            id: "CP-2026-8930",
            category: "Solid Waste Management",
            action: "Community bin cleared and sanitized",
            ward: "Ward 6 • Hosayellapur",
            time: "2 hours ago",
            status: "Verified Completed",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
            <PublicNavbar />

            {/* Page Header */}
            <div className="bg-gradient-to-b from-white via-emerald-50/30 to-slate-50 border-b border-gray-200/80 py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 sm:space-y-2.5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200/60">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Public Transparency Portal</span>
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-gray-950">
                                Community Progress Dashboard
                            </h1>
                            <p className="text-xs sm:text-base text-gray-600 max-w-2xl leading-relaxed">
                                Real-time aggregated governance metrics, resolution velocity, and municipal service performance across Dharwad.
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto bg-white p-1 sm:p-1.5 rounded-2xl border border-gray-200 shadow-sm">
                            {(["30d", "90d", "1y"] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setTimeRange(r)}
                                    className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all text-center whitespace-nowrap ${
                                        timeRange === r
                                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                            : "text-gray-600 hover:text-gray-950 hover:bg-gray-100"
                                    }`}
                                >
                                    {r === "30d" ? "Last 30 Days" : r === "90d" ? "Last Quarter" : "Past Year"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 space-y-8 sm:space-y-10 w-full min-w-0">
                {/* ── 1. Top Aggregated KPIs ────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    <StatCard
                        title="Total Service Requests"
                        value="3,710"
                        subtitle="Received this quarter"
                        icon={Activity}
                        color="green"
                        trend={{ value: "+12%", positive: true, label: "civic engagement" }}
                    />
                    <StatCard
                        title="Citizens Resolved"
                        value="3,648"
                        subtitle="98.3% resolution rate"
                        icon={CheckCircle2}
                        color="green"
                        trend={{ value: "+4.2%", positive: true, label: "vs last quarter" }}
                    />
                    <StatCard
                        title="Under Active Work"
                        value="62"
                        subtitle="Currently assigned teams"
                        icon={Clock}
                        color="orange"
                    />
                    <StatCard
                        title="Average Resolution Time"
                        value="1.8 Days"
                        subtitle="Across all municipal depts"
                        icon={TrendingUp}
                        color="green"
                        trend={{ value: "-14%", positive: true, label: "faster MTTR" }}
                    />
                </div>

                {/* ── 2. Analytics Visualizations Grid ──────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Improvement Trend (2 Cols) */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-sm space-y-4 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div>
                                <h3 className="font-extrabold text-gray-950 text-base sm:text-lg">Monthly Community Resolution Trend</h3>
                                <p className="text-xs sm:text-sm text-gray-500">Grievances reported vs verified completions</p>
                            </div>
                            <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                98.4% SLA Compliance
                            </span>
                        </div>

                        <div className="h-64 sm:h-72 w-full pt-2 sm:pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#064E3B", color: "#ECFDF5", borderRadius: 12, border: "none", fontSize: 12, fontWeight: 600 }}
                                    />
                                    <Bar dataKey="reported" name="Reported" fill="#A7F3D0" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="resolved" name="Resolved" fill="#059669" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-bold text-gray-600">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-200 shrink-0" />
                                <span>Reported Complaints</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
                                <span>Resolved & Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Distribution (1 Col) */}
                    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-sm space-y-4 flex flex-col justify-between min-w-0">
                        <div>
                            <h3 className="font-extrabold text-gray-950 text-base sm:text-lg">Issue Category Breakdown</h3>
                            <p className="text-xs sm:text-sm text-gray-500">Distribution by municipal sector</p>
                        </div>

                        <div className="h-48 sm:h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        innerRadius={50}
                                        outerRadius={75}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val: any) => [`${val}%`, "Share"]}
                                        contentStyle={{ backgroundColor: "#064E3B", color: "#ECFDF5", borderRadius: 12, border: "none", fontSize: 12, fontWeight: 600 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] sm:text-xs pt-2 border-t border-gray-100 font-medium">
                            {categoryData.map((c) => (
                                <div key={c.name} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                    <span className="text-gray-600 truncate">{c.name} ({c.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── 3. Department Performance Table / Cards ───────────────────────── */}
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden min-w-0">
                    <div className="p-5 sm:p-8 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div>
                            <h3 className="font-extrabold text-gray-950 text-base sm:text-lg">Department Resolution Performance</h3>
                            <p className="text-xs sm:text-sm text-gray-500">Audited service delivery metrics by department</p>
                        </div>
                        <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
                            Updated every 15 minutes
                        </span>
                    </div>

                    {/* Mobile Card View (< sm) */}
                    <div className="block sm:hidden p-4 space-y-3 divide-y divide-gray-100">
                        {departmentPerformance.map((dept, idx) => (
                            <div key={dept.department} className={`space-y-3 ${idx > 0 ? "pt-3.5" : ""}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <span className="font-bold text-gray-950 text-sm leading-tight">{dept.department}</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 shrink-0">
                                        {dept.slaScore}% SLA
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-slate-50/80 p-2 rounded-xl border border-gray-100">
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Total</div>
                                        <div className="text-sm font-extrabold text-gray-900 mt-0.5">{dept.total}</div>
                                    </div>
                                    <div className="bg-slate-50/80 p-2 rounded-xl border border-gray-100">
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Resolved</div>
                                        <div className="text-sm font-extrabold text-emerald-600 mt-0.5">{dept.resolved}</div>
                                    </div>
                                    <div className="bg-slate-50/80 p-2 rounded-xl border border-gray-100">
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Avg MTTR</div>
                                        <div className="text-sm font-extrabold text-gray-700 mt-0.5">{dept.avgTime}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tablet/Desktop Table View (>= sm) */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full min-w-[620px] text-left text-xs sm:text-sm">
                            <thead className="bg-slate-50/80 text-gray-600 font-bold uppercase text-[11px] tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="py-3.5 px-6">Department</th>
                                    <th className="py-3.5 px-6">Total Requests</th>
                                    <th className="py-3.5 px-6">Resolved</th>
                                    <th className="py-3.5 px-6">SLA Compliance</th>
                                    <th className="py-3.5 px-6">Average MTTR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                {departmentPerformance.map((dept) => (
                                    <tr key={dept.department} className="hover:bg-emerald-50/30 transition">
                                        <td className="py-4 px-6 font-bold text-gray-950 flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            {dept.department}
                                        </td>
                                        <td className="py-4 px-6 font-bold text-gray-900">{dept.total}</td>
                                        <td className="py-4 px-6 text-emerald-600 font-extrabold">{dept.resolved}</td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                                {dept.slaScore}%
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-500 font-semibold">{dept.avgTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── 4. Anonymized Public Activity Feed ────────────────────── */}
                <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-200/80 shadow-sm space-y-5 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div>
                            <h3 className="font-extrabold text-gray-950 text-base sm:text-lg">Live Anonymized Civic Action Feed</h3>
                            <p className="text-xs sm:text-sm text-gray-500">Strictly privacy-protected public progress logs</p>
                        </div>
                        <div className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 whitespace-nowrap">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Zero Personal Data Exposed</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                        {anonymizedFeed.map((item) => (
                            <div key={item.id} className="p-4 rounded-2xl bg-slate-50/70 border border-gray-200/80 hover:border-emerald-200 hover:bg-emerald-50/20 transition space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold font-mono text-emerald-700">{item.id}</span>
                                    <span className="text-gray-400 font-medium">{item.time}</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900 leading-snug">{item.action}</p>
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs text-gray-500 gap-2">
                                    <span className="font-medium truncate">{item.ward}</span>
                                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 whitespace-nowrap shrink-0">{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <PublicFooter />
        </div>
    );
}
