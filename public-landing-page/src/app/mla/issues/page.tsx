"use client";
import { useEffect, useState } from "react";
import { MLALayout } from "@/components/layout/MLALayout";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { getSLAStatus, formatDateTime, cn } from "@/lib/utils";
import { Search, MapPin, Filter, Download, ArrowRight, Clock, AlertTriangle, User } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api-client";

export default function MLAIssuesPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        const fetchIssues = async () => {
            try {
                const res: any = await api.get('/complaints');
                const list = Array.isArray(res) ? res : (res?.data || []);
                setComplaints(list);
            } catch (err) {
                console.error("Failed to load MLA issues:", err);
                setComplaints([]);
            } finally {
                setLoading(false);
            }
        };
        fetchIssues();
    }, []);

    const filtered = complaints.filter(c => {
        const title = (c.title || "").toLowerCase();
        const num = (c.complaintNumber || c.complaint_number || "").toLowerCase();
        const loc = (c.locationAddress || c.location || "").toLowerCase();
        const s = search.toLowerCase();
        const matchesSearch = s === "" || title.includes(s) || num.includes(s) || loc.includes(s);

        const priority = (c.priority || "").toUpperCase();
        const status = (c.status || "").toUpperCase();
        const isBreached = (c.slaDeadline || c.sla_deadline) &&
            new Date(c.slaDeadline || c.sla_deadline).getTime() < Date.now() &&
            !['RESOLVED', 'CLOSED'].includes(status);

        if (activeTab === "all") return matchesSearch;
        if (activeTab === "critical") return matchesSearch && (priority === "CRITICAL" || priority === "HIGH");
        if (activeTab === "breached") return matchesSearch && isBreached;
        if (activeTab === "resolved") return matchesSearch && (status === "RESOLVED" || status === "CLOSED");
        return matchesSearch;
    });

    const criticalCount = complaints.filter(c => ['CRITICAL', 'HIGH'].includes((c.priority || '').toUpperCase())).length;
    const breachedCount = complaints.filter(c => (c.slaDeadline || c.sla_deadline) && new Date(c.slaDeadline || c.sla_deadline).getTime() < Date.now() && !['RESOLVED', 'CLOSED'].includes((c.status || '').toUpperCase())).length;
    const resolvedCount = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes((c.status || '').toUpperCase())).length;

    return (
        <MLALayout>
            <div className="space-y-6 animate-fade-in pb-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Constituency Issues</h1>
                        <p className="text-gray-500 text-sm">Real-time legislative overview of all reported civic concerns in Dharwad.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn-ghost bg-white border border-gray-200">
                            <Download className="w-4 h-4" /> Export Report
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
                            { id: "all", label: "All Issues", count: complaints.length },
                            { id: "critical", label: "Critical / High", count: criticalCount },
                            { id: "breached", label: "SLA Breached", count: breachedCount },
                            { id: "resolved", label: "Resolved", count: resolvedCount },
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
                    {loading ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-8 h-8 border-4 border-civic-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">Loading constituency issues...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-full py-20 text-center civic-card">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">No issues found matching your filters.</p>
                        </div>
                    ) : (
                        filtered.map(issue => {
                            const sla = getSLAStatus(issue.slaDeadline || issue.sla_deadline);
                            return (
                                <Link href={`/mla/issues/${issue.id}`} key={issue.id} className="block group">
                                    <div className="civic-card-elevated p-5 flex flex-col h-full cursor-pointer hover:border-civic-blue/30 transition-all">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase font-mono">
                                                {issue.complaintNumber || issue.complaint_number}
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
                                                <span className="text-xs font-semibold text-gray-900">{issue.reporterName || issue.citizenName || 'Citizen'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Category:</span>
                                                <span className="text-xs font-semibold text-gray-900">{issue.category || 'General'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1 text-gray-500 truncate max-w-[180px]">
                                                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-civic-blue" />
                                                <span className="truncate">{issue.locationAddress || 'Dharwad'}</span>
                                            </div>
                                            <span className="font-bold text-civic-blue group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                                                View &rarr;
                                            </span>
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
