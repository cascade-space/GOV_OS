"use client";
import { useState, useEffect } from "react";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { Search, RefreshCw, Shield, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SuperAdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [userEmail, setUserEmail] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("civicpath_superadmin");
        if (stored) { const u = JSON.parse(stored); setUserEmail(u.email); fetchUsers(u.email); }
    }, []);

    const fetchUsers = async (email: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/v1/superadmin/users`, { headers: {"x-user-email": email} });
            const data = await res.json();
            if (data.success) setUsers(data.data);
        } catch { toast.error("Failed to load users"); }
        finally { setLoading(false); }
    };

    const filtered = users.filter(u => {
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        const matchSearch = !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    return (
        <SuperAdminLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Users</h1>
                        <p className="text-gray-500 text-sm mt-0.5">{users.length} total · {users.filter(u => u.role === "admin").length} admins · {users.filter(u => u.role === "mla").length} MLAs</p>
                    </div>
                    <button onClick={() => fetchUsers(userEmail)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or email..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300 focus:border-transparent" />
                    </div>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white min-w-[120px]">
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="mla">MLA</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-3 flex items-center justify-center h-48">
                            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-3 text-center py-16 text-gray-400 text-sm">No users found</div>
                    ) : filtered.map(u => (
                        <div key={u.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-black">{(u.full_name || u.email).charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{u.full_name || "—"}</p>
                                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${u.role === "admin" ? "bg-slate-100 text-slate-700" : "bg-teal-100 text-teal-700"}`}>
                                    {u.role === "admin" ? <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{u.role}</span> : <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{u.role}</span>}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className="text-lg font-black text-gray-900">{u.officer_count || 0}</p>
                                    <p className="text-xs text-gray-400">Officers</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <p className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{u.status}</p>
                                    <p className="text-xs text-gray-400 mt-1">Status</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-3">
                                Joined {new Date(u.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </SuperAdminLayout>
    );
}
