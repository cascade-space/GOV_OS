"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { ComplaintStepper } from "@/components/ui/Stepper";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime, getSLAStatus, truncate, cn } from "@/lib/utils";
import {
    Search, MapPin, Clock, User, Building2, AlertTriangle, CheckCircle2, Phone,
    Star, Upload, X, ShieldCheck, Camera, RotateCcw, MessageSquare, Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";



import { complaintService } from "@/lib/services/complaint.service";
import { subscribeToComplaint } from "@/lib/realtime";

import { Suspense } from "react";


interface TimelineStep {
    id: string;
    title: string;
    actor?: string;
    timestamp?: string;
    description?: string;
    badge?: { text: string; color: string };
    note?: string;
    noteLabel?: string;
    imageUrl?: string;
    imageTitle?: string;
    type: 'success' | 'rework' | 'mla' | 'pending';
}

function buildTimelineSteps(complaint: any, auditTimeline: any[]): TimelineStep[] {
    if (!complaint) return [];

    // Extract initial citizen photo from description attachments or mediaUrls
    let initialCitizenPhoto: string | null = null;
    if (complaint.description) {
        const match = complaint.description.match(/\[Evidence Attachments:\s*([^\]]+)\]/);
        if (match && match[1]) {
            initialCitizenPhoto = match[1].split(',')[0].trim();
        }
    }
    if (!initialCitizenPhoto) {
        initialCitizenPhoto = complaint.mediaUrls?.[0] || complaint.media_urls?.[0] || null;
    }

    if (Array.isArray(auditTimeline) && auditTimeline.length > 0) {
        const steps: TimelineStep[] = [];
        let hasCitizenReopened = false;
        let lastAction = '';

        auditTimeline.forEach((event: any, idx: number) => {
            const action: string = event.action || '';
            let payload: any = {};
            try {
                payload = typeof event.payload === 'string' ? JSON.parse(event.payload) : (event.payload || {});
            } catch {
                payload = {};
            }

            // Deduplicate consecutive identical actions without unique payload
            if (action === lastAction && !payload.evidenceUrl && !payload.reason && !payload.notes) {
                return;
            }

            if (action === 'PUBLIC_COMPLAINT_CREATED' || action === 'COMPLAINT_CREATED') {
                steps.push({
                    id: event.id || `submitted-${idx}`,
                    title: 'Complaint Submitted',
                    actor: 'Citizen',
                    timestamp: event.createdAt || complaint.createdAt,
                    description: 'Issue reported with photo & GPS location',
                    badge: { text: 'Submitted', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                    imageUrl: initialCitizenPhoto || undefined,
                    imageTitle: 'Citizen Reported Photo (Initial Ground Reality)',
                    type: 'success',
                });
                lastAction = action;
            } else if (action === 'INTEGRATION_SYNC_SUCCESS') {
                steps.push({
                    id: event.id || `sync-${idx}`,
                    title: 'Registered in City Operations System',
                    actor: 'ICCC Municipal Command Hub',
                    timestamp: event.createdAt,
                    description: `Automated integration with municipal command center. Reference ID: ${payload.externalTicketId || complaint.externalTicketId || 'ICCC-MUNICIPAL'}`,
                    badge: { text: 'ICCC Synced', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                    type: 'success',
                });
                lastAction = action;
            } else if (action === 'COMPLAINT_ASSIGNED') {
                if (hasCitizenReopened) {
                    steps.push({
                        id: event.id || `assign-rework-${idx}`,
                        title: 'Rework Initiated & Re-assigned',
                        actor: event.actorName || 'Municipal Admin',
                        timestamp: event.createdAt,
                        description: `Complaint re-assigned to ${complaint.assignedOfficer || 'field officer'} for mandatory rectification`,
                        badge: { text: 'Rework Dispatched', color: 'bg-amber-100 text-amber-800 border-amber-300' },
                        type: 'rework',
                    });
                } else {
                    steps.push({
                        id: event.id || `assign-${idx}`,
                        title: 'Assigned to Field Team',
                        actor: event.actorName || 'Municipal Admin',
                        timestamp: event.createdAt,
                        description: `Designated to ${complaint.assignedOfficer || 'field response officer'} (${complaint.assignedDept || 'Field Operations'})`,
                        badge: { text: 'Assigned', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                        type: 'success',
                    });
                }
                lastAction = action;
            } else if (action === 'COMPLAINT_WORK_STARTED') {
                if (hasCitizenReopened) {
                    steps.push({
                        id: event.id || `work-start-rework-${idx}`,
                        title: 'Rework in Progress On-Site',
                        actor: event.actorName || 'Field Officer',
                        timestamp: event.createdAt,
                        description: 'Field team actively executing corrective rework on site',
                        badge: { text: 'Rework Underway', color: 'bg-amber-100 text-amber-800 border-amber-300' },
                        type: 'rework',
                    });
                } else {
                    steps.push({
                        id: event.id || `work-start-${idx}`,
                        title: 'Work in Progress On-Site',
                        actor: event.actorName || 'Field Officer',
                        timestamp: event.createdAt,
                        description: 'Field response team deployed and on-ground execution underway',
                        badge: { text: 'In Progress', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                        type: 'success',
                    });
                }
                lastAction = action;
            } else if (action === 'COMPLAINT_WORK_COMPLETED') {
                if (hasCitizenReopened) {
                    steps.push({
                        id: event.id || `work-comp-rework-${idx}`,
                        title: 'Rework Executed & Updated Proof Uploaded',
                        actor: event.actorName || 'Field Officer',
                        timestamp: event.createdAt,
                        description: 'Field officer completed corrective work and uploaded updated photographic proof',
                        note: payload.notes,
                        noteLabel: 'Officer Rework Notes',
                        imageUrl: payload.evidenceUrl,
                        imageTitle: 'Rework Rectification Proof',
                        badge: { text: 'Rework Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                        type: 'success',
                    });
                } else {
                    steps.push({
                        id: event.id || `work-comp-${idx}`,
                        title: 'Issue Solved & Resolution Proof Uploaded',
                        actor: event.actorName || 'Field Officer',
                        timestamp: event.createdAt,
                        description: 'Field officer completed on-ground execution and submitted verification proof',
                        note: payload.notes,
                        noteLabel: 'Field Officer Notes',
                        imageUrl: payload.evidenceUrl || complaint.resolutionEvidenceUrl,
                        imageTitle: 'Field Officer Resolution Proof (Issue Solved)',
                        badge: { text: 'Work Solved', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                        type: 'success',
                    });
                }
                lastAction = action;
            } else if (action === 'COMPLAINT_VERIFIED_RESOLVED') {
                steps.push({
                    id: event.id || `verified-${idx}`,
                    title: 'Quality Verified & Resolved',
                    actor: event.actorName || 'QC Verifier',
                    timestamp: event.createdAt,
                    description: 'Resolution certified; 72-hour citizen verification window active',
                    note: payload.verificationNotes,
                    noteLabel: 'QC Inspection',
                    badge: { text: 'Verified', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                    type: 'success',
                });
                lastAction = action;
            } else if (action === 'MLA_DIRECTIVE_ISSUED') {
                steps.push({
                    id: event.id || `mla-${idx}`,
                    title: `MLA Priority Directive — ${payload.mla || 'Hon. MLA'}`,
                    actor: 'Legislative Office',
                    timestamp: event.createdAt,
                    description: `Constituency priority directive issued: ${payload.type || 'EXPEDITE'}. Fast-track execution mandated.`,
                    badge: { text: 'MLA Directive', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                    type: 'mla',
                });
                lastAction = action;
            } else if (action === 'COMPLAINT_REOPENED_BY_CITIZEN') {
                hasCitizenReopened = true;
                steps.push({
                    id: event.id || `reopened-${idx}`,
                    title: 'Citizen Decided for Rework — Issue Contested',
                    actor: 'Citizen',
                    timestamp: event.createdAt,
                    description: 'Citizen inspected resolution on-ground and reported issue persists within 72-hour window',
                    note: payload.reason || complaint.reworkReason?.replace(/^Citizen contested:\s*/i, ''),
                    noteLabel: 'Citizen Contest Reason',
                    imageUrl: payload.evidenceUrl,
                    imageTitle: 'Citizen Contest Photo (Ground Reality)',
                    badge: { text: 'Rework Decided', color: 'bg-rose-100 text-rose-800 border-rose-300' },
                    type: 'rework',
                });
                lastAction = action;
            } else if (action === 'COMPLAINT_CONFIRMED_BY_CITIZEN' || action === 'COMPLAINT_CLOSED') {
                steps.push({
                    id: event.id || `closed-${idx}`,
                    title: 'Resolution Certified & Closed',
                    actor: 'Citizen',
                    timestamp: event.createdAt,
                    description: 'Citizen verified work quality and confirmed resolution. Archived in civic records.',
                    note: complaint.citizenFeedback,
                    noteLabel: 'Citizen Feedback',
                    badge: { text: 'Closed', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                    type: 'success',
                });
                lastAction = action;
            }
        });

        // Ensure first step is Submitted if not already captured
        if (steps.length === 0 || steps[0].title !== 'Complaint Submitted') {
            steps.unshift({
                id: 'submitted-initial',
                title: 'Complaint Submitted',
                actor: 'Citizen',
                timestamp: complaint.createdAt,
                description: 'Issue reported with photo & GPS location',
                badge: { text: 'Submitted', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
                imageUrl: initialCitizenPhoto || undefined,
                imageTitle: 'Citizen Reported Photo (Initial Ground Reality)',
                type: 'success',
            });
        }

        return steps;
    }

    // Fallback: Synthesize timeline from complaint fields
    const status = (complaint.status || '').toLowerCase();
    const isAssigned = ['assigned', 'in_progress', 'work_completed', 'resolved', 'closed', 'rework_required', 'reopened'].includes(status);
    const isInProgress = ['in_progress', 'work_completed', 'resolved', 'closed', 'rework_required', 'reopened'].includes(status);
    const isResolvedOrBeyond = ['work_completed', 'resolved', 'closed', 'rework_required', 'reopened'].includes(status);
    const hasRework = complaint.reworkCount > 0 || !!complaint.reworkReason || status === 'reopened' || status === 'rework_required';
    const isClosed = status === 'closed';

    const steps: TimelineStep[] = [
        {
            id: 'fallback-submitted',
            title: 'Complaint Submitted',
            actor: 'Citizen',
            timestamp: complaint.createdAt,
            description: 'Issue received with photo & GPS location',
            badge: { text: 'Submitted', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
            imageUrl: initialCitizenPhoto || undefined,
            imageTitle: 'Citizen Reported Photo (Initial Ground Reality)',
            type: 'success',
        },
        {
            id: 'fallback-assigned',
            title: 'Assigned to Field Team',
            actor: 'Municipal Operations',
            description: isAssigned ? `Designated to ${complaint.assignedOfficer || 'field response officer'}` : 'Awaiting assignment by supervisor',
            badge: isAssigned ? { text: 'Assigned', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' } : undefined,
            type: isAssigned ? 'success' : 'pending',
        },
        {
            id: 'fallback-progress',
            title: 'Work in Progress',
            actor: 'Field Team',
            description: isInProgress ? 'On-ground execution underway' : 'Pending field dispatch',
            badge: isInProgress ? { text: 'In Progress', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' } : undefined,
            type: isInProgress ? 'success' : 'pending',
        },
    ];

    if (complaint.resolutionEvidenceUrl || isResolvedOrBeyond) {
        steps.push({
            id: 'fallback-solved',
            title: 'Issue Solved & Resolution Proof Uploaded',
            actor: 'Field Response Officer',
            timestamp: complaint.resolvedAt,
            description: 'Field officer completed on-ground execution and submitted photographic verification',
            note: complaint.resolutionNotes,
            noteLabel: 'Field Officer Notes',
            imageUrl: complaint.resolutionEvidenceUrl,
            imageTitle: 'Field Officer Resolution Proof (Issue Solved)',
            badge: { text: 'Work Solved', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
            type: 'success',
        });
        steps.push({
            id: 'fallback-qc',
            title: 'Quality Verification & Resolved',
            actor: 'QC Verifier',
            description: 'Resolution certified; 72-hour citizen confirmation active',
            badge: { text: 'Verified', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
            type: 'success',
        });
    }

    if (hasRework) {
        steps.push({
            id: 'fallback-rework',
            title: 'Citizen Decided for Rework — Issue Contested',
            actor: 'Citizen',
            description: 'Citizen inspected resolution on-ground and contested completion within 72 hours',
            note: complaint.reworkReason?.replace(/^Citizen contested:\s*/i, ''),
            noteLabel: 'Citizen Contest Reason',
            badge: { text: 'Rework Decided', color: 'bg-rose-100 text-rose-800 border-rose-300' },
            type: 'rework',
        });
        steps.push({
            id: 'fallback-rework-assigned',
            title: 'Rework Initiated & Assigned to Field Team',
            actor: 'Municipal Administration',
            description: `Corrective rework underway by ${complaint.assignedOfficer || 'field team'}`,
            badge: { text: 'Rework Active', color: 'bg-amber-100 text-amber-800 border-amber-300' },
            type: 'rework',
        });
    }

    if (isClosed) {
        steps.push({
            id: 'fallback-closed',
            title: 'Closed & Archived',
            actor: 'Citizen',
            description: 'Archived & verified in civic records',
            note: complaint.citizenFeedback,
            badge: { text: 'Closed', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
            type: 'success',
        });
    }

    return steps;
}

function TrackContent() {
    const searchParams = useSearchParams();
    const [searchInput, setSearchInput] = useState(searchParams?.get("id") || "");
    const [searched, setSearched] = useState(false);
    const [complaint, setComplaint] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    // 72-Hour Citizen Confirmation & Contest State
    const [rating, setRating] = useState<number>(5);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [feedback, setFeedback] = useState<string>("");
    const [confirming, setConfirming] = useState<boolean>(false);
    const [showContestModal, setShowContestModal] = useState<boolean>(false);
    const [contestReason, setContestReason] = useState<string>("");
    const [contestFile, setContestFile] = useState<File | null>(null);
    const [contestPreview, setContestPreview] = useState<string | null>(null);
    const [reopening, setReopening] = useState<boolean>(false);
    const [auditTimeline, setAuditTimeline] = useState<any[]>([]);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

    const handleSearch = async (idToSearch?: string) => {
        const query = (typeof idToSearch === "string" ? idToSearch : searchInput).trim();
        if (!query) { toast.error("Enter a Complaint ID or mobile number"); return; }
        setLoading(true);
        try {
            const data = await complaintService.getComplaintByNumber(query.toUpperCase());
            setComplaint(data);
            setSearched(true);
            toast.success("Complaint found!");
        } catch (error: any) {
            console.error("Search failed:", error);
            setComplaint(null);
            setSearched(true);
            toast.error("No complaint found for this tracking number or mobile number");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const complaintId = searchParams?.get("id");
        if (complaintId) {
            setSearchInput(complaintId);
            handleSearch(complaintId);
        }
    }, [searchParams]);

    // Fetch real audit timeline whenever complaint is loaded
    useEffect(() => {
        if (!complaint?.complaintNumber) return;
        const fetchTimeline = async () => {
            setTimelineLoading(true);
            try {
                const res: any = await complaintService.getPublicComplaintTimeline(complaint.complaintNumber);
                const events = Array.isArray(res) ? res : (res?.data || []);
                setAuditTimeline(events);
            } catch (err) {
                console.warn('Public timeline fetch failed:', err);
                setAuditTimeline([]);
            } finally {
                setTimelineLoading(false);
            }
        };
        fetchTimeline();
    }, [complaint?.complaintNumber]);


    // Live Realtime WebSocket subscription for active complaint
    useEffect(() => {
        if (!complaint?.complaintNumber) return;

        const unsubscribe = subscribeToComplaint(complaint.complaintNumber, (updateData: any) => {
            console.log('[Realtime Citizen] Received live update for', complaint.complaintNumber, updateData);
            setComplaint((prev: any) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: (updateData.status || prev.status).toLowerCase(),
                    reworkReason: updateData.reworkReason || prev.reworkReason,
                    reworkCount: updateData.reworkCount ?? prev.reworkCount,
                    resolvedAt: updateData.resolvedAt || prev.resolvedAt,
                    resolutionNotes: updateData.resolutionNotes || prev.resolutionNotes,
                    resolutionEvidenceUrl: updateData.resolutionEvidenceUrl || prev.resolutionEvidenceUrl,
                    distanceDeviationMeters: updateData.distanceDeviationMeters ?? prev.distanceDeviationMeters,
                };
            });
            toast.success(`⚡ Live Update: Ticket is now ${(updateData.status || 'Updated').replace('_', ' ')}!`, {
                duration: 5000,
            });
        });

        return () => {
            unsubscribe();
        };
    }, [complaint?.complaintNumber]);

    const sla = complaint ? getSLAStatus(complaint.slaDeadline) : null;

    const handleConfirmResolution = async () => {
        if (!complaint) return;
        setConfirming(true);
        try {
            await complaintService.confirmResolution(complaint.complaintNumber, {
                rating,
                feedback,
            });
            setComplaint((prev: any) => ({
                ...prev,
                status: "closed",
                citizenRating: rating,
                citizenFeedback: feedback,
            }));
            toast.success("Thank you! Resolution confirmed and complaint archived.");
        } catch (err: any) {
            console.error("Confirmation error:", err);
            const msg = err.response?.data?.message || err.message || "Failed to confirm resolution";
            toast.error(msg);
        } finally {
            setConfirming(false);
        }
    };

    const handleReopenComplaint = async () => {
        if (!complaint) return;
        if (!contestReason.trim() || contestReason.trim().length < 10) {
            toast.error("Please explain why the issue persists (minimum 10 characters).");
            return;
        }
        if (!contestFile) {
            toast.error("A fresh photograph showing the unresolved issue is mandatory to reopen.");
            return;
        }

        setReopening(true);
        try {
            const uploadRes = await complaintService.uploadFile(contestFile);
            if (!uploadRes.success || !uploadRes.url) {
                toast.error(uploadRes.error || "Failed to upload contest photo");
                return;
            }
            await complaintService.reopenComplaint(complaint.complaintNumber, {
                reason: contestReason.trim(),
                evidenceUrl: uploadRes.url,
            });
            setComplaint((prev: any) => ({
                ...prev,
                status: "reopened",
                reworkReason: "Citizen contested: " + contestReason.trim(),
            }));
            toast.success("Ticket reopened for priority supervisor review.");
            setShowContestModal(false);
            setContestReason("");
            setContestFile(null);
            setContestPreview(null);
        } catch (err: any) {
            console.error("Reopen error:", err);
            const msg = err.response?.data?.message || err.message || "Failed to reopen complaint";
            toast.error(msg);
        } finally {
            setReopening(false);
        }
    };

    return (
        <CitizenLayout>
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-10 text-center space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200/60">
                        <span>Real-Time Grievance Tracker</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">{t('track.title')}</h1>
                    <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                        {t('track.subtitle')}
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
                                placeholder="e.g. CMP-GV-202609-0001 or 9876543210"
                                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm font-semibold transition-all"
                            />
                        </div>
                        <Button
                            onClick={() => handleSearch()}
                            loading={loading}
                            leftIcon={<Search className="w-4 h-4 stroke-[2.5]" />}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition"
                        >
                            {t('track.searchButton')}
                        </Button>
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
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">{complaint.complaintNumber}</p>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            LIVE STREAM
                                        </span>
                                        {(complaint.externalTicketId || complaint.external_ticket_id) && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200" title="Federated with external municipal operations">
                                                <span>🌐</span> {complaint.externalTicketId || complaint.external_ticket_id}
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-black text-gray-950 mt-1">{complaint.title}</h2>
                                </div>
                                <StatusBadge status={complaint.status} />
                            </div>

                            {(complaint.externalTicketId || complaint.external_ticket_id) && (
                                <div className="mb-5 p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">🏛️</span>
                                        <div>
                                            <p className="font-bold">Federated with City Operations Command (ICCC)</p>
                                            <p className="text-indigo-700 font-mono text-[11px]">External Case Reference: {complaint.externalTicketId || complaint.external_ticket_id}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-indigo-100 font-semibold rounded text-[10px] border border-indigo-200 uppercase">
                                        {complaint.integrationStatus || complaint.integration_status || 'SYNCED'}
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3.5 mb-5">
                                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('track.priority')}</p>
                                    <div className="mt-1.5"><PriorityBadge priority={complaint.priority} /></div>
                                </div>
                                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('track.slaDeadline')}</p>
                                    <p className={cn("text-sm font-extrabold mt-1.5", sla?.color)}>{sla?.label}</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('track.department')}</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{complaint.assignedDept || "Pending Assignment"}</p>
                                </div>
                                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <User className="w-3.5 h-3.5 text-emerald-600" />
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{t('track.assignedOfficer')}</p>
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
                                {t('citizen.getDirections')}
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

                        {/* 72-Hour Citizen Resolution Confirmation & Rating Card */}
                        {(complaint.status?.toLowerCase() === "resolved" || complaint.status === "RESOLVED") && (
                            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-lg shadow-emerald-600/10 space-y-5 animate-slide-up">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-emerald-950">Resolution Confirmation Required</h3>
                                            <p className="text-xs text-emerald-700">72-hour citizen verification window active</p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                        Action Needed
                                    </span>
                                </div>

                                {/* Resolution Evidence Preview */}
                                {(complaint.resolutionEvidenceUrl || complaint.resolution_evidence_url) && (
                                    <div className="bg-white/80 border border-emerald-200 rounded-2xl p-4 space-y-2">
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Field Execution Proof:</p>
                                        <div className="aspect-video max-h-48 rounded-xl overflow-hidden border border-emerald-100 bg-slate-100">
                                            <img
                                                src={complaint.resolutionEvidenceUrl || complaint.resolution_evidence_url}
                                                alt="Work resolution proof"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {(complaint.resolutionNotes || complaint.resolution_notes) && (
                                            <p className="text-xs text-gray-600 italic bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                                                "{complaint.resolutionNotes || complaint.resolution_notes}"
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Rating Selection */}
                                <div className="bg-white rounded-2xl p-4 border border-emerald-200 space-y-3">
                                    <p className="text-xs font-bold text-gray-900">
                                        Was your issue resolved satisfactorily? Rate your experience:
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="p-1 text-gray-300 hover:scale-110 transition cursor-pointer"
                                            >
                                                <Star
                                                    className={cn(
                                                        "w-7 h-7 transition-colors",
                                                        (hoverRating || rating) >= star
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "text-gray-300"
                                                    )}
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-xs font-bold text-gray-700">
                                            {rating === 5 ? "Excellent (5/5)" :
                                             rating === 4 ? "Good (4/5)" :
                                             rating === 3 ? "Satisfactory (3/5)" :
                                             rating === 2 ? "Needs Improvement (2/5)" : "Poor (1/5)"}
                                        </span>
                                    </div>

                                    {/* Feedback text */}
                                    <input
                                        type="text"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Optional: Add feedback about the work quality..."
                                        className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowContestModal(true)}
                                        className="text-xs font-bold text-rose-600 hover:text-rose-700 underline underline-offset-4 flex items-center gap-1 cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Issue Persists? File Contest & Reopen
                                    </button>

                                    <Button
                                        onClick={handleConfirmResolution}
                                        loading={confirming}
                                        leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20"
                                    >
                                        Confirm Resolution & Close
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Closed Certified Card */}
                        {(complaint.status?.toLowerCase() === "closed" || complaint.status === "CLOSED") && (
                            <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl p-5 sm:p-6 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-extrabold text-emerald-950">Resolution Certified & Closed</p>
                                        {complaint.citizenRating && (
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(complaint.citizenRating)].map((_, i) => (
                                                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-emerald-800 leading-relaxed">
                                        This complaint has been verified and permanently closed.
                                        {complaint.citizenFeedback && ` Citizen feedback: "${complaint.citizenFeedback}"`}
                                    </p>
                                </div>
                            </div>
                        )}


                        {/* Unified Timeline with Inline Photos & Rework Continuation */}
                        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
                            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div>
                                    <h3 className="font-extrabold text-gray-950 text-base">{t('track.timeline')}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">End-to-end lifecycle verification with on-ground photographic evidence</p>
                                </div>
                                {complaint.status && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        {complaint.status.replace(/_/g, ' ')}
                                    </span>
                                )}
                            </div>

                            {/* Timeline Steps */}
                            {(() => {
                                const steps = buildTimelineSteps(complaint, auditTimeline);

                                if (timelineLoading && steps.length === 0) {
                                    return (
                                        <div className="py-12 text-center space-y-3">
                                            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
                                            <p className="text-xs font-bold text-gray-500">Loading live complaint timeline...</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-0">
                                        {steps.map((step, idx) => {
                                            const isLast = idx === steps.length - 1;
                                            const isSuccess = step.type === 'success';
                                            const isRework = step.type === 'rework';
                                            const isMLA = step.type === 'mla';
                                            const isPending = step.type === 'pending';

                                            return (
                                                <div key={step.id} className="flex items-start gap-4">
                                                    {/* Left: Icon Circle + Connecting Line */}
                                                    <div className="flex flex-col items-center flex-shrink-0">
                                                        <div
                                                            className={cn(
                                                                "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                                                                isSuccess && "bg-emerald-600 text-white shadow-md shadow-emerald-600/25",
                                                                isRework && "bg-amber-500 text-white ring-4 ring-amber-100 shadow-md shadow-amber-500/25",
                                                                isMLA && "bg-indigo-600 text-white shadow-md shadow-indigo-600/25",
                                                                isPending && "bg-gray-100 text-gray-400"
                                                            )}
                                                        >
                                                            {isSuccess && <CheckCircle2 className="w-5 h-5 text-white" />}
                                                            {isRework && <RotateCcw className="w-4 h-4 text-white" />}
                                                            {isMLA && <Building2 className="w-4 h-4 text-white" />}
                                                            {isPending && <Clock className="w-4 h-4 text-gray-400" />}
                                                        </div>
                                                        {!isLast && (
                                                            <div
                                                                className={cn(
                                                                    "w-0.5 my-1 min-h-[44px] flex-1",
                                                                    isSuccess && "bg-emerald-500",
                                                                    isRework && "bg-amber-400",
                                                                    isMLA && "bg-indigo-400",
                                                                    isPending && "bg-gray-200"
                                                                )}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Right: Step Details Card */}
                                                    <div className={cn("pb-8 flex-1 min-w-0", isLast && "pb-2")}>
                                                        <div className="flex items-start justify-between gap-2 flex-wrap">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p
                                                                    className={cn(
                                                                        "text-sm font-black tracking-tight",
                                                                        isSuccess && "text-emerald-950",
                                                                        isRework && "text-amber-950",
                                                                        isMLA && "text-indigo-950",
                                                                        isPending && "text-gray-400"
                                                                    )}
                                                                >
                                                                    {step.title}
                                                                </p>
                                                                {step.badge && (
                                                                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", step.badge.color)}>
                                                                        {step.badge.text}
                                                                    </span>
                                                                )}
                                                                {isLast && complaint.status !== 'closed' && (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                                                                        CURRENT
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {step.timestamp && (
                                                                <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                                                                    {new Date(step.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {step.actor && (
                                                            <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                                                                By {step.actor}
                                                            </p>
                                                        )}

                                                        {step.description && (
                                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                                                {step.description}
                                                            </p>
                                                        )}

                                                        {/* Note Box */}
                                                        {step.note && (
                                                            <div
                                                                className={cn(
                                                                    "mt-2 p-3 rounded-xl text-xs border leading-relaxed",
                                                                    isRework
                                                                        ? "bg-amber-50/90 border-amber-200 text-amber-950 font-medium"
                                                                        : "bg-emerald-50/70 border-emerald-100 text-emerald-950"
                                                                )}
                                                            >
                                                                {step.noteLabel && (
                                                                    <span className="font-bold block text-[10px] uppercase tracking-wider opacity-75 mb-0.5">
                                                                        {step.noteLabel}:
                                                                    </span>
                                                                )}
                                                                &ldquo;{step.note}&rdquo;
                                                            </div>
                                                        )}

                                                        {/* Inline Image Attachment Preview */}
                                                        {step.imageUrl && (
                                                            <div
                                                                onClick={() => setPreviewImage({ url: step.imageUrl!, title: step.imageTitle || step.title })}
                                                                className="group mt-3 rounded-2xl overflow-hidden border border-gray-200/90 bg-slate-50 max-w-md shadow-sm hover:shadow-md transition-all cursor-pointer"
                                                            >
                                                                <div className="relative aspect-video max-h-52 w-full overflow-hidden bg-slate-900/5">
                                                                    <img
                                                                        src={step.imageUrl}
                                                                        alt={step.imageTitle || "Timeline proof photo"}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                        loading="lazy"
                                                                    />
                                                                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1.5 shadow">
                                                                        <Camera className="w-3 h-3 text-emerald-400" />
                                                                        <span>{step.imageTitle || "Photo Evidence"}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="px-3 py-2 bg-white/90 backdrop-blur-sm border-t border-gray-100 flex items-center justify-between text-xs">
                                                                    <span className="text-[11px] text-gray-500 font-medium">Verified On-Ground Capture</span>
                                                                    <span className="text-[11px] text-emerald-700 font-bold group-hover:underline flex items-center gap-1">
                                                                        Click to view full photo &rarr;
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Help */}
                        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-extrabold text-emerald-950">{t('track.contactSupport')}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{t('track.supportHint')}: <strong className="text-emerald-800 font-bold">1800-425-CIVIC</strong></p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contest & Reopen Modal (Mandatory Photo Proof Protocol) */}
                {showContestModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                                        <RotateCcw className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-gray-950">Contest Resolution</h3>
                                        <p className="text-xs text-gray-500">72-Hour False-Closure Prevention Protocol</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowContestModal(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed">
                                If the reported civic issue was not completely resolved on the ground, municipal governance policy allows you to contest within 72 hours. A fresh photograph showing the persistent issue is mandatory to prevent false closures.
                            </p>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-800">
                                    Why does the issue persist? <span className="text-rose-500">* (Min 10 characters)</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={contestReason}
                                    onChange={(e) => setContestReason(e.target.value)}
                                    placeholder="e.g. Debris remains scattered on the pedestrian walkway, only large stones were moved..."
                                    className="w-full p-3 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-800">
                                    Upload Fresh Photo Proof <span className="text-rose-500">* (Mandatory)</span>
                                </label>
                                <div className="border-2 border-dashed border-gray-300 hover:border-rose-400 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-rose-50/20 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                const file = e.target.files[0];
                                                setContestFile(file);
                                                setContestPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    {contestPreview ? (
                                        <div className="relative aspect-video max-h-36 mx-auto rounded-lg overflow-hidden border border-rose-200">
                                            <img src={contestPreview} alt="Contest proof preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <Camera className="w-7 h-7 text-gray-400 mx-auto" />
                                            <p className="text-xs font-bold text-gray-700">Click to upload photo of persistent issue</p>
                                            <p className="text-[11px] text-gray-400">JPG, PNG up to 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowContestModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    loading={reopening}
                                    onClick={handleReopenComplaint}
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5"
                                >
                                    Submit Contest & Reopen
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lightbox / Modal for Viewing Timeline Photos */}
                {previewImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in"
                        onClick={() => setPreviewImage(null)}
                    >
                        <div
                            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-white/20 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 bg-gray-950 text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-emerald-400" />
                                    <p className="text-sm font-bold">{previewImage.title}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={previewImage.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-emerald-400 hover:text-emerald-300 underline font-semibold"
                                    >
                                        Open full resolution &rarr;
                                    </a>
                                    <button
                                        onClick={() => setPreviewImage(null)}
                                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3 bg-black flex items-center justify-center max-h-[75vh]">
                                <img
                                    src={previewImage.url}
                                    alt={previewImage.title}
                                    className="max-h-[70vh] max-w-full object-contain rounded-xl"
                                />
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
