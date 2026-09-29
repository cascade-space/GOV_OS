// Dynamic route page for officer task details
// generateStaticParams required for output: 'export' — returns empty array since data is fetched client-side
export async function generateStaticParams() {
    return [];
}

"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter, useParams } from "next/navigation";
import { OfficerLayout } from "@/components/layout/OfficerLayout";
import { Button } from "@/components/ui/Button";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { complaintService } from "@/lib/services/complaint.service";
import { formatDateTime, getSLAStatus, cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import {
    ArrowLeft, MapPin, Calendar, User, Phone, Clock, AlertTriangle,
    CheckCircle2, Camera, Upload, X, MessageSquare, Navigation, Play, CheckCheck, RefreshCw, SwitchCamera,
    History, FileText
} from "lucide-react";

const CivicMapbox = dynamic(() => import("@/components/ui/CivicMapbox"), { ssr: false });

export default function TaskDetailPage({ params }: { params?: Promise<{ id: string }> | { id: string } }) {
    const router = useRouter();
    const routeParams = useParams();
    const resolvedParams = params ? (typeof (params as any).then === "function" ? use(params as Promise<{ id: string }>) : params) : null;
    const rawId = (routeParams?.id as string) || (resolvedParams && typeof resolvedParams.id === 'string' ? resolvedParams.id : '');
    const taskId = typeof rawId === 'string' ? rawId.trim() : '';

    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [workNote, setWorkNote] = useState("");
    const [proofPhotos, setProofPhotos] = useState<File[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);

    // Camera state
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
    const [cameraLoading, setCameraLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
        setCameraLoading(true);
        try {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }

            if (!navigator?.mediaDevices?.getUserMedia) {
                cameraInputRef.current?.click();
                setCameraLoading(false);
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facing,
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                },
                audio: false,
            });

            setCameraStream(stream);
            setIsCameraActive(true);
            setCameraFacingMode(facing);

            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(e => console.warn("Video playback warning:", e));
                }
            }, 100);
        } catch (err: any) {
            console.warn("Camera stream request failed, triggering native device capture:", err);
            cameraInputRef.current?.click();
            toast("Opening device camera...", { icon: "📷" });
        } finally {
            setCameraLoading(false);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setIsCameraActive(false);
    };

    const switchCamera = () => {
        const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
        startCamera(nextMode);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Stamp geo-proof watermark
        const timestamp = new Date().toLocaleString("en-IN");
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(`GovOS Field Proof • ${task?.complaintNumber || 'CMP'} • ${timestamp}`, 20, canvas.height - 14);

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `after-fix-${Date.now()}.jpg`, { type: 'image/jpeg' });
                setProofPhotos(prev => [...prev, file].slice(0, 5));
                toast.success("Photo captured from camera!");
                stopCamera();
            }
        }, 'image/jpeg', 0.92);
    };

    const handleNativeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setProofPhotos(prev => [...prev, file].slice(0, 5));
            toast.success("Photo attached from camera!");
        }
    };

    useEffect(() => {
        if (!taskId) {
            setLoading(false);
            return;
        }

        let isCancelled = false;
        const fetchTask = async () => {
            setLoading(true);
            try {
                let data: any;
                if (taskId.toUpperCase().startsWith("CMP-")) {
                    data = await complaintService.getComplaintByNumber(taskId);
                } else {
                    data = await complaintService.getComplaintById(taskId);
                }
                if (!isCancelled) setTask(data);
            } catch (err: any) {
                console.error("Failed to load task:", err);
                if (!isCancelled) setTask(null);
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        fetchTask();
        return () => { isCancelled = true; };
    }, [taskId]);

    // Fetch audit timeline (separate effect, non-blocking)
    useEffect(() => {
        if (!taskId) return;
        const fetchTimeline = async () => {
            try {
                const res: any = await complaintService.getComplaintTimeline(taskId);
                const events = Array.isArray(res) ? res : (res?.data || []);
                setTimeline(events);
            } catch (err) {
                console.warn('Timeline fetch failed (non-critical):', err);
            }
        };
        fetchTimeline();
    }, [taskId]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setProofPhotos(prev => [...prev, ...acceptedFiles].slice(0, 5));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
        maxFiles: 5,
    });

    const removePhoto = (index: number) => {
        setProofPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleStartWork = async () => {
        if (!task) return;
        setActionLoading(true);
        try {
            await complaintService.startWork(task.id);
            setTask({ ...task, status: "IN_PROGRESS" });
            toast.success("Work started! Status changed to In Progress.");
        } catch (error: any) {
            console.error("Start work error:", error);
            toast.error("Failed to start work: " + (error?.response?.data?.message || error?.message || "Error"));
        } finally {
            setActionLoading(false);
        }
    };

    const handleCompleteWork = async () => {
        if (!task) return;
        if (!workNote.trim()) {
            toast.error("Please add resolution notes explaining the fix.");
            return;
        }

        setActionLoading(true);
        try {
            let evidenceUrl = "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=800"; // default civic proof if no file
            if (proofPhotos.length > 0) {
                const uploadRes = await complaintService.uploadFile(proofPhotos[0]);
                if (uploadRes.success && uploadRes.url) {
                    evidenceUrl = uploadRes.url;
                }
            }

            await complaintService.completeWork(task.id, {
                resolutionNotes: workNote.trim(),
                resolutionEvidenceUrl: evidenceUrl,
                resolutionLatitude: task.latitude,
                resolutionLongitude: task.longitude,
            });

            setTask({
                ...task,
                status: "WORK_COMPLETED",
                resolutionNotes: workNote.trim(),
                resolutionEvidenceUrl: evidenceUrl,
            });
            toast.success("Work completed and evidence submitted for QC review!");
            setShowCompleteModal(false);
            setWorkNote("");
            setProofPhotos([]);
        } catch (error: any) {
            console.error("Complete work error:", error);
            toast.error("Failed to submit work completion: " + (error?.response?.data?.message || error?.message || "Error"));
        } finally {
            setActionLoading(false);
        }
    };

    const openInMaps = () => {
        if (!task) return;
        const url = `https://www.google.com/maps?q=${task.latitude},${task.longitude}`;
        window.open(url, '_blank');
    };

    if (loading) {
        return (
            <OfficerLayout>
                <div className="flex items-center justify-center py-32">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-civic-blue border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-500 font-medium text-sm">Loading task details...</p>
                    </div>
                </div>
            </OfficerLayout>
        );
    }

    if (!task) {
        return (
            <OfficerLayout>
                <div className="text-center py-20">
                    <p className="text-gray-500 font-medium">Task not found in GovOS database</p>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </OfficerLayout>
        );
    }

    const sla = getSLAStatus(task.slaDeadline);
    const statusUpper = task.status?.toUpperCase() || "";
    const isRework = ["REWORK_REQUIRED", "REOPENED"].includes(statusUpper);
    const isAssigned = ["ASSIGNED", "SUBMITTED"].includes(statusUpper);
    const isInProgress = statusUpper === "IN_PROGRESS";
    const isCompleted = ["WORK_COMPLETED", "RESOLVED", "CLOSED"].includes(statusUpper) && !isRework;

    return (
        <OfficerLayout>
            <div className="space-y-6 animate-fade-in pb-8">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                            Back
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-xl font-black text-gray-900">{task.complaintNumber}</h1>
                                {task.isEscalated && <span className="badge badge-red text-xs">Escalated</span>}
                            </div>
                            <p className="text-gray-500 text-sm">Assigned on {formatDateTime(task.createdAt)}</p>
                        </div>
                    </div>

                    {/* Officer Action Buttons */}
                    <div className="flex items-center gap-3">
                        {isAssigned && (
                            <Button
                                onClick={handleStartWork}
                                loading={actionLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                leftIcon={<Play className="w-4 h-4" />}
                            >
                                Start Work
                            </Button>
                        )}
                        {isRework && (
                            <>
                                <Button
                                    onClick={handleStartWork}
                                    loading={actionLoading}
                                    variant="outline"
                                    size="sm"
                                    className="border-amber-400 text-amber-800 hover:bg-amber-100"
                                    leftIcon={<Play className="w-4 h-4" />}
                                >
                                    Start Rework
                                </Button>
                                <Button
                                    onClick={() => setShowCompleteModal(true)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                    leftIcon={<CheckCheck className="w-4 h-4" />}
                                >
                                    Submit Rework Proof
                                </Button>
                            </>
                        )}
                        {isInProgress && (
                            <Button
                                onClick={() => setShowCompleteModal(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                leftIcon={<CheckCheck className="w-4 h-4" />}
                            >
                                {task.reworkReason ? "Submit Rework Proof" : "Complete Work & Submit Proof"}
                            </Button>
                        )}
                        {isCompleted && (
                            <span className="badge badge-green py-2 px-3 text-sm font-semibold">
                                Work Submitted for QC
                            </span>
                        )}
                    </div>
                </div>

                {/* Supervisor / Citizen Rework Alert */}
                {task.reworkReason && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <RefreshCw className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-spin-slow" />
                            <div>
                                <p className="text-sm font-bold text-amber-900">
                                    {task.reworkReason.startsWith('Citizen contested') ? 'Citizen Contested Resolution' : 'Rework Requested by Municipal Supervisor'}
                                </p>
                                <p className="text-sm text-amber-800 mt-1">{task.reworkReason}</p>
                                <p className="text-xs text-amber-600 mt-1 font-medium">Please re-verify the location, address the deficiencies, and re-submit resolution proof.</p>
                            </div>
                        </div>
                        {isRework && (
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <Button
                                    onClick={() => setShowCompleteModal(true)}
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto shadow-sm"
                                    leftIcon={<Camera className="w-4 h-4" />}
                                >
                                    Submit Rework Proof
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {sla.isBreached && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-red-900">SLA Breached!</p>
                            <p className="text-xs text-red-700">This task is overdue. Please prioritize immediate resolution.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Issue Overview */}
                        <div className="civic-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h2>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={task.status} />
                                        <PriorityBadge priority={task.priority} />
                                        <span className={cn("badge text-xs", sla.color.replace("text-", "badge-"))}>
                                            {sla.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed">{task.description}</p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Category</p>
                                    <p className="text-sm font-semibold text-gray-900">{task.category} / {task.subCategory || "General"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">SLA Deadline</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDateTime(task.slaDeadline)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Resolution Proof Card (if already submitted) */}
                        {task.resolutionNotes && (
                            <div className="civic-card p-6 border-emerald-300 bg-emerald-50/20">
                                <h3 className="section-title text-emerald-950 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    Submitted Resolution Proof
                                </h3>
                                <p className="text-sm text-gray-800 bg-white p-3.5 rounded-xl border border-emerald-100 mb-4">{task.resolutionNotes}</p>
                                {task.resolutionEvidenceUrl && (
                                    <div className="relative aspect-video max-w-md rounded-xl overflow-hidden border border-emerald-200">
                                        <img src={task.resolutionEvidenceUrl} alt="Resolution Evidence" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Location */}
                        <div className="civic-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="section-title">Site Location</h3>
                                <Button size="sm" variant="outline" onClick={openInMaps} leftIcon={<Navigation className="w-4 h-4" />}>
                                    Open in Google Maps
                                </Button>
                            </div>
                            <div className="flex items-start gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-civic-blue flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{task.locationAddress || "Designated Ward Area"}</p>
                                    <p className="text-xs text-gray-500">{task.ward || "Dharwad Municipal Corporation"}</p>
                                </div>
                            </div>
                            <div className="h-[280px] rounded-2xl overflow-hidden">
                                <CivicMapbox
                                    center={[task.longitude || 75.0078, task.latitude || 15.4589]}
                                    zoom={16}
                                    markers={[{ lat: task.latitude || 15.4589, lon: task.longitude || 75.0078 }]}
                                    interactive={false}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Citizen details & SLA countdown */}
                    <div className="space-y-6">
                        <div className="civic-card p-5">
                            <h3 className="section-title mb-4">Citizen Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Reporter Name</p>
                                        <p className="text-sm font-semibold text-gray-900">{task.citizenName || task.reporterName || "Citizen"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Mobile Number</p>
                                        <p className="text-sm font-semibold text-gray-900">{task.citizenMobile || task.reporterPhone || "Confidential"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="civic-card p-5">
                            <h3 className="section-title mb-4">Target Resolution</h3>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-civic-blue" />
                                <div>
                                    <p className="text-xs text-gray-400">Time Remaining</p>
                                    <p className="text-sm font-bold text-gray-900">{sla.label}</p>
                                </div>
                            </div>
                        </div>

                        {/* Audit Timeline */}
                        <div className="civic-card p-5">
                            <h3 className="section-title mb-4 flex items-center gap-2">
                                <History className="w-4 h-4 text-civic-blue" />
                                Complaint History
                            </h3>
                            {timeline.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4">No history available yet</p>
                            ) : (
                                <ol className="relative border-l border-gray-200 ml-2 space-y-4">
                                    {timeline.map((event: any, idx: number) => {
                                        const isLast = idx === timeline.length - 1;
                                        const action = (event.action || '').replace(/_/g, ' ');
                                        const isReworkEvent = (event.action || '').includes('REOPEN') || (event.action || '').includes('REWORK');
                                        const isResolutionEvent = (event.action || '').includes('RESOLVED') || (event.action || '').includes('WORK_COMPLETED') || (event.action || '').includes('CONFIRM');
                                        const dotColor = isReworkEvent ? 'bg-amber-400' : isResolutionEvent ? 'bg-emerald-500' : isLast ? 'bg-civic-blue' : 'bg-gray-300';
                                        return (
                                            <li key={event.id || idx} className="ml-4">
                                                <span className={`absolute -left-2 mt-1 w-3.5 h-3.5 rounded-full border-2 border-white ${dotColor}`} />
                                                <div className="mb-0.5">
                                                    <span className={`text-xs font-bold ${
                                                        isReworkEvent ? 'text-amber-700' :
                                                        isResolutionEvent ? 'text-emerald-700' : 'text-gray-800'
                                                    }`}>
                                                        {action}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-400">
                                                    {event.actorName || 'System'} &bull;{' '}
                                                    {event.createdAt ? new Date(event.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '–'}
                                                </p>
                                                {event.payload && (
                                                    <p className="text-[11px] text-gray-500 mt-0.5 italic line-clamp-2">{event.payload}</p>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ol>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Complete Work Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {isRework ? "Submit Rework Resolution Proof" : "Complete Work & Submit Proof"}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            {isRework
                                ? "Provide updated details of re-work executed and attach a fresh photograph for municipal verification."
                                : "Provide details of work executed and attach geo-tagged photograph for municipal QC verification."}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="label-field">Work Resolution Notes *</label>
                                <textarea
                                    value={workNote}
                                    onChange={(e) => setWorkNote(e.target.value)}
                                    className="input-field min-h-[120px]"
                                    placeholder="Describe the corrective action taken, crew deployed, materials used, etc."
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="label-field mb-0">After-Fix Photograph *</label>
                                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                                        <Camera className="w-3.5 h-3.5" /> Geo-tagged live proof
                                    </span>
                                </div>

                                {/* Hidden native camera input fallback */}
                                <input
                                    type="file"
                                    ref={cameraInputRef}
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleNativeCapture}
                                    className="hidden"
                                />
                                <canvas ref={canvasRef} className="hidden" />

                                {isCameraActive ? (
                                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center border-2 border-emerald-500 shadow-xl">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Camera Toolbar */}
                                        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                                            <button
                                                type="button"
                                                onClick={switchCamera}
                                                title="Flip camera"
                                                className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={stopCamera}
                                                title="Close camera"
                                                className="p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Shutter Button */}
                                        <div className="absolute bottom-3 inset-x-0 flex items-center justify-center z-10">
                                            <button
                                                type="button"
                                                onClick={capturePhoto}
                                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-xl flex items-center gap-2 transition-all transform active:scale-95"
                                            >
                                                <Camera className="w-5 h-5" />
                                                Capture Photo
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Primary Button: Take Photo with Camera */}
                                        <button
                                            type="button"
                                            onClick={() => startCamera('environment')}
                                            disabled={cameraLoading}
                                            className="w-full py-4 px-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-dashed border-emerald-400 hover:border-emerald-600 rounded-2xl flex items-center justify-center gap-3 text-emerald-800 font-bold transition-all shadow-sm group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                                                <Camera className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-emerald-950">Take Photo with Camera</p>
                                                <p className="text-xs text-emerald-700 font-normal">Opens device camera for immediate on-site capture</p>
                                            </div>
                                        </button>

                                        {/* Dropzone / Upload from Device */}
                                        <div
                                            {...getRootProps()}
                                            className={`border border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                                                isDragActive ? "border-civic-blue bg-blue-50" : "border-gray-200 hover:border-gray-400 bg-gray-50/60"
                                            }`}
                                        >
                                            <input {...getInputProps()} />
                                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                                <Upload className="w-4 h-4 text-gray-400" />
                                                <span>Or click to upload from gallery / computer files</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Attached Photos Preview */}
                                {proofPhotos.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs font-semibold text-gray-700 mb-1.5">Attached Proof ({proofPhotos.length}/5):</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {proofPhotos.map((file, i) => (
                                                <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-video">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`Proof ${i + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removePhoto(i)}
                                                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow transition-all"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-6">
                            <Button variant="ghost" onClick={() => { stopCamera(); setShowCompleteModal(false); }} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleCompleteWork} loading={actionLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                                Submit for QC
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </OfficerLayout>
    );
}
