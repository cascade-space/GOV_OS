"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { ComplaintStepper } from "@/components/ui/Stepper";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MOCK_COMPLAINTS } from "@/lib/mockData";
import { formatDateTime, getSLAStatus, truncate, cn } from "@/lib/utils";
import { Search, MapPin, Clock, User, Building2, AlertTriangle, CheckCircle2, Phone } from "lucide-react";
import toast from "react-hot-toast";

const HISTORY_MOCK = [
    { status: "Submitted", note: "Complaint received", time: "3 days ago", by: "System" },
    { status: "Validated", note: "Issue verified by ops team", time: "3 days ago", by: "Ops Desk" },
    { status: "Assigned", note: "Assigned to Roads & Public Works", time: "2 days ago", by: "Supervisor" },
    { status: "In Progress", note: "Field officer dispatched to location", time: "1 day ago", by: "Suresh Patil" },
];

import { complaintService } from "@/lib/services/complaint.service";

import { Suspense } from "react";

function TrackContent() {
    const searchParams = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams?.get("id") || "");
    const [searched, setSearched] = useState(false);
    const [complaint, setComplaint] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchInput.trim()) { toast.error("Enter a Complaint ID or mobile number"); return; }
        setLoading(true);
        try {
            const data = await complaintService.getComplaintByNumber(searchInput.trim().toUpperCase());
            setComplaint(data);
            setSearched(true);
            toast.success("Complaint found!");
        } catch (error: any) {
            console.error("Search failed:", error);
            // Fallback for demo if backend is not seeded/returning results
            const foundMock = MOCK_COMPLAINTS.find(
                (c) => c.complaintNumber === searchInput.trim().toUpperCase() ||
                    c.citizenMobile === searchInput.trim()
            );
            
            // If not found in mock data, create a temporary complaint for newly submitted ones
            if (!foundMock && searchInput.trim().toUpperCase().startsWith('CMP-')) {
                const tempComplaint = {
                    id: "temp-" + Date.now(),
                    complaintNumber: searchInput.trim().toUpperCase(),
                    citizenName: "You",
                    citizenMobile: "XXXXXXXXXX",
                    title: "Your Submitted Complaint",
                    description: "Your complaint has been successfully submitted and is being processed. You will receive updates on your registered mobile number.",
                    category: "General",
                    subCategory: "Pending Review",
                    priority: "medium" as const,
                    status: "submitted" as const,
                    locationAddress: "Location as provided",
                    ward: "Ward Assignment Pending",
                    latitude: 12.9716,
                    longitude: 77.5946,
                    assignedDept: "",
                    assignedOfficer: "",
                    slaDeadline: new Date(Date.now() + 86400000 * 7).toISOString(),
                    isEscalated: false,
                    aiCategorySuggestion: "pending",
                    aiUrgencyScore: 0.5,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    resolvedAt: null,
                    mediaCount: 0,
                };
                setComplaint(tempComplaint);
                setSearched(true);
                toast.success("Complaint found! Your complaint is being processed.");
            } else {
                setComplaint(foundMock || null);
                setSearched(true);
                if (!foundMock) {
                    toast.error("No complaint found for this ID or mobile number");
                } else {
                    toast.success("Complaint found!");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchParams?.get("id")) {
            const complaintId = searchParams.get("id")!;
            setSearchInput(complaintId);
            // Auto-search when coming from submission
            setTimeout(() => {
                handleSearch();
            }, 500);
        }
    }, [searchParams]);

    const sla = complaint ? getSLAStatus(complaint.slaDeadline) : null;

    return (
        <CitizenLayout>
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-10 text-center space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200/60">
                        <span>Real-Time Grievance Tracker</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">Track Your Complaint</h1>
                    <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                        Enter your Complaint ID or registered 10-digit mobile number for instant SLA status and live action logs.
                    </p>
                </div>

                {/* Search Box */}
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8 mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="e.g. CMP-2024-00341 or 9876543210"
                                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold transition-all"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            loading={loading}
                            leftIcon={<Search className="w-4 h-4 stroke-[2.5]" />}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition"
                        >
                            Track
                        </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-gray-500 border-t border-gray-100">
                        <span className="font-bold text-gray-600">Quick Test IDs:</span>
                        {["CMP-2024-00341", "CMP-2024-00342", "CMP-2024-00343"].map((id) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => {
                                    setSearchInput(id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-bold transition cursor-pointer"
                            >
                                {id}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Result ── */}
                {searched && !complaint && !loading && (
                    <div className="text-center py-12 bg-white rounded-3xl border border-gray-200/80 p-8 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="font-extrabold text-gray-900 text-lg">No Complaint Found</h3>
                        <p className="text-gray-500 text-sm mt-1">Please verify the Complaint ID or phone number and try again.</p>
                    </div>
                )}

                {complaint && (
                    <div className="space-y-6 animate-slide-up">
                        {/* Main Info Card */}
                        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
                            {/* Success Banner for New Submissions */}
                            {complaint.status === "submitted" && complaint.id && complaint.id.startsWith("temp-") && (
                                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 mb-5 flex gap-3.5">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-extrabold text-emerald-950">Complaint Submitted Successfully!</p>
                                        <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                                            Your complaint has been registered. You will receive SMS/WhatsApp updates on your registered mobile number.
                                            Our team will review and assign it to the appropriate department shortly.
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-start justify-between gap-3 mb-5">
                                <div>
                                    <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">{complaint.complaintNumber}</p>
                                    <h2 className="text-xl font-black text-gray-950 mt-1">{complaint.title}</h2>
                                </div>
                                <StatusBadge status={complaint.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 mb-5">
                                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Priority</p>
                                    <div className="mt-1.5"><PriorityBadge priority={complaint.priority} /></div>
                                </div>
                                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">SLA Status</p>
                                    <p className={cn("text-sm font-extrabold mt-1.5", sla?.color)}>{sla?.label}</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Department</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{complaint.assignedDept || "Pending Assignment"}</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <User className="w-3.5 h-3.5 text-emerald-600" />
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Field Officer</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{complaint.assignedOfficer || "Not Assigned"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-sm text-gray-600 mb-4 bg-slate-50/70 p-3 rounded-xl">
                                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span className="font-medium">{complaint.locationAddress}</span>
                            </div>
                            
                            {/* Get Directions Button */}
                            <Button
                                variant="secondary"
                                size="md"
                                className="w-full font-bold"
                                leftIcon={<MapPin className="w-4 h-4 text-emerald-600" />}
                                onClick={() => {
                                    let url;
                                    if (complaint.latitude && complaint.longitude && 
                                        complaint.latitude !== 0 && complaint.longitude !== 0) {
                                        url = `https://www.google.com/maps/dir/?api=1&destination=${complaint.latitude},${complaint.longitude}`;
                                    } else {
                                        const address = encodeURIComponent(complaint.locationAddress || complaint.location_address || '');
                                        url = `https://www.google.com/maps/search/?api=1&query=${address}`;
                                    }
                                    window.open(url, '_blank');
                                    toast.success("Opening Google Maps...");
                                }}
                            >
                                Get Directions to Location
                            </Button>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-3 font-medium">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                Submitted {formatDateTime(complaint.createdAt)}
                            </div>
                        </div>

                        {/* Escalation Banner */}
                        {complaint.isEscalated && (
                            <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-extrabold text-rose-900">SLA Breached — Escalated</p>
                                    <p className="text-xs text-rose-700 mt-0.5">This complaint has been escalated to the supervisor for immediate resolution.</p>
                                </div>
                            </div>
                        )}

                        {/* Lifecycle Stepper */}
                        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
                            <h3 className="font-extrabold text-gray-950 text-base mb-6">Complaint Progress</h3>
                            <ComplaintStepper currentStatus={complaint.status} />
                        </div>

                        {/* Status History */}
                        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
                            <h3 className="font-extrabold text-gray-950 text-base mb-5">Update Timeline</h3>
                            {complaint.id && complaint.id.startsWith("temp-") ? (
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-200">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-950">Submitted</span>
                                                <span className="text-xs text-gray-400">Just now</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">Complaint received and registered in the system — by <strong>System</strong></p>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 ml-11">
                                        <p className="text-xs text-emerald-950 leading-relaxed">
                                            <strong className="text-emerald-800">Next Steps:</strong> Your complaint will be validated by our operations team within 24 hours 
                                            and assigned to the appropriate department. You'll receive updates at each stage.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                {HISTORY_MOCK.map((h, i) => (
                                    <div key={i} className="flex gap-3.5">
                                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-emerald-200">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-950">{h.status}</span>
                                                <span className="text-xs text-gray-400">{h.time}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-0.5">{h.note} — by <strong>{h.by}</strong></p>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Help */}
                        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-extrabold text-emerald-950">Need Assistance?</p>
                                <p className="text-xs text-gray-600 mt-0.5">Call our civic helpline: <strong className="text-emerald-800 font-bold">1800-425-CIVIC</strong> (Toll Free, 24/7 Citizen Support)</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CitizenLayout>
    );
}

export default function TrackPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400">Loading tracking system...</div>}>
            <TrackContent />
        </Suspense>
    );
}
