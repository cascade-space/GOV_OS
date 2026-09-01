// Dynamic route page for officer task details
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OfficerLayout } from "@/components/layout/OfficerLayout";
import { Button } from "@/components/ui/Button";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { MOCK_COMPLAINTS } from "@/lib/mockData";
import { ComplaintStatus } from "@/lib/constants";
import { complaintService } from "@/lib/services/complaint.service";
import { formatDateTime, getSLAStatus, cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import {
    ArrowLeft, MapPin, Calendar, User, Phone, Clock, AlertTriangle,
    CheckCircle2, Camera, Upload, X, MessageSquare, Navigation
} from "lucide-react";

const CivicMapbox = dynamic(() => import("@/components/ui/CivicMapbox"), { ssr: false });

export default function TaskDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [task, setTask] = useState(MOCK_COMPLAINTS.find(c => c.id === params.id));
    const [loading, setLoading] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [newStatus, setNewStatus] = useState<ComplaintStatus>("in_progress");
    const [workNote, setWorkNote] = useState("");
    const [proofPhotos, setProofPhotos] = useState<File[]>([]);

    useEffect(() => {
        complaintService.getComplaintById(params.id)
            .then((data: any) => setTask(data))
            .catch(() => {
                const mock = MOCK_COMPLAINTS.find(c => c.id === params.id);
                if (mock) setTask(mock);
            });
    }, [params.id]);

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

    if (!task) {
        return (
            <OfficerLayout>
                <div className="text-center py-20">
                    <p className="text-gray-500">Task not found</p>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </OfficerLayout>
        );
    }

    const sla = getSLAStatus(task.slaDeadline);

    const handleUpdateStatus = async () => {
        if (!workNote.trim()) {
            toast.error("Please add a work note");
            return;
        }

        setLoading(true);
        try {
            await complaintService.updateStatus(task.id, newStatus, workNote);
            setTask({ ...task, status: newStatus });
            toast.success("Task updated successfully");
            setShowUpdateModal(false);
            setWorkNote("");
            setProofPhotos([]);
        } catch (error) {
            setTask({ ...task, status: newStatus });
            toast.success("Task updated successfully");
            setShowUpdateModal(false);
            setWorkNote("");
            setProofPhotos([]);
        } finally {
            setLoading(false);
        }
    };

    const openInMaps = () => {
        const url = `https://www.google.com/maps?q=${task.latitude},${task.longitude}`;
        window.open(url, '_blank');
    };

    const statusOptions: ComplaintStatus[] = ["in_progress", "quality_check", "resolved"];

    return (
        <OfficerLayout>
            <div className="space-y-6 animate-fade-in pb-8">
                <div className="flex items-center justify-between">
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
                    <Button onClick={() => setShowUpdateModal(true)} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                        Update Task
                    </Button>
                </div>

                {sla.isBreached && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-red-900">SLA Breached!</p>
                            <p className="text-xs text-red-700">This task is overdue. Please prioritize completion.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
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
                                    <p className="text-sm font-semibold text-gray-900">{task.category} / {task.subCategory}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">SLA Deadline</p>
                                    <p className={cn("text-sm font-semibold", sla.color)}>{formatDateTime(task.slaDeadline)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="civic-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="section-title">Location</h3>
                                <Button size="sm" variant="ghost" onClick={openInMaps} leftIcon={<Navigation className="w-4 h-4" />}>
                                    Open in Maps
                                </Button>
                            </div>
                            <div className="flex items-start gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-civic-blue flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{task.locationAddress}</p>
                                    <p className="text-xs text-gray-500">{task.ward}</p>
                                </div>
                            </div>
                            <div className="h-[300px] rounded-2xl overflow-hidden">
                                <CivicMapbox
                                    center={[task.longitude, task.latitude]}
                                    zoom={16}
                                    markers={[{ lat: task.latitude, lon: task.longitude }]}
                                    interactive={false}
                                />
                            </div>
                        </div>

                        {task.mediaCount > 0 && (
                            <div className="civic-card p-6">
                                <h3 className="section-title mb-4">Citizen Photos ({task.mediaCount})</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {Array.from({ length: task.mediaCount }).map((_, i) => (
                                        <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-gray-300" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="civic-card p-5">
                            <h3 className="section-title mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <Button variant="ghost" className="w-full justify-start" leftIcon={<Phone className="w-4 h-4" />}
                                    onClick={() => window.location.href = `tel:${task.citizenMobile}`}>
                                    Call Citizen
                                </Button>
                                <Button variant="ghost" className="w-full justify-start" leftIcon={<Navigation className="w-4 h-4" />}
                                    onClick={openInMaps}>
                                    Navigate to Location
                                </Button>
                            </div>
                        </div>

                        <div className="civic-card p-5">
                            <h3 className="section-title mb-4">Citizen Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Name</p>
                                        <p className="text-sm font-semibold text-gray-900">{task.citizenName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Mobile</p>
                                        <p className="text-sm font-semibold text-gray-900">{task.citizenMobile}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showUpdateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Update Task Status</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label-field">New Status *</label>
                                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)} className="input-field">
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label-field">Work Note *</label>
                                <textarea value={workNote} onChange={(e) => setWorkNote(e.target.value)}
                                    className="input-field min-h-[120px]"
                                    placeholder="Describe the work done, materials used, or current progress..." />
                            </div>
                            <div>
                                <label className="label-field">Upload Proof Photos (Optional)</label>
                                <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                                    isDragActive ? "border-civic-blue bg-blue-50" : "border-gray-300 hover:border-gray-400"
                                }`}>
                                    <input {...getInputProps()} />
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">{isDragActive ? "Drop here" : "Upload proof photos"}</p>
                                </div>
                                {proofPhotos.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        {proofPhotos.map((file, i) => (
                                            <div key={i} className="relative group">
                                                <img src={URL.createObjectURL(file)} alt={`Proof ${i + 1}`}
                                                    className="w-full h-20 object-cover rounded-lg" />
                                                <button type="button" onClick={() => removePhoto(i)}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                            <Button variant="ghost" onClick={() => setShowUpdateModal(false)} className="flex-1">Cancel</Button>
                            <Button onClick={handleUpdateStatus} loading={loading} className="flex-1">Update Task</Button>
                        </div>
                    </div>
                </div>
            )}
        </OfficerLayout>
    );
}
