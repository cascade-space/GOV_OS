"use client";
import { MLALayout } from "@/components/layout/MLALayout";
import { MOCK_COMPLAINTS } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDateTime, cn } from "@/lib/utils";
import { MessageSquare, Clock, MapPin, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock directives
const MOCK_DIRECTIVES = [
    {
        id: "dir-1",
        complaintId: "1",
        issueTitle: "Heavy Rain Alert / Drain Blockage",
        targetDept: "Sanitation Department",
        status: "Action Taken",
        content: "Prioritize this drain clearance before the evening بارش rains (prediction: 80% chance). Discard red tape and use emergency funds if needed.",
        date: "2024-02-21T09:00:00Z",
    },
    {
        id: "dir-2",
        complaintId: "2",
        issueTitle: "Road Repair: MG Road",
        targetDept: "Roads & Public Works",
        status: "Pending Response",
        content: "Need a timeline for completion by EOD. Residents are complaining about high dust levels. Use water sprinklers as a temporary mitigation.",
        date: "2024-02-20T14:30:00Z",
    },
    {
        id: "dir-3",
        complaintId: "3",
        issueTitle: "Street Light Faulty",
        targetDept: "Street Lighting",
        status: "Resolved",
        content: "Ensure all lights on this stretch are ledgered and checked. Moving towards 100% lighting in this ward is our priority.",
        date: "2024-02-18T11:20:00Z",
    },
];

export default function MLADirectivesPage() {
    const [directives, setDirectives] = useState(MOCK_DIRECTIVES);

    return (
        <MLALayout>
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Executive Directives</h1>
                        <p className="text-gray-500 text-sm">Monitor action on directives issued to various departments.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {directives.map((dir) => (
                        <div key={dir.id} className="civic-card p-6 border-l-4 border-civic-blue">
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-civic-blue" />
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{dir.targetDept}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{dir.issueTitle}</h3>
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                    dir.status === "Resolved" ? "bg-green-100 text-green-700" :
                                        dir.status === "Pending Response" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                                )}>
                                    {dir.status}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 italic text-sm text-gray-600 mb-4">
                                "{dir.content}"
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        Issued {formatDateTime(dir.date)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        High Priority
                                    </div>
                                </div>
                                <Link
                                    href={`/mla/issues/${dir.complaintId}`}
                                    className="flex items-center gap-1 text-xs text-civic-blue font-bold hover:underline"
                                >
                                    View Related Issue <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Directive Performance Info */}
                <div className="bg-blue-900 rounded-3xl p-6 text-white shadow-card-xl relative overflow-hidden">
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <p className="text-blue-200 text-xs font-bold uppercase">Compliance Rate</p>
                            <p className="text-3xl font-black">94.2%</p>
                            <p className="text-blue-100/60 text-[10px]">Average time to response: 4.8h</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-blue-200 text-xs font-bold uppercase">Directives Issued</p>
                            <p className="text-3xl font-black">{directives.length}</p>
                            <p className="text-blue-100/60 text-[10px]">Last directive updated 2h ago</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-blue-200 text-xs font-bold uppercase">Impact on SLA</p>
                            <p className="text-3xl font-black">-12.5h</p>
                            <p className="text-blue-100/60 text-[10px]">Faster resolution via executive push</p>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                </div>
            </div>
        </MLALayout>
    );
}
