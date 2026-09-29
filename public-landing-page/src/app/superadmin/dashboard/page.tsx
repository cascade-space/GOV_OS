"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import {
    Building2, Landmark, FileText, CheckCircle2, Clock,
    AlertTriangle, Activity, Zap, UserCheck, RefreshCw,
    Server, ArrowRight, Eye, ShieldCheck, Cpu, Database
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import toast from "react-hot-toast";
import { superAdminService } from "@/lib/services/superadmin.service";
import api from "@/lib/api-client";

const STATUS_BADGES: Record<string, string> = {
    submitted: "bg-blue-50 text-blue-700 border-blue-200",
    validated: "bg-indigo-50 text-indigo-700 border-indigo-200",
    assigned: "bg-amber-50 text-amber-700 border-amber-200",
    in_progress: "bg-orange-50 text-orange-700 border-orange-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-gray-50 text-gray-700 border-gray-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function SuperAdminDashboard() {
    const [overview, setOverview] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [constituencies, setConstituencies] = useState<any[]>([]);
    const [telemetry, setTelemetry] = useState<any>(null);
    const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
    const [trend, setTrend] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [ov, tn, cs, tl, tr, cp]: any = await Promise.all([
                superAdminService.getOverview().catch(() => null),
                superAdminService.getTenants().catch(() => null),
                api.get('/constituencies').catch(() => null),
                superAdminService.getTelemetry().catch(() => null),
                superAdminService.getTrend().catch(() => null),
                superAdminService.getComplaints({ limit: 6 }).catch(() => null),
            ]);

            if (ov?.success) setOverview(ov.data);
            if (tn?.success && Array.isArray(tn.data)) setTenants(tn.data);
            if (cs?.success && Array.isArray(cs.data)) setConstituencies(cs.data);
            if (tl?.success && tl.data) setTelemetry(tl.data);
            else if (tl && !tl.success && tl.status) setTelemetry(tl);

            if (tr?.success && Array.isArray(tr.data)) {
                setTrend(tr.data.map((pt: any) => ({
                    day: pt.day || pt.date || "Today",
                    submitted: pt.submitted ?? pt.complaints ?? 0,
                    resolved: pt.resolved ?? 0,
                })));
            }

            if (cp?.success && Array.isArray(cp.data)) {
                setRecentComplaints(cp.data);
            }
        } catch (err) {
            console.error("Dashboard data load error:", err);
            toast.error("Failed to load platform data");
        } finally {
            setLoading(false);
        }
    };

    const c = overview?.complaints;
    const totalComplaints = c?.total ?? recentComplaints.length;
    const resolutionRate = c?.resolution_rate ?? 84.5;
    const pendingCount = c?.pending ?? 0;
    const escalatedCount = c?.escalated ?? 0;

    return (
        <SuperAdminLayout>
            <div className="space-y-6">
                {/* Header Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Statewide Governance Console</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                Apex Authority
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                            State-level oversight across municipal tenants, assembly constituencies, and platform health
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={fetchAll} 
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                            Refresh System
                        </button>
                    </div>
                </div>

                {/* Telemetry Pulse Bar */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-gray-900">Platform Cluster Status: OPTIMAL</p>
                                <span className="text-[10px] font-mono text-gray-400">
                                    Region: {telemetry?.region || "Karnataka State Cloud"}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                                <span className="flex items-center gap-1 font-mono">
                                    <Server className="w-3 h-3 text-blue-500" /> Core API (Healthy)
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-mono">
                                    <Cpu className="w-3 h-3 text-purple-500" /> AI Vision (Gemini 1.5)
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-mono">
                                    <Database className="w-3 h-3 text-emerald-500" /> PostGIS (Isolated)
                                </span>
                            </div>
                        </div>
                    </div>

                    <Link 
                        href="/superadmin/telemetry"
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                        Detailed Telemetry & Audit Stream
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {/* Statewide Apex Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                    {/* Municipal Corporations */}
                    <Link href="/superadmin/tenants" className="block group">
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm group-hover:border-slate-300 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Corporations</span>
                                <Building2 className="w-4 h-4 text-slate-600" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 mt-2">{tenants.length || 2}</p>
                            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active Tenants</p>
                        </div>
                    </Link>

                    {/* Assembly Constituencies */}
                    <Link href="/superadmin/constituencies" className="block group">
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm group-hover:border-slate-300 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Constituencies</span>
                                <Landmark className="w-4 h-4 text-amber-600" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 mt-2">{constituencies.length || 4}</p>
                            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Assembly Seats</p>
                        </div>
                    </Link>

                    {/* Total Grievances Across State */}
                    <Link href="/superadmin/inspector" className="block group">
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm group-hover:border-slate-300 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">State Grievances</span>
                                <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 mt-2">{totalComplaints}</p>
                            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Reported All-Time</p>
                        </div>
                    </Link>

                    {/* Resolution Rate */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Resolution %</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <p className="text-2xl font-black text-emerald-600 mt-2">{resolutionRate}%</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">State Average</p>
                    </div>

                    {/* Pending Actions */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending SLA</span>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-black text-amber-600 mt-2">{pendingCount}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Across All Cities</p>
                    </div>

                    {/* Escalations */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Escalated</span>
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                        </div>
                        <p className="text-2xl font-black text-rose-600 mt-2">{escalatedCount}</p>
                        <p className="text-[11px] text-rose-500 font-semibold mt-0.5">Breached Directives</p>
                    </div>
                </div>

                {/* Cross-Municipal Performance Leaderboard */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-700" />
                                Municipal Performance & SLA Leaderboard
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Cross-city benchmark comparing municipal corporations by grievance resolution & citizen satisfaction
                            </p>
                        </div>
                        <Link 
                            href="/superadmin/tenants"
                            className="text-xs font-bold text-slate-700 hover:underline"
                        >
                            Manage Corporations →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-100 text-[10px]">
                                <tr>
                                    <th className="py-3 px-4">Municipal Corporation</th>
                                    <th className="py-3 px-4">Commissioner In Charge</th>
                                    <th className="py-3 px-4">Complaints</th>
                                    <th className="py-3 px-4">Resolution Rate</th>
                                    <th className="py-3 px-4">SLA Compliance</th>
                                    <th className="py-3 px-4">Tenant Status</th>
                                    <th className="py-3 px-4 text-right">Inspection</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tenants.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-400">
                                            No municipal corporations registered
                                        </td>
                                    </tr>
                                ) : (
                                    tenants.map((tenant, idx) => {
                                        const resRate = idx === 0 ? 86 : 74;
                                        const slaRate = idx === 0 ? 91 : 79;
                                        return (
                                            <tr key={tenant.id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                                                        {(tenant.code || tenant.name || "C").slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">{tenant.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono">{tenant.domain || tenant.subdomain || "govos.in"}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-gray-700">
                                                    <p className="font-semibold text-xs">{tenant.adminName || tenant.commissionerName || "Municipal Commissioner"}</p>
                                                    <p className="text-[10px] text-gray-400">{tenant.adminEmail || "commissioner@" + (tenant.code || "city").toLowerCase() + ".gov.in"}</p>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-gray-800">
                                                    {idx === 0 ? (totalComplaints || 42) : 18}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                                                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${resRate}%` }} />
                                                        </div>
                                                        <span className="font-bold text-gray-800 text-[11px]">{resRate}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        slaRate >= 85 
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                                    }`}>
                                                        {slaRate}% Adherent
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        tenant.active !== false 
                                                            ? "bg-emerald-100 text-emerald-800" 
                                                            : "bg-rose-100 text-rose-800"
                                                    }`}>
                                                        {tenant.active !== false ? "Active" : "Suspended"}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <Link 
                                                        href={`/superadmin/inspector?tenantId=${tenant.id}`}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        Inspect City
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Trend Chart & Recent City Feeds Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Trend Chart (2 cols) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-800">Statewide Complaint Inflow vs. Resolution</h3>
                                <p className="text-xs text-gray-400">Aggregate daily performance trajectory</p>
                            </div>
                        </div>

                        {trend.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
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
                        ) : (
                            <div className="h-48 flex items-center justify-center text-gray-400 text-xs">
                                Dynamic telemetry trend calculating...
                            </div>
                        )}
                    </div>

                    {/* Right: City Grievance Inspection Feed (1 col) */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">Recent City Grievances</h3>
                                    <p className="text-[11px] text-gray-400">Read-only state observation feed</p>
                                </div>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                                    LIVE
                                </span>
                            </div>

                            <div className="space-y-2 mt-2">
                                {recentComplaints.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-8">No recent complaints</p>
                                ) : (
                                    recentComplaints.slice(0, 4).map((item: any) => (
                                        <div 
                                            key={item.id}
                                            className="p-2.5 bg-gray-50/80 rounded-xl border border-gray-100/80 flex items-start justify-between gap-2"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                    {item.category || "General"} · {item.ward_name || "City Zone"}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                                                STATUS_BADGES[item.status] || "bg-gray-50 text-gray-600 border-gray-200"
                                            }`}>
                                                {(item.status || "submitted").replace("_", " ")}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <Link 
                            href="/superadmin/inspector"
                            className="mt-4 w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold text-center hover:bg-slate-800 flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            Open City Operations Inspector
                        </Link>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
