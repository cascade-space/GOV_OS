"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import {
    Eye, Landmark, Search, RefreshCw, CheckCircle2, Clock, AlertTriangle,
    MapPin, Users, ShieldAlert, FileText, ChevronRight, X
} from "lucide-react";
import toast from "react-hot-toast";
import { superAdminService } from "@/lib/services/superadmin.service";

const STATUS_COLORS: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-700",
    validated: "bg-indigo-100 text-indigo-700",
    assigned: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-orange-100 text-orange-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-600",
    rejected: "bg-red-100 text-red-700",
};

function InspectorContent() {
    const searchParams = useSearchParams();
    const [tenants, setTenants] = useState<any[]>([]);
    const [selectedTenantId, setSelectedTenantId] = useState<string>("");
    const [cityData, setCityData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"complaints" | "wards" | "officers">("complaints");
    const [complaintSearch, setComplaintSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [inspectComplaint, setInspectComplaint] = useState<any>(null);

    useEffect(() => {
        loadTenants();
    }, []);

    const loadTenants = async () => {
        try {
            const res: any = await superAdminService.getTenants();
            if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
                setTenants(res.data);
                const queryTenant = searchParams.get("tenantId");
                const initial = queryTenant && res.data.some((t: any) => t.id === queryTenant)
                    ? queryTenant
                    : res.data[0].id;
                setSelectedTenantId(initial);
                inspectCity(initial);
            }
        } catch (err) {
            console.error("Failed to load tenants for inspector:", err);
            toast.error("Failed to load municipalities");
            setLoading(false);
        }
    };

    const inspectCity = async (tenantId: string) => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res: any = await superAdminService.inspectCity(tenantId);
            if (res?.success) {
                setCityData(res.data);
            }
        } catch (err) {
            console.error("Failed to inspect city:", err);
            toast.error("Failed to inspect city console");
        } finally {
            setLoading(false);
        }
    };

    const handleTenantChange = (tenantId: string) => {
        setSelectedTenantId(tenantId);
        inspectCity(tenantId);
    };

    const t = cityData?.tenant;
    const stats = cityData?.stats;
    const wards = cityData?.wards || [];
    const officers = cityData?.officers || [];
    const complaints = cityData?.complaints || [];

    const filteredComplaints = complaints.filter((c: any) => {
        const matchStatus = statusFilter === "all" || (c.status || "").toLowerCase() === statusFilter.toLowerCase();
        const q = complaintSearch.toLowerCase();
        const matchSearch = !complaintSearch ||
            (c.title || "").toLowerCase().includes(q) ||
            (c.citizen_name || "").toLowerCase().includes(q) ||
            (c.complaint_number || "").toLowerCase().includes(q) ||
            (c.category || "").toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    return (
        <SuperAdminLayout>
            <div className="space-y-6">
                {/* Header & City Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                            <Eye className="w-4 h-4 text-blue-600" />
                            Read-Only Governance Console
                        </div>
                        <h1 className="text-2xl font-black text-gray-900">
                            City Operational Inspector
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            Cross-departmental oversight & SLA audit without operational interference
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={selectedTenantId}
                            onChange={e => handleTenantChange(e.target.value)}
                            className="px-4 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl focus:ring-2 focus:ring-slate-400 border-0 cursor-pointer shadow-sm min-w-[220px]"
                        >
                            {tenants.map((ten: any) => (
                                <option key={ten.id} value={ten.id} className="bg-white text-gray-900 font-semibold">
                                    {ten.name} ({ten.code})
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => inspectCity(selectedTenantId)}
                            className="p-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 transition-colors shadow-sm"
                            title="Refresh City Inspector"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-gray-100">
                        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <>
                        {/* City KPI Overview */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Grievances</p>
                                <p className="text-3xl font-black text-slate-900 mt-1">{stats?.total ?? 0}</p>
                                <p className="text-xs text-gray-500 mt-1">Logged by citizens & staff</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resolution Rate</p>
                                <p className="text-3xl font-black text-emerald-600 mt-1">{stats?.resolution_rate ?? 0}%</p>
                                <p className="text-xs text-gray-500 mt-1">{stats?.resolved ?? 0} verified resolved</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Backlog</p>
                                <p className="text-3xl font-black text-amber-600 mt-1">{(stats?.in_progress ?? 0) + (stats?.pending ?? 0)}</p>
                                <p className="text-xs text-gray-500 mt-1">{stats?.in_progress ?? 0} in progress</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">SLA Escalated</p>
                                <p className="text-3xl font-black text-rose-600 mt-1">{stats?.escalated ?? 0}</p>
                                <p className="text-xs text-gray-500 mt-1">Breached response timeline</p>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex border-b border-gray-100">
                                {[
                                    { key: "complaints", label: `Live Grievances (${complaints.length})`, icon: FileText },
                                    { key: "wards", label: `Wards & SLA Coverage (${wards.length})`, icon: MapPin },
                                    { key: "officers", label: `Field Workforce (${officers.length})`, icon: Users },
                                ].map(tItem => {
                                    const Icon = tItem.icon;
                                    const active = tab === tItem.key;
                                    return (
                                        <button
                                            key={tItem.key}
                                            onClick={() => setTab(tItem.key as any)}
                                            className={`flex items-center justify-center gap-2 flex-1 py-3.5 text-sm font-bold transition-colors ${
                                                active ? "text-slate-900 border-b-2 border-slate-900 bg-gray-50" : "text-gray-400 hover:text-gray-600"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {tItem.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-5">
                                {/* Tab 1: Read-only Complaints */}
                                {tab === "complaints" && (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    value={complaintSearch}
                                                    onChange={e => setComplaintSearch(e.target.value)}
                                                    placeholder="Search issues by ID, title, citizen, category..."
                                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-300"
                                                />
                                            </div>
                                            <select
                                                value={statusFilter}
                                                onChange={e => setStatusFilter(e.target.value)}
                                                className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white font-semibold"
                                            >
                                                <option value="all">All Statuses</option>
                                                <option value="submitted">Submitted</option>
                                                <option value="assigned">Assigned</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>

                                        {filteredComplaints.length === 0 ? (
                                            <p className="text-center text-gray-400 py-12 text-sm">No complaints match your filter</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-gray-50 border-b border-gray-100">
                                                        <tr>
                                                            {["Ticket #", "Citizen", "Issue Title", "Category", "Priority", "Status", "Inspection"].map(h => (
                                                                <th key={h} className="px-3.5 py-2.5 text-left font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {filteredComplaints.map((c: any) => (
                                                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-3.5 py-3 font-mono font-bold text-slate-800">{c.complaint_number || c.id?.slice(0, 8)}</td>
                                                                <td className="px-3.5 py-3">
                                                                    <p className="font-semibold text-gray-800">{c.citizen_name}</p>
                                                                    <p className="text-gray-400 text-[10px]">{c.citizen_mobile || "—"}</p>
                                                                </td>
                                                                <td className="px-3.5 py-3 max-w-[200px]">
                                                                    <p className="font-bold text-gray-800 truncate">{c.title}</p>
                                                                    <p className="text-gray-400 text-[10px] truncate">{c.description}</p>
                                                                </td>
                                                                <td className="px-3.5 py-3 text-gray-600 whitespace-nowrap">{c.category}</td>
                                                                <td className="px-3.5 py-3 uppercase font-bold text-[10px] text-gray-500">{c.priority}</td>
                                                                <td className="px-3.5 py-3 whitespace-nowrap">
                                                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-600"}`}>
                                                                        {(c.status || "submitted").replace("_", " ")}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3.5 py-3 whitespace-nowrap">
                                                                    <button
                                                                        onClick={() => setInspectComplaint(c)}
                                                                        className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-bold px-2 py-1 rounded hover:bg-gray-100"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5 text-blue-600" /> View Details
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab 2: Wards */}
                                {tab === "wards" && (
                                    <div className="space-y-3">
                                        {wards.length === 0 ? (
                                            <p className="text-center text-gray-400 py-12 text-sm">No wards mapped for this corporation</p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {wards.map((w: any) => {
                                                    const tot = w.totalIssues || 0;
                                                    const res = w.resolved || 0;
                                                    const rate = tot > 0 ? Math.round((res / tot) * 100) : 100;
                                                    return (
                                                        <div key={w.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-mono text-xs font-black bg-white px-2 py-0.5 rounded border border-gray-200 text-slate-800">
                                                                    {w.code || `W-${w.id.slice(0, 4)}`}
                                                                </span>
                                                                <span className={`text-xs font-bold ${rate >= 70 ? "text-emerald-600" : "text-amber-600"}`}>
                                                                    {rate}% Resolved
                                                                </span>
                                                            </div>
                                                            <p className="font-bold text-sm text-gray-900 truncate">{w.name}</p>
                                                            <div className="flex justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200/60">
                                                                <span>Total Issues: <strong>{tot}</strong></span>
                                                                <span>Resolved: <strong>{res}</strong></span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tab 3: Field Officers */}
                                {tab === "officers" && (
                                    <div className="space-y-3">
                                        {officers.length === 0 ? (
                                            <p className="text-center text-gray-400 py-12 text-sm">No field officers registered in this municipality</p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {officers.map((off: any) => (
                                                    <div key={off.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-500 flex items-center justify-center text-white font-bold text-sm">
                                                                {off.fullName?.charAt(0).toUpperCase() || "O"}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-gray-900">{off.fullName}</p>
                                                                <p className="text-xs text-gray-400">{off.email}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5">{off.phone || "—"}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm font-black text-slate-800">{off.activeTasks ?? 0}</span>
                                                            <p className="text-[10px] text-gray-400 font-semibold uppercase">Active Tasks</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Read-Only Complaint Detail Drawer */}
            {inspectComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <div>
                                <span className="font-mono text-xs font-bold text-blue-600">{inspectComplaint.complaint_number}</span>
                                <h3 className="font-black text-gray-900 text-lg">{inspectComplaint.title}</h3>
                            </div>
                            <button onClick={() => setInspectComplaint(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                                <p className="text-gray-400 font-bold uppercase text-[10px]">Description</p>
                                <p className="text-gray-800 text-sm leading-relaxed">{inspectComplaint.description || "No description provided."}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-xl p-2.5">
                                    <p className="text-gray-400 font-bold uppercase text-[10px]">Category</p>
                                    <p className="font-bold text-gray-800">{inspectComplaint.category}</p>
                                    <p className="text-gray-500">{inspectComplaint.sub_category || "—"}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-2.5">
                                    <p className="text-gray-400 font-bold uppercase text-[10px]">Current Status</p>
                                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full font-bold ${STATUS_COLORS[inspectComplaint.status] || "bg-gray-100 text-gray-600"}`}>
                                        {inspectComplaint.status}
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-2.5">
                                    <p className="text-gray-400 font-bold uppercase text-[10px]">Citizen Details</p>
                                    <p className="font-bold text-gray-800">{inspectComplaint.citizen_name}</p>
                                    <p className="text-gray-500">{inspectComplaint.citizen_mobile || "—"}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-2.5">
                                    <p className="text-gray-400 font-bold uppercase text-[10px]">Priority</p>
                                    <p className="font-bold uppercase text-slate-800">{inspectComplaint.priority}</p>
                                </div>
                            </div>

                            {inspectComplaint.latitude && inspectComplaint.longitude && (
                                <div className="bg-blue-50/60 rounded-xl p-3 flex items-center justify-between text-blue-900">
                                    <span className="flex items-center gap-1.5 font-bold">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        GPS Geotag: {inspectComplaint.latitude.toFixed(4)}, {inspectComplaint.longitude.toFixed(4)}
                                    </span>
                                    <a
                                        href={`https://maps.google.com/?q=${inspectComplaint.latitude},${inspectComplaint.longitude}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-bold underline text-xs text-blue-700"
                                    >
                                        Open Map ↗
                                    </a>
                                </div>
                            )}

                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-slate-500 text-[11px]">
                                🔒 <em>Read-Only Governance Inspection: Super Admin cannot alter municipal operational records.</em>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}

export default function SuperAdminCityInspector() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading Inspector...</div>}>
            <InspectorContent />
        </Suspense>
    );
}
