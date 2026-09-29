// Dynamic route page for complaint details
// generateStaticParams required for output: 'export' — returns empty array since data is fetched client-side
export async function generateStaticParams() {
    return [];
}

"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { ComplaintStepper } from "@/components/ui/Stepper";
import { ComplaintStatus, COMPLAINT_STATUSES } from "@/lib/constants";
import { complaintService } from "@/lib/services/complaint.service";
import { formatDateTime, getSLAStatus, cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import api from "@/lib/api-client";
import {
    ArrowLeft, MapPin, Calendar, User, Phone, Building2, AlertTriangle,
    CheckCircle2, XCircle, UserPlus, MessageSquare, Upload, Clock, Camera,
    RefreshCw, Globe
} from "lucide-react";

const CivicMapbox = dynamic(() => import("@/components/ui/CivicMapbox"), { ssr: false });

export default function ComplaintDetailPage({ params }: { params?: Promise<{ id: string }> | { id: string } }) {
    const router = useRouter();
    const routeParams = useParams();
    const resolvedParams = params ? (typeof (params as any).then === "function" ? use(params as Promise<{ id: string }>) : params) : null;
    const rawId = routeParams?.id || resolvedParams?.id;
    const complaintId = Array.isArray(rawId) ? rawId[0] : (rawId || "");

    const [complaint, setComplaint] = useState<any>(null);
    const [officers, setOfficers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState("");
    const [newStatus, setNewStatus] = useState<ComplaintStatus>("submitted");
    const [statusNote, setStatusNote] = useState("");
    const [escalationReason, setEscalationReason] = useState("");

    const fetchComplaint = useCallback(async () => {
        if (!complaintId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            let data: any;
            if (complaintId.toUpperCase().startsWith("CMP-")) {
                data = await complaintService.getComplaintByNumber(complaintId);
            } else {
                data = await complaintService.getComplaintById(complaintId);
            }
            setComplaint(data);
        } catch (err) {
            console.error("Failed to load complaint:", err);
            setComplaint(null);
        } finally {
            setLoading(false);
        }
    }, [complaintId]);

    useEffect(() => {
        fetchComplaint();

        // Load real officers from Core API or Node.js Backend
        const loadOfficers = async () => {
            try {
                const res: any = await api.get('/officers');
                const list = Array.isArray(res) ? res : res?.data || [];
                setOfficers(list);
            } catch (err) {
                console.error("Failed to fetch officers:", err);
            }
        };
        loadOfficers();
    }, [fetchComplaint]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-24 text-gray-500 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2 text-civic-blue" />
                    Loading complaint details from authoritative Core API...
                </div>
            </AdminLayout>
        );
    }

    if (!complaint) {
        return (
            <AdminLayout>
                <div className="text-center py-20">
                    <p className="text-gray-500 font-medium">Complaint not found in database</p>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </AdminLayout>
        );
    }

    const sla = getSLAStatus(complaint.slaDeadline);

    const handleAssign = async () => {
        if (!selectedOfficer) {
            toast.error("Please select an officer");
            return;
        }

        setLoading(true);
        try {
            await complaintService.assignComplaint(complaint.id, selectedOfficer);
            const assignedOfficerObj = officers.find((o: any) => o.id === selectedOfficer);
            setComplaint({
                ...complaint,
                assignedToId: selectedOfficer,
                assignedOfficer: assignedOfficerObj?.fullName || assignedOfficerObj?.name || selectedOfficer,
                status: "ASSIGNED"
            });
            toast.success("Complaint assigned successfully");
            setShowAssignModal(false);
        } catch (error: any) {
            console.error("Assignment error:", error);
            toast.error("Failed to assign complaint: " + (error?.response?.data?.message || error?.message || "Error"));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        setLoading(true);
        try {
            await complaintService.updateStatus(complaint.id, newStatus, statusNote);
            setComplaint({ ...complaint, status: newStatus });
            toast.success("Status updated successfully");
            setShowStatusModal(false);
            setStatusNote("");
        } catch (error: any) {
            console.error("Status update error:", error);
            toast.error("Failed to update status: " + (error?.response?.data?.message || error?.message || "Error"));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyClose = async () => {
        setLoading(true);
        try {
            const updated = await complaintService.verifyAndClose(complaint.id, "Verified by Municipal Admin / QC Verifier");
            setComplaint((prev: any) => updated || (prev ? { ...prev, status: "RESOLVED" } : null));
            toast.success("Resolution verified and closed!");
            fetchComplaint();
        } catch (error: any) {
            console.error("Verify close error:", error);
            toast.error("Failed to verify & close: " + (error?.response?.data?.message || error?.message || "Error"));
        } finally {
            setLoading(false);
        }
    };

    const handleRequestRework = async () => {
        const reason = window.prompt("Enter rework instructions for field officer:");
        if (!reason || !reason.trim()) return;
        setLoading(true);
        try {
            const updated = await complaintService.requestRework(complaint.id, reason.trim());
            setComplaint((prev: any) => updated || (prev ? {
                ...prev,
                status: "IN_PROGRESS",
                reworkReason: reason.trim(),
                reworkCount: (prev.reworkCount || 0) + 1
            } : null));
            toast.success("Complaint returned to officer for rework");
            fetchComplaint();
        } catch (error: any) {
            console.error("Rework error:", error);
            toast.error("Failed to request rework: " + (error?.response?.data?.message || error?.message || "Error"));
        } finally {
            setLoading(false);
        }
    };

    const handleEscalate = async () => {
        if (!escalationReason.trim()) {
            toast.error("Please provide a reason for escalation");
            return;
        }

        setLoading(true);
        try {
            await complaintService.escalateComplaint(complaint.id, escalationReason);
            setComplaint({ ...complaint, isEscalated: true });
            toast.success("Complaint escalated successfully");
            setShowEscalateModal(false);
            setEscalationReason("");
        } catch (error: any) {
            console.error("Escalation error:", error);
            toast.error("Failed to escalate complaint: " + (error?.response?.data?.message || error?.message || "Error"));
        } finally {
            setLoading(false);
        }
    };

    const handleManualResync = async () => {
        setSyncing(true);
        try {
            const res: any = await api.post(`/integrations/complaints/${complaint.id}/sync?systemName=ICCC_MUNICIPAL`);
            toast.success(`Dispatched to ICCC Gateway! Ref: ${res.externalTicketId || 'Synced'}`);
            setComplaint({
                ...complaint,
                external_system: 'ICCC_MUNICIPAL',
                external_ticket_id: res.externalTicketId || complaint.external_ticket_id,
                integration_status: 'SYNCED',
                last_external_status: 'ACKNOWLEDGED'
            });
        } catch (e: any) {
            toast.error(`Re-sync failed: ${e.message || 'Unknown error'}`);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 animate-fade-in pb-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                            Back
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-black text-gray-900">{complaint.complaintNumber}</h1>
                                {complaint.isEscalated && (
                                    <span className="badge badge-red text-xs">Escalated</span>
                                )}
                            </div>
                            <p className="text-gray-500 text-sm">Filed on {formatDateTime(complaint.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {["WORK_COMPLETED", "VERIFICATION_PENDING"].includes(complaint.status?.toUpperCase()) && (
                            <>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleVerifyClose} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                                    Verify & Close
                                </Button>
                                <Button variant="outline" size="sm" className="border-amber-400 text-amber-700 hover:bg-amber-50" onClick={handleRequestRework} leftIcon={<RefreshCw className="w-4 h-4" />}>
                                    Request Rework
                                </Button>
                            </>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setShowEscalateModal(true)} leftIcon={<AlertTriangle className="w-4 h-4" />}>
                            Escalate
                        </Button>
                        <Button size="sm" onClick={() => setShowStatusModal(true)} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                            Update Status
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Issue Details */}
                        <div className="civic-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{complaint.title}</h2>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={complaint.status} />
                                        <PriorityBadge priority={complaint.priority} />
                                        <span className={cn("badge text-xs", sla.color.replace("text-", "badge-"))}>
                                            {sla.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed">{complaint.description}</p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Category</p>
                                    <p className="text-sm font-semibold text-gray-900">{complaint.category} / {complaint.subCategory || "General"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">SLA Deadline</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDateTime(complaint.slaDeadline)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Field Work & QC Resolution Card */}
                        {(complaint.resolutionNotes || complaint.resolutionEvidenceUrl || complaint.reworkReason || ["WORK_COMPLETED", "RESOLVED", "VERIFICATION_PENDING"].includes(complaint.status?.toUpperCase())) && (
                            <div className="civic-card p-6 border-emerald-300 bg-emerald-50/30">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        <h3 className="section-title text-emerald-950">Field Work & Resolution Report</h3>
                                    </div>
                                    <span className="badge badge-green text-xs">Work Submitted</span>
                                </div>

                                {complaint.resolutionNotes && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Officer Notes</p>
                                        <p className="text-sm text-gray-800 bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm">{complaint.resolutionNotes}</p>
                                    </div>
                                )}

                                {complaint.resolutionEvidenceUrl && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Resolution Evidence (After Photo)</p>
                                        <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-emerald-200 shadow-sm">
                                            <img src={complaint.resolutionEvidenceUrl} alt="Resolution Evidence" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                )}

                                {complaint.reworkReason && (
                                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Rework Instructions (Revision #{complaint.reworkCount || 1})</p>
                                        <p className="text-sm text-amber-900">{complaint.reworkReason}</p>
                                    </div>
                                )}

                                {["WORK_COMPLETED", "VERIFICATION_PENDING"].includes(complaint.status?.toUpperCase()) && (
                                    <div className="mt-4 pt-4 border-t border-emerald-200 flex items-center justify-end gap-3">
                                        <Button variant="outline" size="sm" className="border-amber-400 text-amber-800 hover:bg-amber-50" onClick={handleRequestRework} leftIcon={<RefreshCw className="w-4 h-4" />}>
                                            Reject & Request Rework
                                        </Button>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleVerifyClose} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                                            Approve & Verify Close
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Status Timeline */}
                        <div className="civic-card p-6">
                            <h3 className="section-title mb-6">Progress Timeline</h3>
                            <ComplaintStepper currentStatus={complaint.status} />
                        </div>

                        {/* Location & Map */}
                        <div className="civic-card p-6">
                            <h3 className="section-title mb-4">Location</h3>
                            <div className="flex items-start gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-civic-blue flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{complaint.locationAddress}</p>
                                    <p className="text-xs text-gray-500">{complaint.ward}</p>
                                </div>
                            </div>
                            <div className="h-[300px] rounded-2xl overflow-hidden">
                                <CivicMapbox
                                    center={[complaint.longitude, complaint.latitude]}
                                    zoom={16}
                                    markers={[{ lat: complaint.latitude, lon: complaint.longitude }]}
                                    interactive={false}
                                />
                            </div>
                        </div>

                        {/* Media Gallery */}
                        {complaint.attachments && complaint.attachments.length > 0 ? (
                            <div className="civic-card p-6">
                                <h3 className="section-title mb-4">Attached Photos ({complaint.attachments.length})</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {complaint.attachments.map((attachment: any, i: number) => (
                                        <a
                                            key={i}
                                            href={attachment.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden hover:ring-2 hover:ring-civic-blue transition-all"
                                        >
                                            <img
                                                src={attachment.file_url}
                                                alt={`Photo ${i + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="bg-white rounded-full p-2">
                                                        <svg className="w-5 h-5 text-civic-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : complaint.mediaCount && complaint.mediaCount > 0 ? (
                            <div className="civic-card p-6">
                                <h3 className="section-title mb-4">Attached Photos ({complaint.mediaCount})</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {Array.from({ length: complaint.mediaCount }).map((_, i) => (
                                        <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-gray-300" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Citizen Info */}
                        <div className="civic-card p-5">
                            <h3 className="section-title mb-4">Citizen Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Name</p>
                                        <p className="text-sm font-semibold text-gray-900">{complaint.citizenName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Mobile</p>
                                        <p className="text-sm font-semibold text-gray-900">{complaint.citizenMobile}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assignment */}
                        <div className="civic-card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="section-title">Assignment</h3>
                                <Button size="sm" variant="ghost" onClick={() => setShowAssignModal(true)} leftIcon={<UserPlus className="w-4 h-4" />}>
                                    {complaint.assignedToId ? "Reassign" : "Assign"}
                                </Button>
                            </div>
                            {complaint.assignedToId ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">Department</p>
                                            <p className="text-sm font-semibold text-gray-900">{complaint.assignedDept}</p>
                                        </div>
                                    </div>
                                    {complaint.assignedToId && (
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-400">Officer ID / Details</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {(() => {
                                                        const officer = officers.find((o: any) => o.id === complaint.assignedToId);
                                                        return officer?.fullName || officer?.name || complaint.assignedToId;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Not yet assigned</p>
                            )}
                        </div>

                        {/* Integration Hub & External Sync */}
                        <div className="civic-card p-5 border-indigo-200/80 bg-gradient-to-br from-indigo-50/50 to-slate-50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-indigo-600" />
                                    <h3 className="section-title text-indigo-950">Integration Hub</h3>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    loading={syncing}
                                    onClick={handleManualResync}
                                    className="text-xs text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100/50 cursor-pointer"
                                    leftIcon={<RefreshCw className={cn("w-3.5 h-3.5", syncing && "animate-spin")} />}
                                >
                                    Re-sync
                                </Button>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between items-center py-1 border-b border-indigo-100">
                                    <span className="text-gray-500 font-medium">External System</span>
                                    <span className="font-semibold text-gray-900">{complaint.external_system || complaint.externalSystem || 'ICCC_MUNICIPAL'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-indigo-100">
                                    <span className="text-gray-500 font-medium">External Case Ref</span>
                                    <span className="font-mono font-bold text-indigo-700">{complaint.external_ticket_id || complaint.externalTicketId || '—'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-indigo-100">
                                    <span className="text-gray-500 font-medium">Federation Status</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded font-bold uppercase text-[10px]",
                                        (complaint.integration_status || complaint.integrationStatus) === 'SYNCED'
                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                            : "bg-amber-100 text-amber-800 border border-amber-300"
                                    )}>
                                        {complaint.integration_status || complaint.integrationStatus || 'PENDING'}
                                    </span>
                                </div>
                                {(complaint.last_external_status || complaint.lastExternalStatus) && (
                                    <div className="flex justify-between items-center py-1 border-b border-indigo-100">
                                        <span className="text-gray-500 font-medium">External Status</span>
                                        <span className="font-semibold text-gray-800">{complaint.last_external_status || complaint.lastExternalStatus}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div className="civic-card p-5 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                            <h3 className="section-title mb-3">AI Insights</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Suggested Category</p>
                                    <span className="badge badge-purple text-xs">{complaint.aiCategorySuggestion}</span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Urgency Score</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"
                                                style={{ width: `${complaint.aiUrgencyScore * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{(complaint.aiUrgencyScore * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Assign Complaint</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label-field">Officer *</label>
                                <select
                                    value={selectedOfficer}
                                    onChange={(e) => setSelectedOfficer(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Select officer</option>
                                    {officers.map(officer => (
                                        <option key={officer.id} value={officer.id}>
                                            {officer.fullName || officer.name || officer.phone} ({officer.designation || "Field Officer"})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                            <Button variant="ghost" onClick={() => setShowAssignModal(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleAssign} loading={loading} className="flex-1">
                                Assign
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Update Status</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label-field">New Status *</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                                    className="input-field"
                                >
                                    {COMPLAINT_STATUSES.map(status => (
                                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label-field">Note (Optional)</label>
                                <textarea
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    className="input-field min-h-[100px]"
                                    placeholder="Add any notes about this status change..."
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                            <Button variant="ghost" onClick={() => setShowStatusModal(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleStatusUpdate} loading={loading} className="flex-1">
                                Update
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Escalate Modal */}
            {showEscalateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Escalate Complaint</h3>
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <p className="text-sm text-amber-800">
                                    Escalating this complaint will notify senior officials and mark it as high priority.
                                </p>
                            </div>
                            <div>
                                <label className="label-field">Reason for Escalation *</label>
                                <textarea
                                    value={escalationReason}
                                    onChange={(e) => setEscalationReason(e.target.value)}
                                    className="input-field min-h-[120px]"
                                    placeholder="Explain why this complaint needs escalation..."
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                            <Button variant="ghost" onClick={() => setShowEscalateModal(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleEscalate} loading={loading} className="flex-1">
                                Escalate
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
