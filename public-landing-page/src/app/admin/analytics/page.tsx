"use client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MOCK_TREND_DATA, MOCK_CATEGORY_DATA, MOCK_OFFICERS } from "@/lib/mockData";
import { useState } from "react";
import { Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from "recharts";

const RESOLUTION_DIST = [
    { range: "< 1 day", count: 45 },
    { range: "1–2 days", count: 78 },
    { range: "2–3 days", count: 92 },
    { range: "3–5 days", count: 65 },
    { range: "5–7 days", count: 38 },
    { range: "> 7 days", count: 22 },
];

const SLA_DATA = [
    { dept: "Roads", compliant: 88, breached: 12 },
    { dept: "Water", compliant: 93, breached: 7 },
    { dept: "Electricity", compliant: 72, breached: 28 },
    { dept: "Sanitation", compliant: 90, breached: 10 },
    { dept: "Lighting", compliant: 85, breached: 15 },
];

const DATE_RANGES = ["Last 7 Days", "Last 30 Days", "Last 3 Months", "Last Year"];

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState("Last 30 Days");

    return (
        <AdminLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Analytics & Reports</h2>
                        <p className="text-gray-500 text-sm">Performance metrics and insights</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Date Range */}
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                            {DATE_RANGES.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setDateRange(r)}
                                    className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors", dateRange === r ? "bg-civic-blue text-white shadow-card" : "text-gray-500 hover:text-gray-700")}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                        <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Row 1: Trend + Pie */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="civic-card p-5 lg:col-span-2">
                        <h3 className="section-title mb-5">Complaint Submission vs Resolution Trend</h3>
                        <ResponsiveContainer width="100%" height={240}>
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
                    <div className="civic-card p-5">
                        <h3 className="section-title mb-4">Category Breakdown</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={MOCK_CATEGORY_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={3}>
                                    {MOCK_CATEGORY_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} formatter={(v) => [`${v}%`, ""]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 mt-2">
                            {MOCK_CATEGORY_DATA.map((item) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 2: Resolution Time + SLA */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="civic-card p-5">
                        <h3 className="section-title mb-5">Resolution Time Distribution</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={RESOLUTION_DIST} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} />
                                <Bar dataKey="count" name="Issues" fill="#1e3a5f" radius={[5, 5, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="civic-card p-5">
                        <h3 className="section-title mb-5">SLA Compliance by Department</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={SLA_DATA} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }} barSize={14}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} unit="%" />
                                <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: "#6b7280" }} />
                                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: "12px" }} formatter={(v) => [`${v}%`, ""]} />
                                <Bar dataKey="compliant" name="On Track" fill="#16a34a" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="breached" name="Breached" fill="#f97316" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>


            </div>
        </AdminLayout>
    );
}
