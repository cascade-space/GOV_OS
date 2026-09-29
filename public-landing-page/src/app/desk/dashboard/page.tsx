"use client";

import { useState, useEffect } from "react";
import { DeskLayout } from "@/components/layout/DeskLayout";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime, getSLAStatus, cn } from "@/lib/utils";
import {
    Clock, AlertTriangle, CheckCircle2, TrendingUp, Users,
    FileText, Timer, Flag, ArrowRight, Activity
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api-client";

export default function DeskDashboardPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        assigned: 0,
        escalated: 0,
        resolved: 0,
        slaBreached: 0,
        duplicates: 0,
    });

    useEffect(() => {
        const fetchDeskData = async () => {
            try {
                const res: any = await api.get('/complaints');
                const list = Array.isArray(res) ? res : (res?.data || []);
                setComplaints(list);

                const pending = list.filter((c: any) => ["SUBMITTED", "NEW", "submitted", "new"].includes(c.status)).length;
                const assigned = list.filter((c: any) => ["ASSIGNED", "assigned", "IN_PROGRESS", "in_progress"].includes(c.status)).length;
                const escalated = list.filter((c: any) => c.isEscalated).length;
                const resolved = list.filter((c: any) => ["RESOLVED", "resolved", "CLOSED", "closed", "WORK_COMPLETED"].includes(c.status)).length;
                const slaBreached = list.filter((c: any) => (c.slaDeadline || c.sla_deadline) && new Date(c.slaDeadline || c.sla_deadline).getTime() < Date.now() && !['RESOLVED', 'CLOSED'].includes(c.status?.toUpperCase())).length;
                const duplicates = list.filter((c: any) => c.status === "duplicate").length;

                setStats({ pending, assigned, escalated, resolved, slaBreached, duplicates });
            } catch (e) {
                console.error("Failed to load desk complaints:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchDeskData();
    }, []);

    const kpiCards = [
        { 
            label: "Pending Assignment", 
            value: stats.pending, 
            icon: <Clock className="w-5 h-5" />, 
            color: "bg-orange-50 text-orange-600",
            trend: "Active Queue"
        },
        { 
            label: "In Progress / Assigned", 
            value: stats.assigned, 
            icon: <Users className="w-5 h-5" />, 
            color: "bg-blue-50 text-blue-600",
            trend: "Field Ops"
        },
        { 
            label: "SLA Breached", 
            value: stats.slaBreached, 
            icon: <AlertTriangle className="w-5 h-5" />, 
            color: "bg-red-50 text-red-600",
            trend: "Attention Req."
        },
        { 
            label: "Resolved", 
            value: stats.resolved, 
            icon: <CheckCircle2 className="w-5 h-5" />, 
            color: "bg-green-50 text-green-600",
            trend: "HDMC Closed"
        },
    ];

    return (
        <DeskLayout>
            <div className="space-y-6 animate-fade-in pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Desk Officer Dashboard</h1>
                    <p className="text-gray-600 mt-1">Live overview of complaints and assignment status</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiCards.map((kpi, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-3 rounded-xl", kpi.color)}>
                                    {kpi.icon}
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {kpi.value}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{kpi.label}</div>
                            <div className="text-xs text-gray-500 font-medium">{kpi.trend}</div>
                        </div>
                    ))}
                </div>

                {/* Recent Complaints */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
                    </div>
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-4 border-civic-blue border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : complaints.length === 0 ? (
                            <p className="text-center py-10 text-gray-400">No complaints in database</p>
                        ) : (
                            <div className="space-y-4">
                                {complaints.slice(0, 5).map((complaint) => (
                                    <div key={complaint.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-civic-blue/30 transition-all">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-bold text-gray-900 font-mono text-sm">{complaint.complaintNumber}</span>
                                                <StatusBadge status={complaint.status} />
                                                <PriorityBadge priority={complaint.priority} />
                                            </div>
                                            <p className="text-sm text-gray-700 font-medium">{complaint.title}</p>
                                            <p className="text-xs text-gray-400 mt-1">{complaint.locationAddress || "Dharwad"}</p>
                                        </div>
                                        <Link href={`/admin/complaints/${complaint.id}`}>
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DeskLayout>
    );
}