"use client";
import { useState, useEffect } from "react";
import SuperAdminLayout from "@/components/superadmin/SuperAdminLayout";
import {
    Landmark, Plus, Search, RefreshCw, KeyRound,
    ToggleLeft, ToggleRight, ExternalLink, ShieldCheck, Mail, Phone, MapPin, Building2, Eye
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { superAdminService } from "@/lib/services/superadmin.service";

export default function SuperAdminTenants() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showOnboardModal, setShowOnboardModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Onboard Form State
    const [form, setForm] = useState({
        name: "",
        code: "",
        subdomain: "",
        state: "Karnataka",
        logoUrl: "",
        primaryColor: "#1B4FD8",
        adminName: "",
        adminEmail: "",
        adminPhone: "",
        adminPassword: "Admin@123",
    });

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        setLoading(true);
        try {
            const res: any = await superAdminService.getTenants();
            if (res?.success && Array.isArray(res.data)) {
                setTenants(res.data);
            }
        } catch (err) {
            console.error("Failed to load tenants:", err);
            toast.error("Failed to load municipal tenants");
        } finally {
            setLoading(false);
        }
    };

    const handleOnboardSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.code || !form.subdomain || !form.adminEmail) {
            toast.error("Please fill all required fields");
            return;
        }

        setActionLoading(true);
        try {
            const res: any = await superAdminService.onboardTenant(form);
            if (res?.success) {
                toast.success(`Municipality "${form.name}" onboarded successfully!`);
                setShowOnboardModal(false);
                setForm({
                    name: "",
                    code: "",
                    subdomain: "",
                    state: "Karnataka",
                    logoUrl: "",
                    primaryColor: "#1B4FD8",
                    adminName: "",
                    adminEmail: "",
                    adminPhone: "",
                    adminPassword: "Admin@123",
                });
                fetchTenants();
            } else {
                toast.error(res?.error || "Failed to onboard municipality");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.error || err?.message || "Failed to onboard municipality");
        } finally {
            setActionLoading(false);
        }
    };

    const toggleTenantActive = async (tenant: any) => {
        const newStatus = !tenant.active;
        try {
            const res: any = await superAdminService.updateTenantStatus(tenant.id, newStatus);
            if (res?.success) {
                setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, active: newStatus } : t));
                toast.success(`${tenant.name} ${newStatus ? "Activated" : "Suspended"}`);
            }
        } catch {
            toast.error("Failed to update status");
        }
    };

    const resetCommissionerPassword = async (tenant: any) => {
        try {
            const res: any = await superAdminService.resetCommissionerPassword(tenant.id);
            if (res?.success && res.newPassword) {
                toast.success(`Commissioner Password: ${res.newPassword} (Dispatched to ${res.email})`, { duration: 9000 });
            } else {
                toast.success("Password reset instructions dispatched", { duration: 6000 });
            }
        } catch {
            toast.error("Failed to reset password");
        }
    };

    const filtered = tenants.filter(t => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (t.name || "").toLowerCase().includes(q) ||
            (t.code || "").toLowerCase().includes(q) ||
            (t.state || "").toLowerCase().includes(q) ||
            (t.commissionerName || "").toLowerCase().includes(q) ||
            (t.subdomain || "").toLowerCase().includes(q)
        );
    });

    const activeCount = tenants.filter(t => t.active).length;

    return (
        <SuperAdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
                            <Landmark className="w-7 h-7 text-slate-800" />
                            Municipal Corporations & ULBs
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            Multi-Tenant Urban Local Bodies Directory · Platform Jurisdiction
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchTenants} className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                        <button onClick={() => setShowOnboardModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm">
                            <Plus className="w-4 h-4" />
                            Onboard Municipality
                        </button>
                    </div>
                </div>

                {/* KPI Metrics Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Corporations</p>
                        <p className="text-3xl font-black text-slate-900 mt-1">{tenants.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Onboarded local bodies</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Status</p>
                        <p className="text-3xl font-black text-emerald-600 mt-1">{activeCount}</p>
                        <p className="text-xs text-gray-500 mt-1">{tenants.length - activeCount} suspended</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jurisdictions</p>
                        <p className="text-3xl font-black text-indigo-600 mt-1">
                            {new Set(tenants.map(t => t.state).filter(Boolean)).size || 1}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">States / Territories</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Grievances</p>
                        <p className="text-3xl font-black text-blue-600 mt-1">
                            {tenants.reduce((acc, t) => acc + (t.complaintsCount || 0), 0)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Across all municipalities</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search municipality by name, code (e.g. HDMC, BBMP), state, or commissioner..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Municipalities Grid/Table */}
                {loading ? (
                    <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-gray-100">
                        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                        <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-gray-800">No municipalities found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try another search query or onboard a new municipality.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filtered.map(t => (
                            <div key={t.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm flex-shrink-0"
                                            style={{ backgroundColor: t.primaryColor || "#1B4FD8" }}
                                        >
                                            {t.code ? t.code.slice(0, 2) : "MC"}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-gray-900 text-base leading-snug">{t.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                                                    {t.code}
                                                </span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    {t.state || "Karnataka"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                                        t.active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                                    }`}>
                                        {t.active ? "ACTIVE" : "SUSPENDED"}
                                    </span>
                                </div>

                                {/* Commissioner Details Box */}
                                <div className="bg-gray-50 rounded-xl p-3.5 mb-4 border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Municipal Commissioner (Tenant Admin)</p>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-gray-800 font-semibold">
                                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                                            {t.commissionerName || "Municipal Commissioner"}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                                            {t.commissionerEmail || `admin@${t.subdomain}.govos.in`}
                                        </div>
                                        {t.commissionerPhone && (
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                {t.commissionerPhone}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Metrics Summary */}
                                <div className="grid grid-cols-2 gap-3 mb-5 text-center">
                                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                        <p className="text-xs text-gray-400">Total Grievances</p>
                                        <p className="text-lg font-black text-slate-800">{t.complaintsCount ?? 0}</p>
                                    </div>
                                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                        <p className="text-xs text-gray-400">Subdomain Portal</p>
                                        <p className="text-xs font-mono font-bold text-blue-700 truncate">{t.subdomain}.govos.in</p>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                                    <Link
                                        href={`/superadmin/inspector?tenantId=${t.id}`}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Inspect City Console
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => resetCommissionerPassword(t)}
                                            title="Reset Commissioner Password"
                                            className="flex items-center gap-1 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                                        >
                                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                                            Reset Password
                                        </button>
                                        <button
                                            onClick={() => toggleTenantActive(t)}
                                            title={t.active ? "Suspend Municipality" : "Activate Municipality"}
                                            className={`p-2 rounded-xl border transition-colors ${
                                                t.active
                                                    ? "border-red-200 text-red-600 hover:bg-red-50"
                                                    : "border-green-200 text-green-700 hover:bg-green-50"
                                            }`}
                                        >
                                            {t.active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Onboard Municipality Wizard Modal */}
            {showOnboardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-7 max-w-xl w-full shadow-2xl my-8">
                        <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Onboard Municipal Corporation</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Provisions tenant context and primary Commissioner account</p>
                            </div>
                            <button
                                onClick={() => setShowOnboardModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleOnboardSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Corporation / ULB Name *
                                    </label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Belagavi Municipal Corporation"
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        ULB Code * (Unique)
                                    </label>
                                    <input
                                        required
                                        value={form.code}
                                        onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. BMC"
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm uppercase font-mono focus:ring-2 focus:ring-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Subdomain * (.govos.in)
                                    </label>
                                    <input
                                        required
                                        value={form.subdomain}
                                        onChange={e => setForm({ ...form, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                                        placeholder="e.g. belagavi"
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        State / Territory *
                                    </label>
                                    <input
                                        required
                                        value={form.state}
                                        onChange={e => setForm({ ...form, state: e.target.value })}
                                        placeholder="e.g. Karnataka"
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Brand Color
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            value={form.primaryColor}
                                            onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                                            className="w-10 h-10 border border-gray-200 rounded-xl p-1 cursor-pointer"
                                        />
                                        <input
                                            value={form.primaryColor}
                                            onChange={e => setForm({ ...form, primaryColor: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Commissioner Provisioning */}
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                    Municipal Commissioner Credentials (Tenant Admin)
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Commissioner Full Name</label>
                                        <input
                                            value={form.adminName}
                                            onChange={e => setForm({ ...form, adminName: e.target.value })}
                                            placeholder="e.g. Shri Rahul Sharma, IAS"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Official Email *</label>
                                        <input
                                            required
                                            type="email"
                                            value={form.adminEmail}
                                            onChange={e => setForm({ ...form, adminEmail: e.target.value })}
                                            placeholder="e.g. commissioner@belagavi.gov.in"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Official Phone</label>
                                        <input
                                            value={form.adminPhone}
                                            onChange={e => setForm({ ...form, adminPhone: e.target.value })}
                                            placeholder="e.g. +919876543210"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Initial Password</label>
                                        <input
                                            value={form.adminPassword}
                                            onChange={e => setForm({ ...form, adminPassword: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-slate-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-5 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowOnboardModal(false)}
                                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    {actionLoading ? "Provisioning..." : "Onboard Municipality"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}
