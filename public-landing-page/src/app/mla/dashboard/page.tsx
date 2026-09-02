"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    MapPin,
    TrendingUp,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Users,
    Download,
    Share2,
    LogOut,
    Send,
    PlusCircle,
    Building2,
    Shield,
    Star,
    Layers,
    ChevronRight,
    AlertCircle,
    X,
    Filter,
} from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import toast from "react-hot-toast";
import { StatCard, ProgressCard } from "@/components/ui/StatCard";
import { DHARWAD_WARDS } from "@/lib/constants";

export default function MLADashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"overview" | "directives" | "breaches" | "wards">("overview");

    // Modal state for Representative Actions
    const [directiveModalOpen, setDirectiveModalOpen] = useState(false);
    const [escalateModalOpen, setEscalateModalOpen] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<any>(null);

    // Form inputs
    const [directiveDept, setDirectiveDept] = useState("Roads & Public Works");
    const [directiveTitle, setDirectiveTitle] = useState("");
    const [directiveDeadline, setDirectiveDeadline] = useState("72");
    const [directivePriority, setDirectivePriority] = useState("high");

    // Active Directives List
    const [directives, setDirectives] = useState([
        {
            id: "DIR-2026-041",
            department: "Roads & Public Works",
            title: "Immediate pothole sealing on Saptapur main transit corridor prior to monsoon",
            issuedAt: "Sep 01, 2026",
            deadline: "48 Hours",
            status: "In Execution",
            officer: "Suresh Patil (JE)",
        },
        {
            id: "DIR-2026-039",
            department: "Water Supply & Sewerage",
            title: "Desilting and pressure testing for Block B Line Bazaar drainage lines",
            issuedAt: "Aug 29, 2026",
            deadline: "24 Hours",
            status: "Compliance Verified",
            officer: "Anand Rao (AE)",
        },
    ]);

    // SLA Breaches Monitor
    const slaBreaches = [
        {
            id: "CP-2026-8712",
            title: "Persistent low pressure water line at Kalyan Nagar Block 4",
            department: "Water Supply & Sewerage",
            ward: "Ward 2",
            overdueBy: "18 Hours Overdue",
            priority: "critical",
            assignedOfficer: "Anand Rao",
        },
        {
            id: "CP-2026-8695",
            title: "Non-functional transformer causing commercial low voltage",
            department: "Electricity Distribution (HESCOM)",
            ward: "Ward 7",
            overdueBy: "6 Hours Overdue",
            priority: "high",
            assignedOfficer: "Vinay Joshi",
        },
    ];

    // Performance Trend data
    const trendData = [
        { month: "Apr", reported: 420, resolved: 410 },
        { month: "May", reported: 580, resolved: 565 },
        { month: "Jun", reported: 710, resolved: 690 },
        { month: "Jul", reported: 640, resolved: 630 },
        { month: "Aug", reported: 820, resolved: 805 },
        { month: "Sep", reported: 540, resolved: 532 },
    ];

    // SLA Trend data
    const slaTrend = [
        { month: "Apr", rate: 91 },
        { month: "May", rate: 93 },
        { month: "Jun", rate: 94 },
        { month: "Jul", rate: 96 },
        { month: "Aug", rate: 97 },
        { month: "Sep", rate: 98.4 },
    ];

    // Major Ongoing Infrastructure Projects
    const majorProjects = [
        {
            title: "Saptapur University Main Road Four-Laning",
            department: "Roads & Public Works",
            ward: "Ward 1 • Saptapur",
            progress: 82,
            targetDate: "Oct 15, 2026",
            status: "Ahead of Schedule",
            budget: "₹1.25 Cr",
        },
        {
            title: "Kelgeri Lakefront Rejuvenation & Park",
            department: "Parks & Environment",
            ward: "Ward 5 • Kelgeri",
            progress: 94,
            targetDate: "Sep 20, 2026",
            status: "Final Verification",
            budget: "₹85.0 L",
        },
    ];

    const handleRaiseDirective = (e: React.FormEvent) => {
        e.preventDefault();
        if (!directiveTitle.trim()) {
            toast.error("Enter directive title");
            return;
        }

        const newDir = {
            id: `DIR-2026-0${directives.length + 42}`,
            department: directiveDept,
            title: directiveTitle,
            issuedAt: "Just now",
            deadline: `${directiveDeadline} Hours`,
            status: "Dispatched",
            officer: "Department Head",
        };

        setDirectives([newDir, ...directives]);
        setDirectiveTitle("");
        setDirectiveModalOpen(false);
        toast.success("Executive Directive Issued to " + directiveDept);
    };

    const handleEscalateIssue = () => {
        if (!selectedIssue) return;
        toast.success(`Executive Escalation sent for ${selectedIssue.id} to Chief Engineer.`);
        setEscalateModalOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("civicpath_user");
        router.push("/admin/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-18">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center font-bold text-white shadow-md">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-white text-base">CivicPath</span>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase border border-amber-500/30">
                                        MLA Executive Oversight
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">Dharwad Constituency (#71) • Legislative Desk</p>
                            </div>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDirectiveModalOpen(true)}
                                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>Raise Directive</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    toast.success("Executive Constituency Performance Report generated (PDF).");
                                }}
                                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
                            >
                                <Download className="w-3.5 h-3.5 text-blue-400" />
                                <span>Export Report</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Dashboard Sub-Header */}
            <div className="bg-slate-900 text-white py-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Executive Governance Overview
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400">
                                Real-time operational oversight across 8 Wards, 6 Departments, and major capital infrastructure works.
                            </p>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex items-center gap-1 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setActiveTab("overview")}
                                className={`px-3.5 py-1.5 rounded-lg transition ${
                                    activeTab === "overview" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("directives")}
                                className={`px-3.5 py-1.5 rounded-lg transition ${
                                    activeTab === "directives" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                Directives ({directives.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("breaches")}
                                className={`px-3.5 py-1.5 rounded-lg transition ${
                                    activeTab === "breaches" ? "bg-rose-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                SLA Breaches ({slaBreaches.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("wards")}
                                className={`px-3.5 py-1.5 rounded-lg transition ${
                                    activeTab === "wards" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                                }`}
                            >
                                Ward Health
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-10">
                {/* ── 1. Top Executive KPIs ─────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                        title="Total Grievances (All Time)"
                        value="3,380"
                        subtitle="Constituency-wide intake"
                        icon={Layers}
                        color="blue"
                        trend={{ value: "+8%", positive: true, label: "this quarter" }}
                    />
                    <StatCard
                        title="Resolved & Verified"
                        value="3,248"
                        subtitle="96.1% resolution efficacy"
                        icon={CheckCircle2}
                        color="green"
                        trend={{ value: "+12%", positive: true, label: "resolved rate" }}
                    />
                    <StatCard
                        title="Active Municipal Works"
                        value="132"
                        subtitle="In-progress on ground"
                        icon={Clock}
                        color="orange"
                    />
                    <StatCard
                        title="Constituency SLA Score"
                        value="98.4%"
                        subtitle="Standard compliance benchmark"
                        icon={Shield}
                        color="navy"
                        trend={{ value: "+2.1%", positive: true, label: "higher adherence" }}
                    />
                </div>

                {/* ── Tab 1: Overview ───────────────────────────────────────── */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Monthly Performance Trend (2 cols) */}
                            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">Monthly Grievance Resolution Trend</h3>
                                        <p className="text-xs text-slate-500">Submitted complaints vs on-ground resolutions</p>
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        98.4% SLA
                                    </span>
                                </div>

                                <div className="h-72 w-full pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={trendData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#fff", borderRadius: 12, fontSize: 12 }} />
                                            <Line type="monotone" dataKey="reported" name="Submitted" stroke="#94A3B8" strokeWidth={2} dot={{ r: 4 }} />
                                            <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* SLA Compliance Trend (1 col) */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">SLA Compliance Trajectory</h3>
                                    <p className="text-xs text-slate-500">6-Month audited compliance rate</p>
                                </div>

                                <div className="h-52 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={slaTrend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                                            <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "#fff", borderRadius: 12, fontSize: 12 }} />
                                            <Line type="monotone" dataKey="rate" name="SLA %" stroke="#2563EB" strokeWidth={3} dot={{ r: 5, fill: "#2563EB" }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs flex items-center justify-between">
                                    <span className="text-blue-900 font-semibold">Current Adherence:</span>
                                    <span className="text-blue-700 font-extrabold text-sm">98.4%</span>
                                </div>
                            </div>
                        </div>

                        {/* Major Infrastructure Capital Works */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">Major Infrastructure Projects</h3>
                                    <p className="text-xs text-slate-500">Priority constituency capital works under execution</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDirectiveModalOpen(true)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    <span>Issue Project Directive</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {majorProjects.map((p, idx) => (
                                    <ProgressCard key={idx} {...p} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Tab 2: Directives ─────────────────────────────────────── */}
                {activeTab === "directives" && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Executive Representative Directives</h3>
                                <p className="text-xs text-slate-500">Formal instructions dispatched to department heads with mandated timelines</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDirectiveModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>Create New Directive</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            {directives.map((d) => (
                                <div
                                    key={d.id}
                                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-100/60 transition"
                                >
                                    <div className="space-y-1 max-w-2xl">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-bold">
                                                {d.id}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-600">{d.department}</span>
                                            <span className="text-slate-400 text-xs">• Issued {d.issuedAt}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-sm">{d.title}</h4>
                                        <p className="text-xs text-slate-500">Assigned Lead: <strong>{d.officer}</strong></p>
                                    </div>

                                    <div className="flex items-center gap-3 self-start md:self-auto">
                                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold whitespace-nowrap">
                                            {d.status}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => toast.success(`Status request dispatched to ${d.department}`)}
                                            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            Request Update
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tab 3: SLA Breaches ───────────────────────────────────── */}
                {activeTab === "breaches" && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-rose-600" />
                                Critical SLA Breaches & Overdue Grievances
                            </h3>
                            <p className="text-xs text-slate-500">Unresolved complaints requiring immediate executive intervention or ministerial escalation</p>
                        </div>

                        <div className="space-y-3">
                            {slaBreaches.map((b) => (
                                <div
                                    key={b.id}
                                    className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">
                                                {b.id}
                                            </span>
                                            <span className="text-xs font-bold text-rose-700">{b.overdueBy}</span>
                                            <span className="text-xs text-slate-500">• {b.ward}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-sm">{b.title}</h4>
                                        <p className="text-xs text-slate-500">
                                            Department: <strong>{b.department}</strong> • Officer: <strong>{b.assignedOfficer}</strong>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 self-start md:self-auto">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedIssue(b);
                                                setEscalateModalOpen(true);
                                            }}
                                            className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
                                        >
                                            Escalate to Chief Engineer
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tab 4: Ward Performance ───────────────────────────────── */}
                {activeTab === "wards" && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Constituency Ward Health Breakdown</h3>
                            <p className="text-xs text-slate-500">Comparative performance across all 8 Wards of Dharwad</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {DHARWAD_WARDS.map((w) => {
                                const rate = Math.round((w.resolved / w.totalIssues) * 100);
                                return (
                                    <div key={w.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold">
                                                Ward {w.number}
                                            </span>
                                            <span className="text-xs font-extrabold text-emerald-600">{rate}% Resolved</span>
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{w.name}</h4>
                                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
                                        </div>
                                        <div className="flex justify-between text-[11px] text-slate-500">
                                            <span>Total: {w.totalIssues}</span>
                                            <span className="text-emerald-700 font-semibold">{w.resolved} Closed</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* ── Raise Directive Modal ─────────────────────────────────────── */}
            {directiveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                                <PlusCircle className="w-5 h-5 text-blue-600" />
                                <span>Issue Executive Directive</span>
                            </div>
                            <button onClick={() => setDirectiveModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleRaiseDirective} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Target Municipal Department</label>
                                <select
                                    value={directiveDept}
                                    onChange={(e) => setDirectiveDept(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="Roads & Public Works">Roads & Public Works (RPW)</option>
                                    <option value="Water Supply & Sewerage">Water Supply & Sewerage (WSS)</option>
                                    <option value="Solid Waste Management">Solid Waste Management (SWM)</option>
                                    <option value="Street Light Operations">Street Light Operations (SLO)</option>
                                    <option value="Electricity Board">Electricity Distribution (HESCOM)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">Directive Order & Subject</label>
                                <textarea
                                    value={directiveTitle}
                                    onChange={(e) => setDirectiveTitle(e.target.value)}
                                    rows={3}
                                    placeholder="Enter detailed executive instructions for the department head..."
                                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Mandated Timeframe</label>
                                    <select
                                        value={directiveDeadline}
                                        onChange={(e) => setDirectiveDeadline(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="24">24 Hours (Immediate Priority)</option>
                                        <option value="48">48 Hours</option>
                                        <option value="72">72 Hours</option>
                                        <option value="168">7 Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Priority Classification</label>
                                    <select
                                        value={directivePriority}
                                        onChange={(e) => setDirectivePriority(e.target.value)}
                                        className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="critical">Critical (Public Safety)</option>
                                        <option value="high">High Priority</option>
                                        <option value="medium">Standard Operational</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDirectiveModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-sm"
                                >
                                    Dispatch Directive
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Escalate Issue Modal ──────────────────────────────────────── */}
            {escalateModalOpen && selectedIssue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
                                <AlertTriangle className="w-5 h-5 text-rose-600" />
                                <span>Escalate SLA Breach</span>
                            </div>
                            <button onClick={() => setEscalateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="text-xs space-y-2 text-slate-700">
                            <p>You are initiating an Executive Escalation for:</p>
                            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 font-medium">
                                <p className="font-bold text-slate-900">{selectedIssue.id} • {selectedIssue.title}</p>
                                <p className="text-rose-700 mt-1">{selectedIssue.overdueBy} • {selectedIssue.department}</p>
                            </div>
                            <p className="text-slate-500">
                                This will send an instant high-priority red alert directly to the Municipal Commissioner and Chief Engineer.
                            </p>
                        </div>

                        <div className="pt-2 flex justify-end gap-2 text-xs">
                            <button
                                onClick={() => setEscalateModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEscalateIssue}
                                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-sm"
                            >
                                Confirm Escalation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
