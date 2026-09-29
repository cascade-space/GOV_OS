"use client";
import { useState, useEffect } from "react";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { Search, RefreshCw, Shield, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { superAdminService } from "@/lib/services/superadmin.service";

export default function SuperAdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res: any = await superAdminService.getUsers();
            if (res?.success && Array.isArray(res.data)) {
                setUsers(res.data);
            }
        } catch (err) {
            console.error("Failed to load users:", err);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const normalizeRole = (role: string = "") => {
        const r = role.toLowerCase();
        if (r.includes("admin")) return "admin";
        if (r === "mla" || r === "rep") return "mla";
        if (r === "officer") return "officer";
        return r;
    };

    const filtered = users.filter(u => {
        const userNormRole = normalizeRole(u.role);
        const matchRole = roleFilter === "all" || userNormRole === roleFilter;
        const name = u.fullName || u.full_name || "";
        const email = u.email || "";
        const matchSearch = !search ||
            email.toLowerCase().includes(search.toLowerCase()) ||
            name.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    const adminCount = users.filter(u => normalizeRole(u.role) === "admin").length;
    const mlaCount = users.filter(u => normalizeRole(u.role) === "mla").length;

    return (
        <SuperAdminLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Users</h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {users.length} total · {adminCount} admins · {mlaCount} MLAs
                        </p>
                    </div>
                    <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">
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
                        <option value="officer">Officer</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-3 flex items-center justify-center h-48">
                            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-3 text-center py-16 text-gray-400 text-sm">No users found</div>
                    ) : filtered.map(u => {
                        const name = u.fullName || u.full_name || "—";
                        const email = u.email || "";
                        const role = u.role || "USER";
                        const normRole = normalizeRole(role);
                        const createdAt = u.createdAt || u.created_at;
                        return (
                            <div key={u.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-black">{(name !== "—" ? name : email).charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{name}</p>
                                        <p className="text-xs text-gray-400 truncate">{email}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                                        normRole === "admin" ? "bg-slate-100 text-slate-700" :
                                        normRole === "mla" ? "bg-teal-100 text-teal-700" :
                                        "bg-blue-100 text-blue-700"
                                    }`}>
                                        <span className="flex items-center gap-1">
                                            {normRole === "admin" ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                            {role}
                                        </span>
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-lg font-black text-gray-900">{u.assignedTasks || u.officer_count || 0}</p>
                                        <p className="text-xs text-gray-400">Assigned</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                                            u.status === "inactive" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                                        }`}>
                                            {u.status || "active"}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">Status</p>
                                    </div>
                                </div>
                                {createdAt && (
                                    <p className="text-xs text-gray-400 mt-3">
                                        Joined {new Date(createdAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </SuperAdminLayout>
    );
}
