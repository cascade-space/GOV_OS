"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import {
    CheckCircle2, XCircle, AlertTriangle, MapPin, Clock,
    User, Calendar, Image as ImageIcon, ExternalLink, ShieldCheck, X
} from "lucide-react";
import toast from "react-hot-toast";
import { complaintService } from "@/lib/services/complaint.service";

interface QCVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    complaint: any;
    onActionCompleted?: () => void;
}

export function QCVerificationModal({
    isOpen,
    onClose,
    complaint,
    onActionCompleted
}: QCVerificationModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [showReworkInput, setShowReworkInput] = useState(false);
    const [reworkReason, setReworkReason] = useState("");
    const [verificationNotes, setVerificationNotes] = useState("");

    if (!isOpen || !complaint) return null;

    const initialPhoto = complaint.media_urls?.[0] || complaint.mediaUrls?.[0] || complaint.evidenceUrl;
    const resolutionPhoto = complaint.resolutionEvidenceUrl || complaint.resolution_evidence_url;
    const distanceDeviation = complaint.distanceDeviationMeters ?? complaint.distance_deviation_meters;

    const handleApprove = async () => {
        setSubmitting(true);
        try {
            await complaintService.verifyAndClose(complaint.id, verificationNotes);
            toast.success(`Complaint ${complaint.complaintNumber || complaint.complaint_number} verified & marked RESOLVED!`);
            onActionCompleted?.();
            onClose();
        } catch (err: any) {
            console.error("Verification approval failed:", err);
            const msg = err.response?.data?.message || err.message || "Failed to verify complaint";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestRework = async () => {
        if (!reworkReason.trim() || reworkReason.trim().length < 10) {
            toast.error("Please provide a detailed rework reason (minimum 10 characters).");
            return;
        }

        setSubmitting(true);
        try {
            await complaintService.requestRework(complaint.id, reworkReason.trim());
            toast.success("Rework requested. Ticket returned to officer with +24h SLA grace window.");
            onActionCompleted?.();
            onClose();
        } catch (err: any) {
            console.error("Rework request failed:", err);
            const msg = err.response?.data?.message || err.message || "Failed to request rework";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-200 my-8 max-h-[90vh] overflow-y-auto">
                {/* Modal Title Bar */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-950">Quality Control & Resolution Verification</h2>
                            <p className="text-xs text-gray-500">Milestone M5 — Independent False-Closure Prevention Inspection</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-700 uppercase">
                                {complaint.complaintNumber || complaint.complaint_number}
                            </span>
                            <StatusBadge status={complaint.status} />
                            <PriorityBadge priority={complaint.priority} />
                        </div>
                        <h3 className="text-lg font-black text-gray-950 mt-1">
                            {complaint.title}
                        </h3>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                        <p className="font-semibold text-gray-700">{complaint.category}</p>
                        <p>{complaint.locationAddress || complaint.location_address}</p>
                    </div>
                </div>

                {/* Side-by-Side Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left Pane: Citizen Report */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                                <Clock className="w-3.5 h-3.5 text-blue-600" />
                                <span>1. Citizen Report (Before)</span>
                            </div>
                            <span className="text-[11px] text-gray-400">
                                {formatDateTime(complaint.createdAt || complaint.created_at)}
                            </span>
                        </div>

                        {/* Initial Evidence Photo */}
                        <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200 flex items-center justify-center">
                            {initialPhoto ? (
                                <img
                                    src={initialPhoto}
                                    alt="Citizen initial evidence"
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="text-center p-4 text-gray-400">
                                    <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-1" />
                                    <p className="text-xs">No initial photo uploaded</p>
                                </div>
                            )}
                        </div>

                        {/* Citizen Description */}
                        <div className="bg-slate-50 p-3 rounded-xl text-xs text-gray-700 flex-1">
                            <p className="font-bold text-gray-900 mb-1">Issue Description:</p>
                            <p className="leading-relaxed">{complaint.description}</p>
                        </div>

                        {/* Citizen Details */}
                        <div className="text-[11px] text-gray-500 pt-1 space-y-1">
                            <p className="flex items-center gap-1">
                                <User className="w-3 h-3 text-gray-400" />
                                Reporter: {complaint.reporterName || complaint.citizen_name || "Public Citizen"}
                            </p>
                            <p className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                Coordinates: {complaint.latitude?.toFixed(5)}, {complaint.longitude?.toFixed(5)}
                            </p>
                        </div>
                    </div>

                    {/* Right Pane: Officer Work Completion Proof */}
                    <div className="bg-white border-2 border-emerald-200/80 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col">
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>2. Resolution Proof (After)</span>
                            </div>
                            <span className="text-[11px] text-emerald-600 font-semibold">
                                {complaint.workCompletedAt || complaint.work_completed_at
                                    ? formatDateTime(complaint.workCompletedAt || complaint.work_completed_at)
                                    : "Work Completed"}
                            </span>
                        </div>

                        {/* Resolution Photo */}
                        <div className="aspect-video bg-emerald-50/50 rounded-xl overflow-hidden relative border border-emerald-200 flex items-center justify-center">
                            {resolutionPhoto ? (
                                <img
                                    src={resolutionPhoto}
                                    alt="Officer resolution evidence"
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="text-center p-4 text-emerald-600/70">
                                    <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-1" />
                                    <p className="text-xs">No resolution proof photo provided</p>
                                </div>
                            )}
                        </div>

                        {/* Officer Notes */}
                        <div className="bg-emerald-50/60 p-3 rounded-xl text-xs text-emerald-950 flex-1 border border-emerald-200/50">
                            <p className="font-bold text-emerald-900 mb-1">Field Execution Summary:</p>
                            <p className="leading-relaxed">
                                {complaint.resolutionNotes || complaint.resolution_notes || "Officer submitted completion with no extra notes."}
                            </p>
                        </div>

                        {/* Distance Deviation Badge */}
                        <div className="pt-1">
                            {distanceDeviation !== undefined && distanceDeviation !== null ? (
                                distanceDeviation > 500 ? (
                                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                                        <span>
                                            <strong>Location Deviation Warning:</strong> Photo uploaded {Math.round(distanceDeviation)}m from complaint GPS.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                        <span>
                                            <strong>Verified On-Site:</strong> Photo captured within {Math.round(distanceDeviation)}m of reported coordinates.
                                        </span>
                                    </div>
                                )
                            ) : (
                                <p className="text-[11px] text-gray-400 italic">GPS deviation not recorded for this completion.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rework Reason Input (Conditional) */}
                {showReworkInput && (
                    <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl space-y-2 animate-slide-up">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 uppercase">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <span>Specify Deficiencies for Rework:</span>
                        </div>
                        <textarea
                            value={reworkReason}
                            onChange={(e) => setReworkReason(e.target.value)}
                            placeholder="e.g. Surface patch uneven, tar compaction incomplete near curb edge. Please redo."
                            rows={3}
                            className="w-full p-3 border border-rose-300 rounded-xl text-xs bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowReworkInput(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleRequestRework}
                                loading={submitting}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                            >
                                Send Back for Rework (+24h SLA)
                            </Button>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {!showReworkInput && (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
                        <Button variant="secondary" onClick={onClose}>
                            Close
                        </Button>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setShowReworkInput(true)}
                                leftIcon={<XCircle className="w-4 h-4 text-rose-600" />}
                                className="border-rose-300 hover:bg-rose-50 text-rose-700 font-bold"
                            >
                                Request Rework
                            </Button>

                            <Button
                                onClick={handleApprove}
                                loading={submitting}
                                leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-lg shadow-emerald-600/20"
                            >
                                Approve & Verify Resolution
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
