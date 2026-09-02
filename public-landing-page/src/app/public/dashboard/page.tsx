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

    // Category Distribution
    const categoryData = [
        { name: "Roads & Infra", value: 34, color: "#2563EB" },
        { name: "Water Supply", value: 24, color: "#0284C7" },
        { name: "Sanitation & Waste", value: 18, color: "#10B981" },
        { name: "Street Lighting", value: 12, color: "#F59E0B" },
        { name: "Drainage", value: 8, color: "#6366F1" },
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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <PublicNavbar />

            {/* Page Header */}
            <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Public Transparency Portal</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                                Community Progress Dashboard
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                                Real-time aggregated governance metrics, resolution velocity, and municipal service performance across Dharwad.
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                            {(["30d", "90d", "1y"] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setTimeRange(r)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                        timeRange === r
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-slate-400 hover:text-white"
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-10">
                {/* ── 1. Top Aggregated KPIs ────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                        title="Total Service Requests"
                        value="3,710"
                        subtitle="Received this quarter"
                        icon={Activity}
                        color="blue"
                        trend={{ value: "+12%", positive: true, label: "civic engagement" }}
                    />
                    <StatCard
                        title="Issues Resolved"
                        value="3,648"
                        subtitle="98.3% resolution rate"
                        icon={CheckCircle2}
                        color="green"
                        trend={{ value: "+3.4%", positive: true, label: "vs last quarter" }}
                    />
                    <StatCard
                        title="Work in Progress"
                        value="62"
                        subtitle="Active on-ground tasks"
                        icon={Clock}
                        color="orange"
                    />
                    <StatCard
                        title="Average Resolution Time"
                        value="1.8 Days"
                        subtitle="Across all municipal depts"
                        icon={TrendingUp}
                        color="navy"
                        trend={{ value: "-14%", positive: true, label: "faster MTTR" }}
                    />
                </div>

                {/* ── 2. Analytics Visualizations Grid ──────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Improvement Trend (2 Cols) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Monthly Community Resolution Trend</h3>
                                <p className="text-xs text-slate-500">Grievances reported vs verified completions</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                98.4% SLA Compliance
                            </span>
                        </div>

                        <div className="h-72 w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#0F172A", color: "#fff", borderRadius: 12, fontSize: 12 }}
                                    />
                                    <Bar dataKey="reported" name="Reported" fill="#93C5FD" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Distribution (1 Col) */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Issue Category Breakdown</h3>
                            <p className="text-xs text-slate-500">Distribution by municipal sector</p>
                        </div>

                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val: any) => [`${val}%`, "Share"]}
                                        contentStyle={{ backgroundColor: "#0F172A", color: "#fff", borderRadius: 12, fontSize: 12 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                            {categoryData.map((c) => (
                                <div key={c.name} className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                                    <span className="text-slate-600 truncate">{c.name} ({c.value}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── 3. Department Performance Table ───────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
                    <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Department Resolution Performance</h3>
                            <p className="text-xs text-slate-500">Audited service delivery metrics by department</p>
                        </div>
                        <span className="text-xs text-slate-400">Updated every 15 minutes</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-6">Department</th>
                                    <th className="py-3 px-6">Total Requests</th>
                                    <th className="py-3 px-6">Resolved</th>
                                    <th className="py-3 px-6">SLA Compliance</th>
                                    <th className="py-3 px-6">Average MTTR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                {departmentPerformance.map((dept) => (
                                    <tr key={dept.department} className="hover:bg-slate-50/80 transition">
                                        <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-blue-600" />
                                            {dept.department}
                                        </td>
                                        <td className="py-4 px-6 font-semibold">{dept.total}</td>
                                        <td className="py-4 px-6 text-emerald-600 font-bold">{dept.resolved}</td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                                {dept.slaScore}%
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-slate-500">{dept.avgTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── 4. Anonymized Public Activity Feed ────────────────────── */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Live Anonymized Civic Action Feed</h3>
                            <p className="text-xs text-slate-500">Strictly privacy-protected public progress logs</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Zero Personal Data Exposed</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {anonymizedFeed.map((item) => (
                            <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-blue-600">{item.id}</span>
                                    <span className="text-slate-400">{item.time}</span>
                                </div>
                                <p className="text-xs font-semibold text-slate-800">{item.action}</p>
                                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px] text-slate-500">
                                    <span>{item.ward}</span>
                                    <span className="text-emerald-700 font-semibold">{item.status}</span>
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
