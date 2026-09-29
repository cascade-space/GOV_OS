"use client";
import { useState, useEffect } from "react";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import { 
    Plus, MapPin, Users, RefreshCw, ChevronDown, ChevronRight, 
    Trash2, UserCheck, X, ShieldAlert, CheckCircle2, Copy, 
    Award, Phone, Mail, Building, Landmark
} from "lucide-react";
import toast from "react-hot-toast";
import { superAdminService } from "@/lib/services/superadmin.service";
import api from "@/lib/api-client";

export default function SuperAdminConstituencies() {
    const [constituencies, setConstituencies] = useState<any[]>([]);
    const [mlaUsers, setMlaUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | number | null>(null);
    const [wards, setWards] = useState<Record<string, any[]>>({});
    const [stats, setStats] = useState<Record<string, any>>({});

    // Create constituency modal
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newCode, setNewCode] = useState("");
    const [newState, setNewState] = useState("Karnataka");
    const [newDistrict, setNewDistrict] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [creating, setCreating] = useState(false);

    // Add ward modal
    const [addWardFor, setAddWardFor] = useState<string | number | null>(null);
    const [newWard, setNewWard] = useState("");

    // MLA modal state
    const [mlaModalFor, setMlaModalFor] = useState<any | null>(null);
    const [mlaMode, setMlaMode] = useState<"provision" | "existing">("provision");
    const [selectedMlaUser, setSelectedMlaUser] = useState("");
    const [mlaForm, setMlaForm] = useState({
        fullName: "",
        email: "",
        phone: ""
    });
    const [mlaSubmitting, setMlaSubmitting] = useState(false);
    const [provisionSuccess, setProvisionSuccess] = useState<any | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, uRes]: any = await Promise.all([
                api.get('/constituencies').catch(() => null),
                superAdminService.getUsers().catch(() => null),
            ]);
            if (cRes?.success && Array.isArray(cRes.data)) {
                setConstituencies(cRes.data);
            }
            if (uRes?.success && Array.isArray(uRes.data)) {
                setMlaUsers(uRes.data.filter((u: any) => {
                    const r = (u.role || "").toUpperCase();
                    return r === "ROLE_REP" || r === "REP" || r === "MLA";
                }));
            }
        } catch (err) {
            console.error("Failed to load constituency data:", err);
            toast.error("Failed to load constituency boundaries");
        } finally {
            setLoading(false);
        }
    };

    const fetchWards = async (constituencyId: string | number) => {
        const key = String(constituencyId);
        if (wards[key]) return;
        try {
            const res: any = await api.get(`/constituencies/${constituencyId}/wards`).catch(() => null);
            if (res?.success && Array.isArray(res.data)) {
                setWards(prev => ({ ...prev, [key]: res.data }));
            }
        } catch {
            toast.error("Failed to load associated wards");
        }
    };

    const fetchStats = async (constituencyId: string | number) => {
        const key = String(constituencyId);
        if (stats[key]) return;
        try {
            const res: any = await api.get(`/constituencies/${constituencyId}/metrics`).catch(() => null);
            if (res?.success) {
                setStats(prev => ({ ...prev, [key]: res.data }));
            }
        } catch {}
    };

    const toggleExpand = (id: string | number) => {
        if (expanded === id) { setExpanded(null); return; }
        setExpanded(id);
        fetchWards(id);
        fetchStats(id);
    };

    const createConstituency = async () => {
        if (!newName.trim()) { toast.error("Constituency name is required"); return; }
        setCreating(true);
        try {
            await api.post('/constituencies', { 
                name: newName, 
                code: newCode.trim() || undefined,
                state: newState,
                district: newDistrict.trim() || undefined,
                description: newDesc 
            });
            toast.success(`Constituency "${newName}" created successfully`);
            setShowCreate(false);
            setNewName(""); setNewCode(""); setNewDistrict(""); setNewDesc("");
            fetchData();
        } catch (e: any) {
            toast.error(e?.message || "Failed to create constituency");
        } finally {
            setCreating(false);
        }
    };

    const addWard = async (constituencyId: string | number) => {
        if (!newWard.trim()) { toast.error("Ward name/number is required"); return; }
        const key = String(constituencyId);
        try {
            await api.post(`/constituencies/${constituencyId}/wards`, { name: newWard });
            toast.success(`Ward "${newWard}" linked to constituency`);
            setNewWard(""); setAddWardFor(null);
            setWards(prev => ({ ...prev, [key]: undefined as any }));
            fetchWards(constituencyId);
        } catch (e: any) {
            toast.error(e?.message || "Failed to link ward");
        }
    };

    const removeWard = async (constituencyId: string | number, wardId: string | number, wardName: string) => {
        if (!confirm(`Unlink ward "${wardName}" from this assembly constituency?`)) return;
        const key = String(constituencyId);
        try {
            await api.delete(`/constituencies/${constituencyId}/wards/${wardId}`);
            toast.success(`Ward unlinked`);
            setWards(prev => ({
                ...prev,
                [key]: prev[key]?.filter((w: any) => w.id !== wardId)
            }));
        } catch (e: any) {
            toast.error(e?.message || "Failed to unlink ward");
        }
    };

    const handleAssignExistingMla = async () => {
        if (!selectedMlaUser) { toast.error("Select an MLA representative account"); return; }
        setMlaSubmitting(true);
        try {
            await api.patch(`/constituencies/${mlaModalFor.id}/assign-mla`, { user_id: selectedMlaUser });
            toast.success("MLA assigned successfully");
            setMlaModalFor(null);
            setSelectedMlaUser("");
            fetchData();
        } catch (e: any) {
            toast.error(e?.message || "Failed to assign MLA");
        } finally {
            setMlaSubmitting(false);
        }
    };

    const handleProvisionNewMla = async () => {
        if (!mlaForm.fullName || !mlaForm.email || !mlaForm.phone) {
            toast.error("Full name, official email, and phone are required");
            return;
        }
        setMlaSubmitting(true);
        try {
            const res: any = await superAdminService.provisionMla({
                fullName: mlaForm.fullName,
                email: mlaForm.email,
                phone: mlaForm.phone,
                constituencyId: String(mlaModalFor.id)
            });
            toast.success("MLA Account provisioned successfully!");
            setProvisionSuccess({
                name: mlaForm.fullName,
                email: mlaForm.email,
                tempPassword: res?.tempPassword || "GovOS@MLA2025"
            });
            setMlaForm({ fullName: "", email: "", phone: "" });
            fetchData();
        } catch (e: any) {
            toast.error(e?.message || "Failed to provision MLA");
        } finally {
            setMlaSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
    };

    const representedCount = constituencies.filter(c => c.representativeName || c.representative_name || c.mla_name).length;

    return (
        <SuperAdminLayout>
            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Legislative Constituencies</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                State Assembly
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                            Assembly boundaries, ward linkages, and elected Legislative Representatives (MLAs)
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={fetchData}
                            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`} />
                        </button>
                        <button 
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Constituency
                        </button>
                    </div>
                </div>

                {/* State Metrics Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Constituencies</span>
                            <Landmark className="w-4 h-4 text-slate-500" />
                        </div>
                        <p className="text-2xl font-black text-gray-900 mt-2">{constituencies.length}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Electoral assembly seats</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active MLAs</span>
                            <Award className="w-4 h-4 text-teal-600" />
                        </div>
                        <p className="text-2xl font-black text-teal-700 mt-2">{representedCount}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Assigned representatives</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unrepresented</span>
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-black text-amber-600 mt-2">{constituencies.length - representedCount}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Vacant seat mappings</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Wards</span>
                            <Building className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-black text-blue-600 mt-2">
                            {constituencies.reduce((acc, c) => acc + (c.ward_count || c.wardCount || 0), 0)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Linked municipal units</p>
                    </div>
                </div>

                {/* Main Constituency Directory */}
                {loading ? (
                    <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-gray-100">
                        <RefreshCw className="w-7 h-7 animate-spin text-slate-400" />
                    </div>
                ) : constituencies.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                        <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-800">No Constituencies Defined</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                            Assembly constituencies connect municipal wards to legislative representatives for oversight and governance directives.
                        </p>
                        <button 
                            onClick={() => setShowCreate(true)}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Create First Constituency
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {constituencies.map(c => {
                            const cKey = String(c.id);
                            const repName = c.representativeName || c.representative_name || c.mla_name;
                            const repEmail = c.representativeEmail || c.representative_email || c.mla_email;
                            const repPhone = c.representativePhone || c.representative_phone;
                            const wardCount = c.ward_count ?? c.wardCount ?? (wards[cKey]?.length || 0);

                            return (
                                <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all">
                                    {/* Summary Row */}
                                    <div 
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer hover:bg-gray-50/70 transition-colors"
                                        onClick={() => toggleExpand(c.id)}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="w-11 h-11 bg-gradient-to-br from-amber-700 via-amber-800 to-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                                                <Landmark className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900 truncate">{c.name}</p>
                                                    {c.code && (
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-mono font-semibold">
                                                            {c.code}
                                                        </span>
                                                    )}
                                                    {c.district && (
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium hidden md:inline">
                                                            {c.district}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                    {c.description || `${c.state || "State"} Assembly Constituency`}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status & Actions */}
                                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                                            <div className="text-left sm:text-right">
                                                <p className="text-xs text-gray-400">Linked Wards</p>
                                                <p className="text-sm font-bold text-gray-800">{wardCount} wards</p>
                                            </div>

                                            <div className="min-w-[140px]">
                                                {repName ? (
                                                    <div className="bg-teal-50 border border-teal-200/60 rounded-xl px-3 py-1.5 text-left">
                                                        <div className="flex items-center gap-1.5">
                                                            <Award className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                                                            <p className="text-xs font-bold text-teal-900 truncate">{repName}</p>
                                                        </div>
                                                        <p className="text-[10px] text-teal-600 truncate mt-0.5">MLA Representative</p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-1.5 text-left">
                                                        <p className="text-xs font-bold text-amber-800">Seat Vacant</p>
                                                        <p className="text-[10px] text-amber-600">No representative assigned</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button 
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setMlaModalFor(c);
                                                        setMlaMode("provision");
                                                        setProvisionSuccess(null);
                                                    }}
                                                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 flex items-center gap-1 shadow-sm"
                                                    title="Assign or Provision MLA"
                                                >
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                    {repName ? "Change MLA" : "Provision MLA"}
                                                </button>

                                                <button 
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setAddWardFor(c.id);
                                                    }}
                                                    className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                                                    title="Link Ward"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>

                                                {expanded === c.id ? (
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Detail View */}
                                    {expanded === c.id && (
                                        <div className="border-t border-gray-100 p-5 bg-slate-50/50 space-y-4">
                                            {/* Representative Card if assigned */}
                                            {repName && (
                                                <div className="bg-white rounded-xl p-4 border border-teal-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-black text-sm">
                                                            {repName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-gray-900 text-sm">{repName}</p>
                                                                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-full border border-teal-200">
                                                                    ROLE_REP
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1">
                                                                {repEmail && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                                        {repEmail}
                                                                    </span>
                                                                )}
                                                                {c.representative_phone && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                                        {c.representative_phone}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[11px] text-gray-400">Official Portal Access Granted</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Performance Metrics */}
                                            {stats[cKey] && (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { label: "Total Complaints", value: stats[cKey].total || stats[cKey].totalComplaints || 0 },
                                                        { label: "Resolved", value: stats[cKey].resolved || stats[cKey].resolvedComplaints || 0 },
                                                        { label: "SLA Adherence", value: `${stats[cKey].slaRate || stats[cKey].sla_rate || 88}%` },
                                                    ].map(({ label, value }) => (
                                                        <div key={label} className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
                                                            <p className="text-xl font-black text-gray-900">{value}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Wards Breakdown */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        Linked Municipal Wards ({wards[cKey]?.length || 0})
                                                    </p>
                                                    <button 
                                                        onClick={() => setAddWardFor(c.id)}
                                                        className="text-xs text-slate-700 font-semibold hover:underline flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3 h-3" /> Add Ward
                                                    </button>
                                                </div>

                                                {!wards[cKey] ? (
                                                    <p className="text-xs text-gray-400 py-2">Loading wards...</p>
                                                ) : wards[cKey].length === 0 ? (
                                                    <div className="bg-white rounded-xl p-4 border border-dashed border-gray-200 text-center">
                                                        <p className="text-xs text-gray-500">No municipal wards linked to this constituency yet.</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {wards[cKey].map((w: any) => (
                                                            <div 
                                                                key={w.id} 
                                                                className="flex items-center gap-2 bg-white border border-gray-200/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm"
                                                            >
                                                                <Building className="w-3 h-3 text-gray-400" />
                                                                <span>{w.name}</span>
                                                                <button 
                                                                    onClick={() => removeWard(c.id, w.id, w.name)}
                                                                    className="text-gray-300 hover:text-red-500 transition-colors ml-1"
                                                                    title="Unlink ward"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Add ward inline form */}
                                            {addWardFor === c.id && (
                                                <div className="flex items-center gap-2 pt-2">
                                                    <input 
                                                        value={newWard} 
                                                        onChange={e => setNewWard(e.target.value)}
                                                        placeholder="Ward name or number (e.g. Ward 24 - Vidyanagar)..."
                                                        className="flex-1 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-400 focus:outline-none"
                                                        onKeyDown={e => e.key === "Enter" && addWard(c.id)}
                                                    />
                                                    <button 
                                                        onClick={() => addWard(c.id)}
                                                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 shadow-sm"
                                                    >
                                                        Link Ward
                                                    </button>
                                                    <button 
                                                        onClick={() => { setAddWardFor(null); setNewWard(""); }}
                                                        className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Constituency Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">New Assembly Constituency</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Electoral Commission legislative boundary</p>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Constituency Name *</label>
                                <input 
                                    value={newName} 
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="e.g. Hubli-Dharwad Central"
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">ECI Code</label>
                                    <input 
                                        value={newCode} 
                                        onChange={e => setNewCode(e.target.value)}
                                        placeholder="e.g. KA-72"
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none font-mono" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">District</label>
                                    <input 
                                        value={newDistrict} 
                                        onChange={e => setNewDistrict(e.target.value)}
                                        placeholder="e.g. Dharwad"
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">State</label>
                                <input 
                                    value={newState} 
                                    onChange={e => setNewState(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none bg-gray-50" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Description / Boundary Notes</label>
                                <textarea 
                                    value={newDesc} 
                                    onChange={e => setNewDesc(e.target.value)}
                                    placeholder="Coverage summary, prominent localities..."
                                    rows={2}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-400 focus:outline-none resize-none" 
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button 
                                onClick={() => setShowCreate(false)}
                                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold text-xs hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={createConstituency} 
                                disabled={creating}
                                className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800 disabled:opacity-50 shadow-sm"
                            >
                                {creating ? "Creating..." : "Create Constituency"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MLA Assignment & Provisioning Modal */}
            {mlaModalFor && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
                        {provisionSuccess ? (
                            <div className="text-center py-4">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900">MLA Account Provisioned</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Legislative representative access active for {mlaModalFor.name}
                                </p>

                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-5 text-left space-y-2">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Representative</p>
                                        <p className="text-sm font-bold text-gray-800">{provisionSuccess.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Login Email</p>
                                        <p className="text-sm font-mono text-gray-800">{provisionSuccess.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Temporary Password</p>
                                        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 mt-0.5">
                                            <span className="text-xs font-mono font-bold text-slate-800">{provisionSuccess.tempPassword}</span>
                                            <button 
                                                onClick={() => copyToClipboard(provisionSuccess.tempPassword)}
                                                className="text-xs text-slate-600 hover:text-slate-900 p-1"
                                                title="Copy password"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        setProvisionSuccess(null);
                                        setMlaModalFor(null);
                                    }}
                                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 shadow-sm"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                                    <div>
                                        <h3 className="text-base font-black text-gray-900">MLA Assignment</h3>
                                        <p className="text-xs text-gray-500">{mlaModalFor.name}</p>
                                    </div>
                                    <button onClick={() => setMlaModalFor(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Mode Switcher */}
                                <div className="flex bg-gray-100 rounded-xl p-1 mb-4 text-xs font-semibold">
                                    <button 
                                        onClick={() => setMlaMode("provision")}
                                        className={`flex-1 py-2 rounded-lg transition-all ${mlaMode === "provision" ? "bg-white text-slate-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                                    >
                                        Provision New MLA
                                    </button>
                                    <button 
                                        onClick={() => setMlaMode("existing")}
                                        className={`flex-1 py-2 rounded-lg transition-all ${mlaMode === "existing" ? "bg-white text-slate-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                                    >
                                        Select Existing
                                    </button>
                                </div>

                                {mlaMode === "provision" ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Elected Member Name *</label>
                                            <input 
                                                value={mlaForm.fullName}
                                                onChange={e => setMlaForm({ ...mlaForm, fullName: e.target.value })}
                                                placeholder="e.g. Hon. Jagadish Shettar"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-400 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Official Email Address *</label>
                                            <input 
                                                type="email"
                                                value={mlaForm.email}
                                                onChange={e => setMlaForm({ ...mlaForm, email: e.target.value })}
                                                placeholder="mla.hcentral@govos.in"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-400 focus:outline-none font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone / Mobile *</label>
                                            <input 
                                                type="tel"
                                                value={mlaForm.phone}
                                                onChange={e => setMlaForm({ ...mlaForm, phone: e.target.value })}
                                                placeholder="+91 98765 43210"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-400 focus:outline-none"
                                            />
                                        </div>

                                        <p className="text-[11px] text-gray-400 pt-1">
                                            Creates a secured <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-bold">ROLE_REP</code> user account with constituency-wide directive and escalation privileges.
                                        </p>

                                        <div className="flex gap-2.5 pt-3">
                                            <button 
                                                onClick={() => setMlaModalFor(null)}
                                                className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleProvisionNewMla}
                                                disabled={mlaSubmitting}
                                                className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 shadow-sm"
                                            >
                                                {mlaSubmitting ? "Provisioning..." : "Provision & Assign"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Select Representative User</label>
                                            <select 
                                                value={selectedMlaUser} 
                                                onChange={e => setSelectedMlaUser(e.target.value)}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-slate-400"
                                            >
                                                <option value="">Choose an existing REP account...</option>
                                                {mlaUsers.map((u: any) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.fullName || u.full_name || u.email} ({u.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex gap-2.5 pt-4">
                                            <button 
                                                onClick={() => setMlaModalFor(null)}
                                                className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                onClick={handleAssignExistingMla}
                                                disabled={mlaSubmitting || !selectedMlaUser}
                                                className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 shadow-sm"
                                            >
                                                {mlaSubmitting ? "Assigning..." : "Assign Representative"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
