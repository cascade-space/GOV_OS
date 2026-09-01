"use client";
import { useState, useEffect, useCallback } from "react";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { Search, ChevronLeft, ChevronRight, Eye, RefreshCw, MapPin } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_OPTS = ["all","submitted","validated","assigned","in_progress","resolved","closed","rejected"];
const PRIORITY_OPTS = ["all","low","medium","high","critical"];

const STATUS_COLORS: Record<string,string> = {
    submitted:"bg-blue-100 text-blue-700", validated:"bg-indigo-100 text-indigo-700",
    assigned:"bg-yellow-100 text-yellow-700", in_progress:"bg-orange-100 text-orange-700",
    resolved:"bg-green-100 text-green-700", closed:"bg-gray-100 text-gray-600", rejected:"bg-red-100 text-red-700"
};
const PRIORITY_COLORS: Record<string,string> = {
    low:"bg-gray-100 text-gray-600", medium:"bg-blue-100 text-blue-700",
    high:"bg-orange-100 text-orange-700", critical:"bg-red-100 text-red-700"
};

export default function SuperAdminComplaints() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [userEmail, setUserEmail] = useState("");
    const [updatingId, setUpdatingId] = useState<string|null>(null);
    const PER_PAGE = 15;

    useEffect(() => {
        const stored = localStorage.getItem("civicpath_superadmin");
        if (stored) setUserEmail(JSON.parse(stored).email);
    }, []);

    const fetchComplaints = useCallback(async () => {
        if (!userEmail) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: String(PER_PAGE), offset: String((page-1)*PER_PAGE) });
            if (statusFilter !== "all") params.set("status", statusFilter);
            if (priorityFilter !== "all") params.set("priority", priorityFilter);
            const res = await fetch(`${API}/api/v1/superadmin/complaints?${params}`, { headers: {"x-user-email": userEmail} });
            const data = await res.json();
            if (data.success) { setComplaints(data.data); setTotal(data.total); }
        } catch { toast.error("Failed to load complaints"); }
        finally { setLoading(false); }
    }, [userEmail, page, statusFilter, priorityFilter]);

    useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

    const updateStatus = async (id: string, status: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch(`${API}/api/v1/complaints/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-user-email": userEmail },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (data.success) {
                setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
                toast.success(`Status updated to ${status}`);
            } else throw new Error(data.error);
        } catch (e: any) { toast.error(e.message || "Failed to update"); }
        finally { setUpdatingId(null); }
    };

    const filtered = complaints.filter(c => {
        if (!search) return true;
        const q = search.toLowerCase();
        return c.title?.toLowerCase().includes(q) || c.citizen_name?.toLowerCase().includes(q) || c.complaint_number?.toLowerCase().includes(q);
    });

    const totalPages = Math.ceil(total / PER_PAGE);

    return (
        <SuperAdminLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-gray-900">All Complaints</h1>
                        <p className="text-gray-500 text-sm mt-0.5">{total} total complaints</p>
                    </div>
                    <button onClick={fetchComplaints} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by ID, name, title..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300 focus:border-transparent" />
                    </div>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300 bg-white min-w-[140px]">
                        {STATUS_OPTS.map(s => <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace("_"," ")}</option>)}
                    </select>
                    <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300 bg-white min-w-[130px]">
                        {PRIORITY_OPTS.map(p => <option key={p} value={p}>{p === "all" ? "All Priorities" : p}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">
                            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No complaints found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {["ID","Citizen","Title","Category","Priority","Status","Location","Actions"].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{c.complaint_number || c.id?.slice(0,8)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <p className="font-semibold text-gray-800 text-xs">{c.citizen_name}</p>
                                                <p className="text-gray-400 text-xs">{c.citizen_mobile}</p>
                                            </td>
                                            <td className="px-4 py-3 max-w-[180px]">
                                                <p className="font-semibold text-gray-800 truncate text-xs">{c.title}</p>
                                                <p className="text-gray-400 text-xs truncate">{c.sub_category}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{c.category}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${PRIORITY_COLORS[c.priority] || "bg-gray-100 text-gray-600"}`}>{c.priority}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <select value={c.status} disabled={updatingId === c.id}
                                                    onChange={e => updateStatus(c.id, e.target.value)}
                                                    className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-600"}`}>
                                                    {STATUS_OPTS.filter(s => s !== "all").map(s => (
                                                        <option key={s} value={s}>{s.replace("_"," ")}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {c.latitude && c.longitude ? (
                                                    <a href={`https://maps.google.com/?q=${c.latitude},${c.longitude}`} target="_blank" rel="noreferrer"
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                        <MapPin className="w-3 h-3" /> View
                                                    </a>
                                                ) : <span className="text-xs text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Link href={`/admin/complaints/${c.id}`} target="_blank"
                                                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-semibold">
                                                    <Eye className="w-3.5 h-3.5" /> View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">Page {page} of {totalPages} · {total} total</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SuperAdminLayout>
    );
}
