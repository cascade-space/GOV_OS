"use client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminRoleProvider } from "@/contexts/AdminRoleContext";
import { AdminRoleGuard } from "@/components/auth/AdminRoleGuard";
import { KPICard } from "@/components/ui/Card";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { formatDateTime, getSLAStatus, cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    FileText, Clock, AlertTriangle, CheckCircle2, TrendingUp,
    Users, ArrowRight, Bell, Zap, Plus, Loader2
} from "lucide-react";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import api from "@/lib/api-client";
import toast from "react-hot-toast";

function AdminDashboardContent() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, complaintsData] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/complaints?limit=5')
            ]);

            // api-client returns response.data directly, so statsData = { success, data }
            if (statsData?.success) {
                setStats(statsData.data);
            } else if (statsData?.data) {
                setStats(statsData.data);
            } else if (statsData?.total_complaints !== undefined) {
                setStats(statsData); // already unwrapped
            }

            const rawComplaints = complaintsData?.data || complaintsData?.complaints || complaintsData;
            const complaintsArray = Array.isArray(rawComplaints) ? rawComplaints : [];
            setComplaints(complaintsArray.slice(0, 4));
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-civic-blue mx-auto mb-3" />
                        <p className="text-gray-500">Loading dashboard...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const totalComplaints = stats?.total_complaints || stats?.total || 0;
    const pendingComplaints = stats?.pending || 0;
    const resolvedComplaints = stats?.resolved || 0;
    const slaBreached = stats?.sla_breached || 0;

    return (
        <AdminLayout>
            <div className="space-y-6 animate-fade-in">
                {/* Welcome Row */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900">Good afternoon, Admin 👋</h2>
                        <p className="text-gray-500 text-sm mt-0.5">Here's what's happening in your constituency today.</p>
                    </div>
                    <Link href="/admin/complaints" className="btn-primary">
                        <FileText className="w-4 h-4" />
                        View All Complaints
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Total Complaints"
                        value={String(totalComplaints)}
                        subtitle="All time"
                        icon={<FileText className="w-5 h-5 text-blue-600" />}
                        iconBg="bg-blue-50"
                    />
                    <KPICard
                        title="Pending"
                        value={String(pendingComplaints)}
                        subtitle="Awaiting action"
                        icon={<Clock className="w-5 h-5 text-orange-600" />}
                        iconBg="bg-orange-50"
                    />
                    <KPICard
                        title="SLA Breached"
                        value={String(slaBreached)}
                        subtitle="Needs attention"
                        icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
                        iconBg="bg-red-50"
                    />
                    <KPICard
                        title="Resolved"
                        value={String(resolvedComplaints)}
                        subtitle="Completed"
                        icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                        iconBg="bg-green-50"
                    />
                </div>

                {/* Charts Row - Simplified for now */}
                <div className="civic-card p-5">
                    <h3 className="section-title mb-4">Statistics Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                            <p className="text-2xl font-black text-blue-600">{totalComplaints}</p>
                            <p className="text-xs text-gray-600 mt-1">Total</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-xl">
                            <p className="text-2xl font-black text-orange-600">{pendingComplaints}</p>
                            <p className="text-xs text-gray-600 mt-1">Pending</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                            <p className="text-2xl font-black text-green-600">{resolvedComplaints}</p>
                            <p className="text-xs text-gray-600 mt-1">Resolved</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-xl">
                            <p className="text-2xl font-black text-red-600">{slaBreached}</p>
                            <p className="text-xs text-gray-600 mt-1">SLA Breached</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Recent Complaints */}
                    <div className="civic-card p-5">
                        <div className="section-header">
                            <h3 className="section-title">Latest Complaints</h3>
                            <Link href="/admin/complaints" className="text-xs text-civic-blue font-semibold hover:underline flex items-center gap-1">
                                View All <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {complaints.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No complaints yet</p>
                                </div>
                            ) : (
                                complaints.map((c) => {
                                    const sla = getSLAStatus(c.sla_deadline);
                                    return (
                                        <Link key={c.id} href={`/admin/complaints/${c.id}`} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-mono text-gray-400">{c.complaint_number}</span>
                                                    <StatusBadge status={c.status} />
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800 truncate">{c.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <PriorityBadge priority={c.priority} />
                                                    <span className={cn("text-xs font-semibold", sla.color)}>{sla.label}</span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-civic-blue flex-shrink-0 mt-1 transition-colors" />
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="civic-card p-5">
                        <h3 className="section-title mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link href="/admin/complaints" className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">View All Complaints</p>
                                    <p className="text-xs text-gray-500">Manage and assign complaints</p>
                                </div>
                            </Link>
                            <Link href="/admin/officers" className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Manage Officers</p>
                                    <p className="text-xs text-gray-500">Add or update field officers</p>
                                </div>
                            </Link>
                            <Link href="/admin/analytics" className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">View Analytics</p>
                                    <p className="text-xs text-gray-500">Detailed reports and insights</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default function AdminDashboardPage() {
    return (
        <AdminRoleGuard requiredRole="admin">
            <AdminDashboardContent />
        </AdminRoleGuard>
    );
}
