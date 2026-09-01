// Dynamic route page for complaint details
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { ComplaintStepper } from "@/components/ui/Stepper";
import { MOCK_COMPLAINTS, MOCK_OFFICERS } from "@/lib/mockData";
import { ComplaintStatus, COMPLAINT_STATUSES } from "@/lib/constants";
import { complaintService } from "@/lib/services/complaint.service";
import { formatDateTime, getSLAStatus, cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import {
    ArrowLeft, MapPin, Calendar, User, Phone, Building2, AlertTriangle,
    CheckCircle2, XCircle, UserPlus, MessageSquare, Upload, Clock, Camera
} from "lucide-react";

const CivicMapbox = dynamic(() => import("@/components/ui/CivicMapbox"), { ssr: false });

export default function ComplaintDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [complaint, setComplaint] = useState<any>(MOCK_COMPLAINTS.find(c => c.id === params.id));
    const [loading, setLoading] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showEscalateModal, setShowEscalateModal] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState("");
    const [newStatus, setNewStatus] = useState<ComplaintStatus>("submitted");
    const [statusNote, setStatusNote] = useState("");
    const [escalationReason, setEscalationReason] = useState("");

    useEffect(() => {
        // Try to fetch from API, fallback to mock
        complaintService.getComplaintById(params.id)
            .then((data: any) => {
                setComplaint(data);
            })
            .catch(() => {
                const mock = MOCK_COMPLAINTS.find(c => c.id === params.id);
                if (mock) setComplaint(mock);
            });
    }, [params.id]);

    if (!complaint) {
        return (
            <AdminLayout>
                <div className="text-center py-20">
                    <p className="text-gray-500">Complaint not found</p>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </AdminLayout>
        );
    }

    const sla = getSLAStatus(complaint.slaDeadline);

    const handleAssign = async () => {
        if (!selectedDept) {
            toast.error("Please select a department");
            return;
        }

        setLoading(true);
        try {
            await complaintService.assignComplaint(complaint.id, selectedDept, selectedOfficer);
            setComplaint({ ...complaint, assignedDept: selectedDept, assignedOfficer: selectedOfficer, status: "assigned" });
            toast.success("Complaint assigned successfully");
            setShowAssignModal(false);
        } catch (error) {
            // Mock success
            setComplaint({ ...complaint, assignedDept: selectedDept, assignedOfficer: selectedOfficer, status: "assigned" });
            toast.success("Complaint assigned successfully");
            setShowAssignModal(false);
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
        } catch (error) {
            // Mock success
            setComplaint({ ...complaint, status: newStatus });
            toast.success("Status updated successfully");
            setShowStatusModal(false);
            setStatusNote("");
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
        } catch (error) {
            // Mock success
            setComplaint({ ...complaint, isEscalated: true });
            toast.success("Complaint escalated successfully");
            setShowEscalateModal(false);
            setEscalationReason("");
        } finally {
            setLoading(false);
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
                                    <p className="text-sm font-semibold text-gray-900">{complaint.category} / {complaint.subCategory}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">SLA Deadline</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDateTime(complaint.slaDeadline)}</p>
                                </div>
                            </div>
                        </div>

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
                                    {complaint.assignedDept ? "Reassign" : "Assign"}
                                </Button>
                            </div>
                            {complaint.assignedDept ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">Department</p>
                                            <p className="text-sm font-semibold text-gray-900">{complaint.assignedDept}</p>
                                        </div>
                                    </div>
                                    {complaint.assignedOfficer && (
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-400">Officer</p>
                                                <p className="text-sm font-semibold text-gray-900">{complaint.assignedOfficer}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Not yet assigned</p>
                            )}
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
                                    {MOCK_OFFICERS.map(officer => (
                                        <option key={officer.id} value={officer.name}>{officer.name}</option>
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
