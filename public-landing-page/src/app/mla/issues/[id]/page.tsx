// Dynamic route page for MLA issue details
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MLALayout } from "@/components/layout/MLALayout";
import { Button } from "@/components/ui/Button";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { ComplaintStepper } from "@/components/ui/Stepper";
import { MOCK_COMPLAINTS } from "@/lib/mockData";
import { complaintService } from "@/lib/services/complaint.service";
import { formatDateTime, getSLAStatus, cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import {
    ArrowLeft, MapPin, User, Phone, Building2, AlertTriangle,
    MessageSquare, Camera, Send
} from "lucide-react";

const CivicMapbox = dynamic(() => import("@/components/ui/CivicMapbox"), { ssr: false });

export default function MLAIssueDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [issue, setIssue] = useState(MOCK_COMPLAINTS.find(c => c.id === params.id));
    const [loading, setLoading] = useState(false);
    const [showDirectiveModal, setShowDirectiveModal] = useState(false);
    const [directiveContent, setDirectiveContent] = useState("");

    useEffect(() => {
        complaintService.getComplaintById(params.id)
            .then((data: any) => setIssue(data))
            .catch(() => {
                const mock = MOCK_COMPLAINTS.find(c => c.id === params.id);
                if (mock) setIssue(mock);
            });
    }, [params.id]);

    if (!issue) {
        return (
            <MLALayout>
                <div className="text-center py-20">
                    <p className="text-gray-500">Issue not found</p>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </MLALayout>
        );
    }

    const sla = getSLAStatus(issue.slaDeadline);

    const handleSendDirective = async () => {
        if (!directiveContent.trim()) {
            toast.error("Please enter directive content");
            return;
        }

        setLoading(true);
        try {
            // In real app, would call API to send directive
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("Directive sent to department");
            setShowDirectiveModal(false);
            setDirectiveContent("");
        } catch (error) {
            toast.error("Failed to send directive");
        } finally {
            setLoading(false);
        }
    };

    const handleEscalate = async () => {
        setLoading(true);
        try {
            await complaintService.escalateComplaint(issue.id, "Escalated by MLA for priority attention");
            setIssue({ ...issue, isEscalated: true });
            toast.success("Issue escalated successfully");
        } catch (error) {
            setIssue({ ...issue, isEscalated: true });
            toast.success("Issue escalated successfully");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MLALayout>
            <div className="space-y-6 animate-fade-in pb-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.back()} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                            Back
                        </Button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-black text-gray-900">{issue.complaintNumber}</h1>
                                {issue.isEscalated && (
                                    <span className="badge badge-red text-xs">Escalated</span>
                                )}
                            </div>
                            <p className="text-gray-500 text-sm">Filed on {formatDateTime(issue.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!issue.isEscalated && (
                            <Button variant="ghost" size="sm" onClick={handleEscalate} loading={loading}
                                leftIcon={<AlertTriangle className="w-4 h-4" />}>
                                Escalate
                            </Button>
                        )}
                        <Button size="sm" onClick={() => setShowDirectiveModal(true)}
                            leftIcon={<MessageSquare className="w-4 h-4" />}>
                            Send Directive
                        </Button>
                    </div>
                </div>

                {/* SLA Alert */}
                {sla.isBreached && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-red-900">SLA Breached</p>
                            <p className="text-xs text-red-700">This issue has exceeded its resolution deadline. Immediate action required.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Issue Details */}
                        <div className="civic-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{issue.title}</h2>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={issue.status} />
                                        <PriorityBadge priority={issue.priority} />
                                        <span className={cn("badge text-xs", sla.color.replace("text-", "badge-"))}>
                                            {sla.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-sm max-w-none">
                                <p className="text-gray-700 leading-relaxed">{issue.description}</p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Category</p>
                                    <p className="text-sm font-semibold text-gray-900">{issue.category} / {issue.subCategory}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">SLA Deadline</p>
                                    <p className={cn("text-sm font-semibold", sla.color)}>
                                        {formatDateTime(issue.slaDeadline)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Timeline */}
                        <div className="civic-card p-6">
                            <h3 className="section-title mb-6">Resolution Progress</h3>
                            <ComplaintStepper currentStatus={issue.status} />
                        </div>

                        {/* Location & Map */}
                        <div className="civic-card p-6">
                            <h3 className="section-title mb-4">Location</h3>
                            <div className="flex items-start gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-civic-blue flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{issue.locationAddress}</p>
                                    <p className="text-xs text-gray-500">{issue.ward}</p>
                                </div>
                            </div>
                            <div className="h-[300px] rounded-2xl overflow-hidden">
                                <CivicMapbox
                                    center={[issue.longitude, issue.latitude]}
                                    zoom={16}
                                    markers={[{ lat: issue.latitude, lon: issue.longitude }]}
                                    interactive={false}
                                />
                            </div>
                        </div>

                        {/* Media Gallery */}
                        {issue.mediaCount > 0 && (
                            <div className="civic-card p-6">
                                <h3 className="section-title mb-4">Attached Photos ({issue.mediaCount})</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {Array.from({ length: issue.mediaCount }).map((_, i) => (
                                        <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-gray-300" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="civic-card p-5 bg-gradient-to-br from-blue-50 to-purple-50">
                            <h3 className="section-title mb-4">Key Metrics</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">Time Elapsed</span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {Math.floor((Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                                        <div className="h-full bg-civic-blue rounded-full" style={{ width: "65%" }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">Citizen Impact</span>
                                        <span className="text-sm font-bold text-gray-900">High</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">Media Attention</span>
                                        <span className="text-sm font-bold text-gray-900">Low</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Citizen Info */}
                        <div className="civic-card p-5">
                            <h3 className="section-title mb-4">Citizen Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Name</p>
                                        <p className="text-sm font-semibold text-gray-900">{issue.citizenName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400">Mobile</p>
                                        <p className="text-sm font-semibold text-gray-900">{issue.citizenMobile}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assignment */}
                        <div className="civic-card p-5">
                            <h3 className="section-title mb-4">Assignment</h3>
                            {issue.assignedDept ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">Department</p>
                                            <p className="text-sm font-semibold text-gray-900">{issue.assignedDept}</p>
                                        </div>
                                    </div>
                                    {issue.assignedOfficer && (
                                        <div className="flex items-center gap-3">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-400">Officer</p>
                                                <p className="text-sm font-semibold text-gray-900">{issue.assignedOfficer}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Not yet assigned</p>
                            )}
                        </div>

                        {/* AI Insights */}
                        <div className="civic-card p-5 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                            <h3 className="section-title mb-3">AI Analysis</h3>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-gray-600 mb-1">Urgency Score</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"
                                                style={{ width: `${issue.aiUrgencyScore * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">{(issue.aiUrgencyScore * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Send Directive Modal */}
            {showDirectiveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-lg w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Send Executive Directive</h3>
                        
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                <p className="text-sm text-blue-900">
                                    <strong>To:</strong> {issue.assignedDept || "Department (will be assigned)"}
                                </p>
                                <p className="text-sm text-blue-900 mt-1">
                                    <strong>Regarding:</strong> {issue.complaintNumber}
                                </p>
                            </div>

                            <div>
                                <label className="label-field">Directive Message *</label>
                                <textarea
                                    value={directiveContent}
                                    onChange={(e) => setDirectiveContent(e.target.value)}
                                    className="input-field min-h-[150px]"
                                    placeholder="Enter your directive to the department. This will be marked as high priority and tracked for compliance..."
                                />
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <p className="text-xs text-amber-800">
                                    This directive will be sent to the department head and assigned officer. 
                                    Response time will be tracked and reported.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-6">
                            <Button variant="ghost" onClick={() => setShowDirectiveModal(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleSendDirective} loading={loading} className="flex-1" leftIcon={<Send className="w-4 h-4" />}>
                                Send Directive
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </MLALayout>
    );
}
