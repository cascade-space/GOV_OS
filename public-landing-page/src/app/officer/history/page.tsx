"use client";
import { useEffect, useState } from "react";
import { OfficerLayout } from "@/components/layout/OfficerLayout";
import { formatDate, cn } from "@/lib/utils";
import { CheckCircle2, MapPin, Camera, Clock } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api-client";
import { complaintService } from "@/lib/services/complaint.service";

export default function OfficerHistoryPage() {
    const [resolved, setResolved] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResolved = async () => {
            try {
                let all: any[] = [];
                try {
                    const myTasksRes: any = await complaintService.getMyTasks();
                    const myTasks = Array.isArray(myTasksRes) ? myTasksRes : (myTasksRes?.data || []);
                    all.push(...myTasks);
                } catch (e) {
                    console.warn("My tasks fetch failed:", e);
                }

                try {
                    const complaintsRes: any = await api.get('/complaints');
                    const compList = Array.isArray(complaintsRes) ? complaintsRes : (complaintsRes?.data || []);
                    all.push(...compList);
                } catch (e) {
                    console.warn("Complaints fetch failed:", e);
                }

                // Deduplicate by ID
                const uniqueMap = new Map();
                for (const item of all) {
                    if (item?.id && !uniqueMap.has(item.id)) {
                        uniqueMap.set(item.id, item);
                    }
                }
                const deduplicated = Array.from(uniqueMap.values());

                // Include all completed/verified tasks OR any task where resolution evidence was submitted
                const filtered = deduplicated.filter((c: any) => {
                    const st = (c.status || '').toUpperCase();
                    const hasSubmittedWork = Boolean(c.resolutionEvidenceUrl || c.resolutionNotes || c.workCompletedAt);
                    return ["RESOLVED", "CLOSED", "WORK_COMPLETED", "VERIFICATION_PENDING"].includes(st) || hasSubmittedWork;
                });

                setResolved(filtered);
            } catch (err) {
                console.error("Failed to fetch resolved tasks:", err);
                setResolved([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResolved();
    }, []);

    const monthlyTotal = resolved.filter(c => {
        const dateToCheck = c.workCompletedAt || c.resolvedAt || c.createdAt;
        if (!dateToCheck) return false;
        return new Date(dateToCheck).getMonth() === new Date().getMonth();
    }).length;

    return (
        <OfficerLayout>
            <div className="space-y-6 animate-fade-in pb-8">
                <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Task History</h1>
                    <p className="text-gray-500 text-sm">Review your verified works and completed civic resolutions</p>
                </div>

                {/* Monthly Performance Summary */}
                <div className="bg-gradient-civic rounded-3xl p-5 text-white shadow-glow-blue flex items-center justify-between overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Achievements</p>
                        <h3 className="text-2xl font-black">{monthlyTotal} Tasks Completed</h3>
                        <p className="text-blue-100/80 text-xs mt-1">Authoritative municipal record synchronized with HDMC core database.</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center relative z-10">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-civic-blue border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : resolved.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <Clock className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No completed tasks yet</p>
                        <Link href="/officer/dashboard" className="text-civic-blue text-sm font-bold mt-2 hover:underline inline-block">View Active Tasks</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Completed & Verified Works ({resolved.length})</h2>
                        </div>
                        {resolved.map((c, i) => {
                            const st = (c.status || '').toUpperCase();
                            const isReopened = ["REOPENED", "REWORK_REQUIRED"].includes(st);
                            return (
                                <div key={`${c.id}-${i}`} className="civic-card p-5 hover:border-civic-blue/30 transition-all group">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{c.complaintNumber}</span>
                                                <span className={cn(
                                                    "badge text-[10px]",
                                                    isReopened ? "bg-amber-100 text-amber-800 border border-amber-300" :
                                                    ["RESOLVED", "CLOSED"].includes(st) ? "badge-green" : "badge-purple"
                                                )}>
                                                    {isReopened ? "Rework Active (Proof on Record)" : c.status?.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-civic-blue transition-colors leading-snug">{c.title}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Resolution Date</p>
                                            <p className="text-xs font-bold text-gray-700">{formatDate(c.resolvedAt || c.workCompletedAt || c.createdAt)}</p>
                                        </div>
                                    </div>

                                    {c.resolutionNotes && (
                                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-3 line-clamp-2">
                                            <span className="font-semibold text-gray-700">Submitted Proof: </span>
                                            {c.resolutionNotes}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-gray-300" /> {c.locationAddress || "Dharwad Municipal Corporation"}
                                        </div>
                                        {c.resolutionEvidenceUrl && (
                                            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                                                <Camera className="w-3.5 h-3.5" /> Evidence Attached
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <Link href={`/officer/tasks/${c.id}`} className="text-[11px] font-black text-civic-blue uppercase hover:tracking-wider transition-all">
                                            {isReopened ? "Action Rework Now →" : "View Details →"}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </OfficerLayout>
    );
}
