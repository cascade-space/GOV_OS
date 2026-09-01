"use client";

import { useState, useEffect } from "react";
import { DeskLayout } from "@/components/layout/DeskLayout";
import { MOCK_COMPLAINTS, MOCK_STATS } from "@/lib/mockData";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime, getSLAStatus, cn } from "@/lib/utils";
import {
    Clock, AlertTriangle, CheckCircle2, TrendingUp, Users,
    FileText, Timer, Flag, ArrowRight, Activity
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import Link from "next/link";

export default function DeskDashboardPage() {
    const [stats, setStats] = useState({
        pending: 0,
        assigned: 0,
        escalated: 0,
        resolved: 0,
        slaBreached: 0,
        duplicates: 0,
    });

    useEffect(() => {
        // Calculate stats from mock data
        const pending = MOCK_COMPLAINTS.filter(c => c.status === "submitted" || c.status === "validated").length;
        const assigned = MOCK_COMPLAINTS.filter(c => c.status === "assigned").length;
        const escalated = MOCK_COMPLAINTS.filter(c => c.isEscalated).length;
        const resolved = MOCK_COMPLAINTS.filter(c => c.status === "resolved").length;
        const slaBreached = MOCK_COMPLAINTS.filter(c => getSLAStatus(c.slaDeadline).isBreached).length;
        const duplicates = MOCK_COMPLAINTS.filter(c => c.status === "duplicate").length;

        setStats({ pending, assigned, escalated, resolved, slaBreached, duplicates });
    }, []);

    const kpiCards = [
        { 
            label: "Pending Assignment", 
            value: stats.pending, 
            icon: <Clock className="w-5 h-5" />, 
            color: "bg-orange-50 text-orange-600",
            trend: "+3 today"
        },
        { 
            label: "Assigned Today", 
            value: stats.assigned, 
            icon: <Users className="w-5 h-5" />, 
            color: "bg-blue-50 text-blue-600",
            trend: "Active"
        },
        { 
            label: "SLA Breached", 
            value: stats.slaBreached, 
            icon: <AlertTriangle className="w-5 h-5" />, 
            color: "bg-red-50 text-red-600",
            trend: "Needs attention"
        },
        { 
            label: "Resolved Today", 
            value: stats.resolved, 
            icon: <CheckCircle2 className="w-5 h-5" />, 
            color: "bg-green-50 text-green-600",
            trend: "On track"
        }
    ];

    return (
        <DeskLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Desk Dashboard</h1>
                    <p className="text-gray-600">Monitor and manage complaint assignments</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiCards.map((kpi, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("p-2 rounded-lg", kpi.color)}>
                                    {kpi.icon}
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {kpi.value}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{kpi.label}</div>
                            <div className="text-xs text-gray-500">{kpi.trend}</div>
                        </div>
                    ))}
                </div>

                {/* Recent Complaints */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {MOCK_COMPLAINTS.slice(0, 5).map((complaint) => (
                                <div key={complaint.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-medium text-gray-900">{complaint.complaintNumber}</span>
                                            <StatusBadge status={complaint.status} />
                                            <PriorityBadge priority={complaint.priority} />
                                        </div>
                                        <p className="text-sm text-gray-600">{complaint.title}</p>
                                    </div>
                                    <Link href={`/desk/complaints/${complaint.id}`}>
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DeskLayout>
    );
}