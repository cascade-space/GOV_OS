"use client";
import { useState, useEffect } from "react";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { Search, RefreshCw, KeyRound, Trash2, ToggleLeft, ToggleRight, Mail } from "lucide-react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SuperAdminOfficers() {
    const [officers, setOfficers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [actionId, setActionId] = useState<number|null>(null);
    const [confirmDelete, setConfirmDelete] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem("civicpath_superadmin");
        if (stored) { const u = JSON.parse(stored); setUserEmail(u.email); fetchOfficers(u.email); }
    }, []);

    const fetchOfficers = async (email: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/v1/superadmin/officers`, { headers: {"x-user-email": email} });
            const data = await res.json();
            if (data.success) setOfficers(data.data);
        } catch { toast.error("Failed to load officers"); }
        finally { setLoading(false); }
    };

    const toggleStatus = async (officer: any) => {
        const newStatus = officer.status === "active" ? "inactive" : "active";
        try {
            const res = await fetch(`${API}/api/v1/officers/${officer.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-user-email": userEmail },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setOfficers(prev => prev.map(o => o.id === officer.id ? { ...o, status: newStatus } : o));
                toast.success(`Officer ${newStatus}`);
            }
        } catch { toast.error("Failed to update status"); }
    };

    const deleteOfficer = async (officer: any) => {
        try {
            const res = await fetch(`${API}/api/v1/officers/${officer.id}`, {
                method: "DELETE", headers: { "x-user-email": userEmail }
            });
            const data = await res.json();
            if (data.success) {
                setOfficers(prev => prev.filter(o => o.id !== officer.id));
                toast.success(`Officer ${officer.name} deleted`);
            }
        } catch { toast.error("Failed to delete"); }
        finally { setConfirmDelete(null); }
    };

    const regeneratePassword = async (officer: any) => {
        setActionId(officer.id);
        try {
            const res = await fetch(`${API}/api/v1/officers/${officer.id}/regenerate-password`, {
                method: "POST", headers: { "x-user-email": userEmail }
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`New password: ${data.data.newPassword}`, { duration: 8000 });
            }
        } catch { toast.error("Failed to regenerate"); }
        finally { setActionId(null); }
    };

    const resendCredentials = async (officer: any) => {
        setActionId(officer.id);
        try {
            const res = await fetch(`${API}/api/v1/officers/${officer.id}/resend-credentials`, {
                method: "POST", headers: { "x-user-email": userEmail }
            });
            const data = await res.json();
            toast(data.emailSent ? `Credentials sent to ${officer.email}` : "Email not configured", { icon: data.emailSent ? "✅" : "📋" });
        } catch { toast.error("Failed to resend"); }
        finally { setActionId(null); }
    };

    const filtered = officers.filter(o => {
        if (!search) return true;
        const q = search.toLowerCase();
        return o.name?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q) || o.department?.toLowerCase().includes(q);
    });

    return (
        <SuperAdminLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Officers</h1>
                        <p className="text-gray-500 text-sm mt-0.5">{officers.length} total · {officers.filter(o => o.status === "active").length} active</p>
                    </div>
                    <button onClick={() => fetchOfficers(userEmail)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, email, department..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300 focus:border-transparent" />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-48"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 text-sm">No officers found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {["Officer","Department","MLA","Open Tasks","Status","Last Login","Actions"].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map(o => (
                                        <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white font-black text-xs">{o.name.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 text-xs">{o.name}</p>
                                                        <p className="text-gray-400 text-xs">{o.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{o.department}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{o.mla_name || "—"}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600 text-center">{o.assigned_complaints}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${o.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{o.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                                                {o.last_login ? new Date(o.last_login).toLocaleDateString() : "Never"}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => toggleStatus(o)} title={o.status === "active" ? "Deactivate" : "Activate"}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                        {o.status === "active" ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                                                    </button>
                                                    <button onClick={() => regeneratePassword(o)} disabled={actionId === o.id} title="Regenerate Password"
                                                        className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50">
                                                        <KeyRound className="w-4 h-4 text-purple-600" />
                                                    </button>
                                                    <button onClick={() => resendCredentials(o)} disabled={actionId === o.id} title="Resend Credentials"
                                                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50">
                                                        <Mail className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button onClick={() => setConfirmDelete(o)} title="Delete Officer"
                                                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Delete */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 text-center">Delete Officer?</h3>
                        <p className="text-sm text-gray-500 text-center mt-2 mb-6">
                            <span className="font-semibold text-gray-700">{confirmDelete.name}</span> will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm">Cancel</button>
                            <button onClick={() => deleteOfficer(confirmDelete)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
