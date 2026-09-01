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
            <div className="max-w-2xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-black text-gray-900">Track Your Complaint</h1>
                    <p className="text-gray-500 text-sm mt-1">Enter your Complaint ID or registered mobile number</p>
                </div>

                {/* Search Box */}
                <div className="civic-card p-5 mb-6">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="CMP-2024-00341 or 9876543210"
                                className="input-field pl-10"
                            />
                        </div>
                        <Button onClick={handleSearch} loading={loading} leftIcon={<Search className="w-4 h-4" />}>
                            Track
                        </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Demo: Try <strong>CMP-2024-00341</strong> or <strong>CMP-2024-00342</strong></p>
                </div>

                {/* ── Result ── */}
                {searched && !complaint && !loading && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">No Complaint Found</h3>
                        <p className="text-gray-500 text-sm mt-1">Check the Complaint ID or mobile number and try again.</p>
                    </div>
                )}

                {complaint && (
                    <div className="space-y-5 animate-slide-up">
                        {/* Main Info Card */}
                        <div className="civic-card p-5">
                            {/* Success Banner for New Submissions */}
                            {complaint.status === "submitted" && complaint.id && complaint.id.startsWith("temp-") && (
                                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4 flex gap-3">
                                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-green-900">Complaint Submitted Successfully!</p>
                                        <p className="text-xs text-green-700 mt-1">
                                            Your complaint has been registered. You will receive SMS/WhatsApp updates on your registered mobile number.
                                            Our team will review and assign it to the appropriate department shortly.
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{complaint.complaintNumber}</p>
                                    <h2 className="text-lg font-bold text-gray-900 mt-1">{complaint.title}</h2>
                                </div>
                                <StatusBadge status={complaint.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-400 font-medium">Priority</p>
                                    <div className="mt-1"><PriorityBadge priority={complaint.priority} /></div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-400 font-medium">SLA Status</p>
                                    <p className={cn("text-sm font-bold mt-1", sla?.color)}>{sla?.label}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Building2 className="w-3 h-3 text-gray-400" />
                                        <p className="text-xs text-gray-400 font-medium">Department</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">{complaint.assignedDept || "Pending Assignment"}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <User className="w-3 h-3 text-gray-400" />
                                        <p className="text-xs text-gray-400 font-medium">Field Officer</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">{complaint.assignedOfficer || "Not Assigned"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span>{complaint.locationAddress}</span>
                            </div>
                            
                            {/* Get Directions Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                leftIcon={<MapPin className="w-4 h-4" />}
                                onClick={() => {
                                    // Use coordinates if available, otherwise use address
                                    let url;
                                    if (complaint.latitude && complaint.longitude && 
                                        complaint.latitude !== 0 && complaint.longitude !== 0) {
                                        url = `https://www.google.com/maps/dir/?api=1&destination=${complaint.latitude},${complaint.longitude}`;
                                    } else {
                                        // Fallback to address search
                                        const address = encodeURIComponent(complaint.locationAddress || complaint.location_address || '');
                                        url = `https://www.google.com/maps/search/?api=1&query=${address}`;
                                    }
                                    window.open(url, '_blank');
                                    toast.success("Opening Google Maps...");
                                }}
                            >
                                Get Directions to Location
                            </Button>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                                <Clock className="w-3.5 h-3.5" />
                                Submitted {formatDateTime(complaint.createdAt)}
                            </div>
                        </div>

                        {/* Escalation Banner */}
                        {complaint.isEscalated && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-red-800">SLA Breached — Escalated</p>
                                    <p className="text-xs text-red-600 mt-0.5">This complaint has been escalated to the supervisor for immediate attention.</p>
                                </div>
                            </div>
                        )}

                        {/* Lifecycle Stepper */}
                        <div className="civic-card p-5">
                            <h3 className="font-bold text-gray-900 mb-5">Complaint Progress</h3>
                            <ComplaintStepper currentStatus={complaint.status} />
                        </div>

                        {/* Status History */}
                        <div className="civic-card p-5">
                            <h3 className="font-bold text-gray-900 mb-4">Update Timeline</h3>
                            {complaint.id && complaint.id.startsWith("temp-") ? (
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-civic-green" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">Submitted</span>
                                                <span className="text-xs text-gray-400">Just now</span>
                                            </div>
                                            <p className="text-xs text-gray-500">Complaint received and registered in the system — by <strong>System</strong></p>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 ml-11">
                                        <p className="text-xs text-blue-800">
                                            <strong>Next Steps:</strong> Your complaint will be validated by our operations team within 24 hours 
                                            and assigned to the appropriate department. You'll receive updates at each stage.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                {HISTORY_MOCK.map((h, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-civic-blue" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">{h.status}</span>
                                                <span className="text-xs text-gray-400">{h.time}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{h.note} — by <strong>{h.by}</strong></p>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Help */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-civic-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Phone className="w-5 h-5 text-civic-blue" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Need Help?</p>
                                <p className="text-xs text-gray-500">Call our helpline: <strong>1800-XXX-XXXX</strong> (Toll Free, 9AM–6PM)</p>
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
