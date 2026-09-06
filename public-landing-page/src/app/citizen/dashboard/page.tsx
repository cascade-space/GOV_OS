"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    PlusCircle, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Building2, 
    MapPin, 
    Search, 
    ChevronRight, 
    ShieldCheck, 
    Calendar, 
    Filter, 
    Loader2, 
    RefreshCw, 
    X,
    FileText,
    ArrowUpRight,
    LogIn
} from "lucide-react";
import { useLogin } from "@/contexts/LoginContext";
import api from "@/lib/api-client";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { CitizenLoginModal } from "@/components/layout/CitizenLoginModal";

interface PublicComplaint {
    complaintNumber: string;
    status: string;
    category?: string;
    priority?: string;
    assignedDepartment?: string;
    locationAddress?: string;
    createdAt?: string;
    updatedAt?: string;
    title?: string;
    description?: string;
}

export default function CitizenDashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useLogin();
    const [complaints, setComplaints] = useState<PublicComplaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedComplaint, setSelectedComplaint] = useState<PublicComplaint | null>(null);
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    const fetchMyComplaints = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("civicpath_token");
            const res = await api.get("/public/complaints/my", {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined
            }) as PublicComplaint[];

            if (Array.isArray(res)) {
                setComplaints(res);
            } else {
                setComplaints([]);
            }
        } catch (err) {
            console.warn("Could not fetch citizen complaints from backend, checking fallback:", err);
            // Fallback for demonstration if offline
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                fetchMyComplaints();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    // Computed Stats
    const totalCount = complaints.length;
    const resolvedCount = complaints.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length;
    const inProgressCount = complaints.filter(c => c.status === "IN_PROGRESS" || c.status === "ASSIGNED" || c.status === "INVESTIGATING").length;
    const newCount = complaints.filter(c => c.status === "NEW" || c.status === "SUBMITTED").length;

    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = (c.complaintNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.locationAddress?.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (statusFilter === "ALL") return matchesSearch;
        if (statusFilter === "RESOLVED") return matchesSearch && (c.status === "RESOLVED" || c.status === "CLOSED");
        if (statusFilter === "IN_PROGRESS") return matchesSearch && (c.status === "IN_PROGRESS" || c.status === "ASSIGNED" || c.status === "INVESTIGATING");
        if (statusFilter === "NEW") return matchesSearch && (c.status === "NEW" || c.status === "SUBMITTED");
        return matchesSearch;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "RESOLVED":
            case "CLOSED":
                return {
                    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    label: "Resolved",
                    icon: CheckCircle2
                };
            case "IN_PROGRESS":
            case "ASSIGNED":
            case "INVESTIGATING":
                return {
                    bg: "bg-amber-50 text-amber-700 border-amber-200",
                    label: "In Progress",
                    icon: Clock
                };
            default:
                return {
                    bg: "bg-blue-50 text-blue-700 border-blue-200",
                    label: "Under Review",
                    icon: AlertCircle
                };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <PublicNavbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Auth Check Prompt if Not Logged In */}
                {!authLoading && !user && (
                    <div className="max-w-xl mx-auto my-12 bg-white rounded-3xl p-8 sm:p-10 border border-gray-200 text-center shadow-xl shadow-gray-200/40">
                        <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Citizen Sign In Required</h2>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            Sign in with your mobile number to view and track all complaints filed by you across your constituency.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                onClick={() => setLoginModalOpen(true)}
                                className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Sign In via Mobile OTP</span>
                            </button>
                            <Link
                                href="/citizen/track"
                                className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition text-center"
                            >
                                Track by Complaint ID
                            </Link>
                        </div>
                    </div>
                )}

                {/* Logged-in Content */}
                {!authLoading && user && (
                    <div className="space-y-8">
                        {/* Hero Welcome Banner */}
                        <div className="bg-gradient-to-r from-green-700 via-green-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-green-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                            <div className="relative z-10 space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-green-200 text-xs font-semibold border border-white/10">
                                    <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                                    <span>Verified Citizen Account</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                    Welcome, {user.fullName || "Citizen"}
                                </h1>
                                <p className="text-green-100/80 text-sm max-w-xl">
                                    Manage your civic complaints, check real-time resolution SLA status, and communicate directly with assigned ward officers.
                                </p>
                                <div className="text-xs text-green-200 font-mono pt-1">
                                    Registered Mobile: <strong className="text-white">{user.phone}</strong>
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-wrap items-center gap-3">
                                <Link
                                    href={`/citizen/report?mobile=${encodeURIComponent(user.phone || '')}&name=${encodeURIComponent(user.fullName || '')}`}
                                    className="px-5 py-3 rounded-2xl bg-white text-green-800 font-bold text-sm shadow-md hover:bg-green-50 transition flex items-center gap-2 cursor-pointer"
                                >
                                    <PlusCircle className="w-4 h-4 text-green-600" />
                                    <span>Report New Issue</span>
                                </Link>
                                <button
                                    onClick={fetchMyComplaints}
                                    className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                                    title="Refresh complaints"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* KPI Cards Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Filed</span>
                                    <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{totalCount}</div>
                                <p className="text-[11px] text-gray-400 mt-1">Total public grievance reports</p>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600">In Progress</span>
                                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">{inProgressCount}</div>
                                <p className="text-[11px] text-gray-400 mt-1">Field officer assigned & working</p>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Resolved</span>
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">{resolvedCount}</div>
                                <p className="text-[11px] text-gray-400 mt-1">Successfully closed on-ground</p>
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Under Review</span>
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-2">{newCount}</div>
                                <p className="text-[11px] text-gray-400 mt-1">Awaiting triage & assignment</p>
                            </div>
                        </div>

                        {/* Search and Filters Bar */}
                        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Search */}
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by ID, title, or address..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-hidden transition"
                                />
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                                {[
                                    { id: "ALL", label: "All Complaints" },
                                    { id: "IN_PROGRESS", label: "In Progress" },
                                    { id: "RESOLVED", label: "Resolved" },
                                    { id: "NEW", label: "New" }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setStatusFilter(tab.id)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                                            statusFilter === tab.id
                                                ? "bg-green-600 text-white shadow-xs"
                                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Complaints Cards Section */}
                        {loading ? (
                            <div className="py-16 text-center">
                                <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-500">Loading your complaint records...</p>
                            </div>
                        ) : filteredComplaints.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center shadow-xs">
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <h3 className="text-base font-bold text-gray-800 mb-1">No complaints found</h3>
                                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                                    {searchTerm || statusFilter !== "ALL" 
                                        ? "No matching records found for current filters." 
                                        : "You have not submitted any complaints under this mobile number yet."}
                                </p>
                                <Link
                                    href={`/citizen/report?mobile=${encodeURIComponent(user.phone || '')}&name=${encodeURIComponent(user.fullName || '')}`}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    <span>File Your First Complaint</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredComplaints.map((c) => {
                                    const badge = getStatusBadge(c.status);
                                    const BadgeIcon = badge.icon;
                                    return (
                                        <div
                                            key={c.complaintNumber}
                                            onClick={() => setSelectedComplaint(c)}
                                            className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-green-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group"
                                        >
                                            <div className="space-y-3">
                                                {/* Card Header: Number & Badge */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
                                                        {c.complaintNumber}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                                                        <BadgeIcon className="w-3 h-3" />
                                                        <span>{badge.label}</span>
                                                    </span>
                                                </div>

                                                {/* Title & Description */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-green-700 transition">
                                                        {c.title || `Issue in ${c.category || 'Constituency'}`}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                                                        {c.description || "No description provided."}
                                                    </p>
                                                </div>

                                                {/* Category & Location */}
                                                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span className="font-medium text-gray-700 truncate">
                                                            {c.category || "General Civic Issue"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span className="text-gray-500 truncate">
                                                            {c.locationAddress || "Ward Area"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Footer */}
                                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "Recent"}</span>
                                                </div>
                                                <div className="text-green-600 font-bold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                                                    <span>Details</span>
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Complaint Detail Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedComplaint(null)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div>
                                <span className="font-mono text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">
                                    {selectedComplaint.complaintNumber}
                                </span>
                                <h3 className="text-base font-bold text-gray-900 mt-2">
                                    {selectedComplaint.title || "Complaint Overview"}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedComplaint(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div>
                                <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Description</span>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-xl leading-relaxed">
                                    {selectedComplaint.description || "No full description available."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Category</span>
                                    <span className="font-semibold text-gray-800">{selectedComplaint.category || "General"}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-xl">
                                    <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Priority</span>
                                    <span className="font-semibold text-gray-800">{selectedComplaint.priority || "MEDIUM"}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-xl">
                                <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Location Address</span>
                                <p className="font-semibold text-gray-800 flex items-start gap-1.5">
                                    <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                    <span>{selectedComplaint.locationAddress || "Ward Area"}</span>
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-xl">
                                <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Assigned Department</span>
                                <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-green-600" />
                                    <span>{selectedComplaint.assignedDepartment || "Triage in progress"}</span>
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-3">
                            <Link
                                href={`/citizen/track?id=${selectedComplaint.complaintNumber}`}
                                className="w-full py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm text-center flex items-center justify-center gap-1.5 transition"
                            >
                                <span>Open Full Public Tracking Page</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Citizen Login Modal */}
            <CitizenLoginModal
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
            />

            <PublicFooter />
        </div>
    );
}
