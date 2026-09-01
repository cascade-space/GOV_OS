"use client";
import { MLALayout } from "@/components/layout/MLALayout";
import { MOCK_COMPLAINTS } from "@/lib/mockData";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { getSLAStatus, formatDateTime, cn } from "@/lib/utils";
import { Search, MapPin, Filter, Download, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function MLAIssuesPage() {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const filtered = MOCK_COMPLAINTS.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.complaintNumber.toLowerCase().includes(search.toLowerCase()) ||
            c.ward.toLowerCase().includes(search.toLowerCase());

        if (activeTab === "all") return matchesSearch;
        if (activeTab === "critical") return matchesSearch && (c.priority === "critical" || c.priority === "high");

        if (activeTab === "breached") return matchesSearch && getSLAStatus(c.slaDeadline).isBreached;
        if (activeTab === "resolved") return matchesSearch && c.status === "resolved";
        return matchesSearch;
    });

    return (
        <MLALayout>
            <div className="space-y-6 animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Constituency Issues</h1>
                        <p className="text-gray-500 text-sm">Real-time overview of all reported civic concerns in your ward.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn-ghost bg-white border border-gray-200">
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                        <button className="btn-primary">
                            <Filter className="w-4 h-4" /> Filter Views
                        </button>
                    </div>
                </div>

                {/* Search and Tabs */}
                <div className="space-y-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, keyword, or ward..."
                            className="input-field pl-10 h-11"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {[
                            { id: "all", label: "All Issues", count: MOCK_COMPLAINTS.length },
                            { id: "critical", label: "Critical / High", count: MOCK_COMPLAINTS.filter(c => c.priority === "critical" || c.priority === "high").length },
                            { id: "breached", label: "SLA Breached", count: MOCK_COMPLAINTS.filter(c => getSLAStatus(c.slaDeadline).isBreached).length },
                            { id: "resolved", label: "Resolved", count: MOCK_COMPLAINTS.filter(c => c.status === "resolved").length },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200",
                                    activeTab === tab.id
                                        ? "bg-civic-blue text-white shadow-card"
                                        : "bg-white text-gray-500 border border-gray-100 hover:border-gray-200"
                                )}
                            >
                                {tab.label}
                                <span className={cn(
                                    "ml-2 text-xs opacity-70 px-1.5 py-0.5 rounded-md",
                                    activeTab === tab.id ? "bg-white/20" : "bg-gray-100"
                                )}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Issues Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.length === 0 ? (
                        <div className="col-span-full py-20 text-center civic-card">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">No issues found matching your filters.</p>
                        </div>
                    ) : (
                        filtered.map(issue => {
                            const sla = getSLAStatus(issue.slaDeadline);
                            return (
                                <Link href={`/mla/issues/${issue.id}`} key={issue.id} className="block group">
                                    <div className="civic-card-elevated p-5 flex flex-col h-full cursor-pointer">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase font-mono">
                                                {issue.complaintNumber}
                                            </span>
                                            <StatusBadge status={issue.status} />
                                        </div>

                                        <h3 className="text-base font-bold text-gray-900 group-hover:text-civic-blue transition-colors mb-2 line-clamp-1">
                                            {issue.title}
                                        </h3>

                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                                            {issue.description}
                                        </p>

                                        <div className="bg-gray-50 rounded-lg p-2.5 mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-gray-500">Citizen:</span>
                                                <span className="text-xs font-bold text-gray-800">{issue.citizenName}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Mobile:</span>
                                                <span className="text-xs font-mono text-gray-700">{issue.citizenMobile}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-3">
                                            <div className="flex items-center justify-between">
                                                <PriorityBadge priority={issue.priority} />
                                                <div className={cn("flex items-center gap-1.5 text-[11px] font-bold", sla.color)}>
                                                    {sla.isBreached ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                    {sla.label}
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="truncate">{issue.ward}</span>
                                                <span className="ml-auto flex items-center gap-1 text-civic-blue font-bold group-hover:gap-2 transition-all">
                                                    Details <ArrowRight className="w-3.5 h-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </MLALayout>
    );
}
