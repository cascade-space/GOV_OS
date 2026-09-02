"use client";
import React, { useState } from "react";
import { CheckCircle2, Clock, ShieldCheck, Eye, MapPin, UserCheck } from "lucide-react";

interface EvidenceViewerProps {
    beforePhoto?: string;
    afterPhoto?: string;
    resolvedAt?: string;
    verifiedAt?: string;
    officerName?: string;
    departmentName?: string;
    resolutionNotes?: string;
    verificationNotes?: string;
    rating?: number;
}

export function EvidenceViewer({
    beforePhoto,
    afterPhoto,
    resolvedAt,
    verifiedAt,
    officerName = "Assigned Field Officer",
    departmentName = "Public Works Department",
    resolutionNotes = "Work successfully executed on-site according to civic standard specifications. Ground area cleaned and inspected.",
    verificationNotes = "Resolution independently audited and verified for quality compliance.",
    rating = 5,
}: EvidenceViewerProps) {
    const [selectedTab, setSelectedTab] = useState<"comparison" | "details">("comparison");

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-base text-white">Resolution & Quality Verification</h4>
                        <p className="text-xs text-slate-300">Verified Evidence & On-Ground Completion Proof</p>
                    </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Completed</span>
                </div>
            </div>

            {/* Toggle Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
                <button
                    type="button"
                    onClick={() => setSelectedTab("comparison")}
                    className={`pb-2.5 px-4 text-xs font-medium transition-all border-b-2 ${
                        selectedTab === "comparison"
                            ? "border-blue-600 text-blue-600 font-semibold"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    Visual Comparison (Before & After)
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTab("details")}
                    className={`pb-2.5 px-4 text-xs font-medium transition-all border-b-2 ${
                        selectedTab === "details"
                            ? "border-blue-600 text-blue-600 font-semibold"
                            : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                    Officer Action & Audit Logs
                </button>
            </div>

            {/* Tab 1: Visual Comparison */}
            {selectedTab === "comparison" && (
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Before Photo */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                <span className="inline-flex items-center gap-1.5 text-rose-600">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                    Initial Reported State (Before)
                                </span>
                                <span className="text-slate-400">Citizen Submission</span>
                            </div>
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                                <img
                                    src={beforePhoto || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80"}
                                    alt="Before Resolution"
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                                    Reported Issue
                                </div>
                            </div>
                        </div>

                        {/* After Photo */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                <span className="inline-flex items-center gap-1.5 text-emerald-600">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Completed & Repaired (After)
                                </span>
                                <span className="text-slate-400">Field Officer Proof</span>
                            </div>
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-emerald-200 group">
                                <img
                                    src={afterPhoto || "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&q=80"}
                                    alt="After Resolution"
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified Resolved
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Box */}
                    <div className="bg-slate-50 rounded-xl p-3.5 sm:p-4 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="space-y-0.5">
                            <span className="font-semibold text-slate-900">Officer Note: </span>
                            <span className="text-slate-600">{resolutionNotes}</span>
                        </div>
                        {resolvedAt && (
                            <div className="text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {resolvedAt}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab 2: Action & Audit Details */}
            {selectedTab === "details" && (
                <div className="p-4 sm:p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-slate-400 font-medium">Executing Department</span>
                            <p className="font-semibold text-slate-800">{departmentName}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <span className="text-slate-400 font-medium">Field Response Officer</span>
                            <p className="font-semibold text-slate-800">{officerName}</p>
                        </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-200 pt-3">
                        <h5 className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            Supervisor Verification & Quality Sign-off
                        </h5>
                        <p className="text-slate-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                            {verificationNotes}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
