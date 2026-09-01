"use client";
import { useState, useEffect } from "react";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { Plus, MapPin, Users, RefreshCw, ChevronDown, ChevronRight, Trash2, UserCheck, X } from "lucide-react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SuperAdminConstituencies() {
    const [constituencies, setConstituencies] = useState<any[]>([]);
    const [mlaUsers, setMlaUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState("");
    const [expanded, setExpanded] = useState<number | null>(null);
    const [wards, setWards] = useState<Record<number, any[]>>({});
    const [stats, setStats] = useState<Record<number, any>>({});

    // Create constituency modal
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [creating, setCreating] = useState(false);

    // Add ward modal
    const [addWardFor, setAddWardFor] = useState<number | null>(null);
    const [newWard, setNewWard] = useState("");

    // Assign MLA modal
    const [assignMLAFor, setAssignMLAFor] = useState<number | null>(null);
    const [selectedMLA, setSelectedMLA] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("civicpath_superadmin");
        if (stored) {
            const u = JSON.parse(stored);
            setUserEmail(u.email);
            fetchData(u.email);
        }
    }, []);

    const fetchData = async (email: string) => {
        setLoading(true);
        try {
            const headers = { "x-user-email": email };
            const [cRes, uRes] = await Promise.all([
                fetch(`${API}/api/v1/constituencies`, { headers }).then(r => r.json()),
                fetch(`${API}/api/v1/superadmin/users`, { headers }).then(r => r.json()),
            ]);
            if (cRes.success) setConstituencies(cRes.data);
            if (uRes.success) setMlaUsers(uRes.data.filter((u: any) => u.role === "mla"));
        } catch { toast.error("Failed to load data"); }
        finally { setLoading(false); }
    };

    const fetchWards = async (constituencyId: number) => {
        if (wards[constituencyId]) return;
        try {
            const res = await fetch(`${API}/api/v1/constituencies/${constituencyId}/wards`);
            const data = await res.json();
            if (data.success) setWards(prev => ({ ...prev, [constituencyId]: data.data }));
        } catch { toast.error("Failed to load wards"); }
    };

    const fetchStats = async (constituencyId: number) => {
        if (stats[constituencyId]) return;
        try {
            const res = await fetch(`${API}/api/v1/constituencies/${constituencyId}/stats`, {
                headers: { "x-user-email": userEmail }
            });
            const data = await res.json();
            if (data.success) setStats(prev => ({ ...prev, [constituencyId]: data.data }));
        } catch {}
    };

    const toggleExpand = (id: number) => {
        if (expanded === id) { setExpanded(null); return; }
        setExpanded(id);
        fetchWards(id);
        fetchStats(id);
    };

    const createConstituency = async () => {
        if (!newName.trim()) { toast.error("Name is required"); return; }
        setCreating(true);
        try {
            const res = await fetch(`${API}/api/v1/constituencies`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-user-email": userEmail },
                body: JSON.stringify({ name: newName, description: newDesc })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            toast.success(`Constituency "${newName}" created`);
            setShowCreate(false);
            setNewName(""); setNewDesc("");
            fetchData(userEmail);
        } catch (e: any) { toast.error(e.message); }
        finally { setCreating(false); }
    };

    const addWard = async (constituencyId: number) => {
        if (!newWard.trim()) { toast.error("Ward name is required"); return; }
        try {
            const res = await fetch(`${API}/api/v1/constituencies/${constituencyId}/wards`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-user-email": userEmail },
                body: JSON.stringify({ name: newWard })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            toast.success(`Ward "${newWard}" added`);
            setNewWard(""); setAddWardFor(null);
            // Refresh wards for this constituency
            setWards(prev => ({ ...prev, [constituencyId]: undefined as any }));
            fetchWards(constituencyId);
        } catch (e: any) { toast.error(e.message); }
    };

    const removeWard = async (constituencyId: number, wardId: number, wardName: string) => {
        if (!confirm(`Remove ward "${wardName}"?`)) return;
        try {
            const res = await fetch(`${API}/api/v1/constituencies/${constituencyId}/wards/${wardId}`, {
                method: "DELETE",
                headers: { "x-user-email": userEmail }
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            toast.success(`Ward removed`);
            setWards(prev => ({
                ...prev,
                [constituencyId]: prev[constituencyId]?.filter((w: any) => w.id !== wardId)
            }));
        } catch (e: any) { toast.error(e.message); }
    };

    const assignMLA = async (constituencyId: number) => {
        if (!selectedMLA) { toast.error("Select an MLA"); return; }
        try {
            const res = await fetch(`${API}/api/v1/constituencies/${constituencyId}/assign-mla`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-user-email": userEmail },
                body: JSON.stringify({ user_id: selectedMLA })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            toast.success("MLA assigned successfully");
            setAssignMLAFor(null); setSelectedMLA("");
            fetchData(userEmail);
        } catch (e: any) { toast.error(e.message); }
    };

    return (
        <SuperAdminLayout>
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-gray-900">Constituencies</h1>
                        <p className="text-gray-500 text-sm mt-0.5">{constituencies.length} constituencies configured</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => fetchData(userEmail)}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
                        </button>
                        <button onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700">
                            <Plus className="w-4 h-4" />
                            New Constituency
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : constituencies.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                        <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No constituencies yet</p>
                        <p className="text-xs text-gray-400 mt-1">Run the database migration first, then create constituencies here</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {constituencies.map(c => (
                            <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Header row */}
                                <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => toggleExpand(c.id)}>
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900">{c.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{c.description || "No description"}</p>
                                    </div>
                                    <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className="text-center hidden sm:block">
                                            <p className="text-sm font-bold text-gray-800">{c.ward_count}</p>
                                            <p className="text-xs text-gray-400">Wards</p>
                                        </div>
                                        <div className="text-center hidden sm:block">
                                            {c.mla_name ? (
                                                <div>
                                                    <p className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-full">{c.mla_name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">MLA</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-semibold">No MLA</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={e => { e.stopPropagation(); setAssignMLAFor(c.id); }}
                                                className="p-1.5 hover:bg-teal-50 rounded-lg transition-colors" title="Assign MLA">
                                                <UserCheck className="w-4 h-4 text-teal-600" />
                                            </button>
                                            <button onClick={e => { e.stopPropagation(); setAddWardFor(c.id); }}
                                                className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors" title="Add Ward">
                                                <Plus className="w-4 h-4 text-blue-600" />
                                            </button>
                                        </div>
                                        {expanded === c.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                    </div>
                                </div>

                                {/* Expanded content */}
                                {expanded === c.id && (
                                    <div className="border-t border-gray-100 p-5 bg-gray-50">
                                        {/* Stats */}
                                        {stats[c.id] && (
                                            <div className="grid grid-cols-3 gap-3 mb-4">
                                                {[
                                                    { label: "Total Complaints", value: stats[c.id].total },
                                                    { label: "Resolved", value: stats[c.id].resolved },
                                                    { label: "Active Officers", value: stats[c.id].active_officers },
                                                ].map(({ label, value }) => (
                                                    <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm">
                                                        <p className="text-xl font-black text-gray-900">{value || 0}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Wards */}
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Wards</p>
                                            {!wards[c.id] ? (
                                                <p className="text-xs text-gray-400">Loading...</p>
                                            ) : wards[c.id].length === 0 ? (
                                                <p className="text-xs text-gray-400">No wards added yet</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {wards[c.id].map((w: any) => (
                                                        <div key={w.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                                                            {w.name}
                                                            <button onClick={() => removeWard(c.id, w.id, w.name)}
                                                                className="ml-1 text-gray-300 hover:text-red-500 transition-colors">
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Add ward inline */}
                                        {addWardFor === c.id && (
                                            <div className="flex gap-2 mt-3">
                                                <input value={newWard} onChange={e => setNewWard(e.target.value)}
                                                    placeholder="Ward name..."
                                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                                                    onKeyDown={e => e.key === "Enter" && addWard(c.id)} />
                                                <button onClick={() => addWard(c.id)}
                                                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700">
                                                    Add
                                                </button>
                                                <button onClick={() => { setAddWardFor(null); setNewWard(""); }}
                                                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-100">
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Constituency Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-lg font-black text-gray-900 mb-5">Create Constituency</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name *</label>
                                <input value={newName} onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Hubli-Dharwad Central"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)}
                                    placeholder="Brief description..."
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300 focus:border-transparent min-h-[80px]" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => { setShowCreate(false); setNewName(""); setNewDesc(""); }}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm">
                                Cancel
                            </button>
                            <button onClick={createConstituency} disabled={creating}
                                className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl font-semibold text-sm hover:bg-slate-700 disabled:opacity-50">
                                {creating ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign MLA Modal */}
            {assignMLAFor !== null && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-black text-gray-900 mb-2">Assign MLA</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            Assign an MLA to <span className="font-semibold text-gray-700">
                                {constituencies.find(c => c.id === assignMLAFor)?.name}
                            </span>
                        </p>
                        <select value={selectedMLA} onChange={e => setSelectedMLA(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-5 focus:ring-2 focus:ring-slate-300">
                            <option value="">Select MLA user...</option>
                            {mlaUsers.map((u: any) => (
                                <option key={u.id} value={u.id}>{u.full_name || u.email} ({u.email})</option>
                            ))}
                        </select>
                        <div className="flex gap-3">
                            <button onClick={() => { setAssignMLAFor(null); setSelectedMLA(""); }}
                                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold text-sm">
                                Cancel
                            </button>
                            <button onClick={() => assignMLA(assignMLAFor)}
                                className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700">
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
