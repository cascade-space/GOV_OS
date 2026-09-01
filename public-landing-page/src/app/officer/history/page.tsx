"use client";
import { OfficerLayout } from "@/components/layout/OfficerLayout";
import { StatusBadge } from "@/components/ui/Badge";
import { MOCK_COMPLAINTS } from "@/lib/mockData";
import { formatDate, cn } from "@/lib/utils";
import { CheckCircle2, MapPin, Camera, Clock } from "lucide-react";
import Link from "next/link";

export default function OfficerHistoryPage() {
    const resolved = MOCK_COMPLAINTS.filter((c) => ["resolved", "closed", "quality_check"].includes(c.status));
    const monthlyTotal = resolved.filter(c => new Date(c.createdAt).getMonth() === new Date().getMonth()).length;

    return (
        <OfficerLayout>
            <div className="space-y-6 animate-fade-in pb-8">
                <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Task History</h1>
                    <p className="text-gray-500 text-sm">Review your completed works and contributions</p>
                </div>

                {/* Monthly Performance Summary */}
                <div className="bg-gradient-civic rounded-3xl p-5 text-white shadow-glow-blue flex items-center justify-between overflow-hidden relative">
                    <div className="relative z-10">
                        <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Achievements</p>
                        <h3 className="text-2xl font-black">{monthlyTotal} Tasks Completed</h3>
                        <p className="text-blue-100/80 text-xs mt-1">Great job! You're in the top 10% of field officers.</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center relative z-10">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                </div>

                {resolved.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <Clock className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No completed tasks yet</p>
                        <Link href="/officer/dashboard" className="text-civic-blue text-sm font-bold mt-2 hover:underline inline-block">View Active Tasks</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Activity</h2>
                            <button className="text-[10px] font-black text-civic-blue uppercase hover:underline">Download Log</button>
                        </div>
                        {resolved.map((c, i) => (
                            <div key={`${c.id}-${i}`} className="civic-card p-5 hover:border-civic-blue/30 transition-all group">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{c.complaintNumber}</span>
                                            <span className={cn(
                                                "badge text-[10px]",
                                                c.status === "resolved" ? "badge-green" : "badge-blue"
                                            )}>{c.status.replace('_', ' ')}</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-civic-blue transition-colors leading-snug">{c.title}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Resolved On</p>
                                        <p className="text-xs font-bold text-gray-700">{formatDate(c.createdAt)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-gray-300" /> {c.ward}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Camera className="w-3.5 h-3.5 text-gray-300" /> {c.mediaCount} Photos
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2].map(n => (
                                            <div key={n} className="w-6 h-6 rounded-lg bg-gray-100 border-2 border-white overflow-hidden shadow-sm">
                                                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                                            </div>
                                        ))}
                                    </div>
                                    <Link href={`/officer/tasks/${c.id}`} className="text-[11px] font-black text-civic-blue uppercase hover:tracking-wider transition-all">View Details →</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </OfficerLayout>
    );
}
