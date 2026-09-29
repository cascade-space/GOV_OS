"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    Shield, LogOut, ClipboardList, CheckCircle, Clock, 
    AlertTriangle, Building2, User, RefreshCw, Play, MapPin, 
    ChevronRight, Layers, CheckCircle2, CheckSquare 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/lib/store';
import { authService } from '@/lib/services/auth.service';
import { complaintService } from '@/lib/services/complaint.service';

interface Task {
    id: string;
    complaintNumber: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    citizen_name: string;
    location_address: string;
    created_at: string;
    slaDeadline?: string;
    assignedToId?: string;
    resolutionEvidenceUrl?: string;
    resolutionNotes?: string;
    workCompletedAt?: string;
    reworkReason?: string;
}

interface Stats {
    assigned: string;
    in_progress: string;
    resolved: string;
    total: string;
}

const PRIORITY_COLORS: Record<string, string> = {
    critical: 'bg-red-500 text-white font-bold',
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
};

const STATUS_COLORS: Record<string, string> = {
    assigned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-orange-100 text-orange-700',
    work_completed: 'bg-indigo-100 text-indigo-700',
    verification_pending: 'bg-purple-100 text-purple-700',
    resolved: 'bg-green-100 text-green-700',
    rework_required: 'bg-rose-100 text-rose-700 font-semibold',
    reopened: 'bg-purple-100 text-purple-700 font-semibold',
    pending: 'bg-gray-100 text-gray-600',
    new: 'bg-cyan-100 text-cyan-700'
};

export default function OfficerDashboardPage() {
    const router = useRouter();
    const { user, setUser, clearAuth } = useAppStore();
    const [activeTab, setActiveTab] = useState<'assigned' | 'ward'>('assigned');
    const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
    const [wardTasks, setWardTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    const officerUser = user || authService.getCurrentUser();

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);

            // 1. Fetch My Assigned Tasks
            let myTasksRaw: any[] = [];
            try {
                const res: any = await complaintService.getMyTasks();
                myTasksRaw = Array.isArray(res) ? res : (res?.data || []);
            } catch (e: any) {
                console.warn("My tasks endpoint fallback:", e);
                // If 403 or 401, re-verify as demo officer and retry once
                if (e?.response?.status === 403 || e?.response?.status === 401) {
                    try {
                        const newOfficer = await authService.loginWithOtp('officer@demo.govos.in', '123456', 'Rajesh Sharma');
                        setUser(newOfficer);
                        const retryRes: any = await complaintService.getMyTasks();
                        myTasksRaw = Array.isArray(retryRes) ? retryRes : (retryRes?.data || []);
                    } catch (retryErr) {
                        console.warn("My tasks retry failed:", retryErr);
                    }
                }
            }

            // 2. Fetch Ward Pool (or all open complaints)
            let wardTasksRaw: any[] = [];
            try {
                const res: any = officerUser?.wardId 
                    ? await complaintService.getWardComplaints(officerUser.wardId)
                    : await complaintService.getComplaints();
                const allList = Array.isArray(res) ? res : (res?.data || []);
                // Filter to open/unassigned pool
                wardTasksRaw = allList.filter((c: any) => 
                    !c.assignedToId || ['NEW', 'SUBMITTED', 'REWORK_REQUIRED'].includes((c.status || '').toUpperCase())
                );
            } catch (e) {
                console.warn("Ward complaints fetch fallback:", e);
            }

            const mapTask = (c: any): Task => ({
                id: c.id,
                complaintNumber: c.complaintNumber || c.complaint_number || 'CMP-TASK',
                title: c.title || c.complaintNumber || 'Civic Grievance',
                description: c.description || 'No description provided',
                category: c.category || c.subCategory || 'General',
                priority: (c.priority || 'medium').toLowerCase(),
                status: (c.status || 'assigned').toLowerCase(),
                citizen_name: c.citizenName || c.reporterName || 'Citizen',
                location_address: c.locationAddress || 'Dharwad Ward Area',
                created_at: c.createdAt || new Date().toISOString(),
                slaDeadline: c.slaDeadline,
                assignedToId: c.assignedToId,
                resolutionEvidenceUrl: c.resolutionEvidenceUrl,
                resolutionNotes: c.resolutionNotes,
                workCompletedAt: c.workCompletedAt,
                reworkReason: c.reworkReason,
            });

            const mappedAssigned = myTasksRaw.map(mapTask);
            const mappedWard = wardTasksRaw.map(mapTask);

            const inProg = mappedAssigned.filter(t => t.status === 'in_progress').length;
            const resCount = mappedAssigned.filter(t => 
                ['resolved', 'closed', 'work_completed', 'verification_pending'].includes(t.status) ||
                Boolean(t.resolutionEvidenceUrl)
            ).length;
            const assignedCount = mappedAssigned.filter(t => 
                ['assigned', 'new', 'submitted', 'rework_required', 'reopened'].includes(t.status)
            ).length;

            setAssignedTasks(mappedAssigned);
            setWardTasks(mappedWard);
            setStats({
                assigned: String(assignedCount),
                in_progress: String(inProg),
                resolved: String(resCount),
                total: String(mappedAssigned.length)
            });
        } catch (err) {
            console.error('Failed to load officer tasks:', err);
        } finally {
            setLoading(false);
        }
    }, [officerUser?.wardId, setUser]);

    useEffect(() => {
        let isMounted = true;
        const initAndLoad = async () => {
            const current = authService.getCurrentUser();
            // This is the officer-specific dashboard — always ensure we're logged in as OFFICER.
            // TENANT_ADMIN / SUPER_ADMIN have different task queues; if they land here we must
            // switch to the demo officer account so that /complaints/assigned/me returns the
            // correct officer's task list.
            if (!current || current.role !== 'OFFICER') {
                try {
                    const logged = await authService.loginWithOtp('officer@demo.govos.in', '123456', 'Rajesh Sharma');
                    if (isMounted) setUser(logged);
                } catch (e) {
                    console.warn("Officer init login error:", e);
                }
            }
            if (isMounted) {
                await loadDashboard();
            }
        };

        initAndLoad();

        // 30-second polling interval
        const interval = setInterval(() => {
            loadDashboard();
        }, 30000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [loadDashboard, setUser]);

    const handleClaimAndStart = async (taskId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setClaimingId(taskId);
        try {
            await complaintService.startWork(taskId);
            toast.success("Task claimed & marked In Progress! Assigned to you.");
            await loadDashboard();
            setActiveTab('assigned');
        } catch (err: any) {
            toast.error("Failed to claim task: " + (err?.response?.data?.message || err.message));
        } finally {
            setClaimingId(null);
        }
    };

    const handleLogout = () => {
        authService.logout();
        clearAuth();
        router.replace('/login');
    };

    if (loading && assignedTasks.length === 0 && wardTasks.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: 'Assigned to Me', value: stats?.assigned || '0', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Work In Progress', value: stats?.in_progress || '0', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Completed / Verified', value: stats?.resolved || '0', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Ward Claimable Pool', value: String(wardTasks.length), icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const currentTasks = activeTab === 'assigned' ? assignedTasks : wardTasks;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-28">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-20 backdrop-blur-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-black text-sm text-white">GovOS</p>
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    FIELD OFFICER
                                </span>
                            </div>
                            <p className="text-slate-400 text-xs">Field Task Execution & Photo Verification</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => loadDashboard()} 
                            disabled={loading}
                            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
                        </button>
                        <button 
                            onClick={handleLogout} 
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
                {/* Profile Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-wrap items-center gap-4 shadow-xl">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white font-black text-xl">
                            {officerUser?.name?.charAt(0) || 'O'}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white">{officerUser?.name || 'Field Officer'}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                            <div className="flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>PWD & Civic Works</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-500" />
                                <span>{officerUser?.email || officerUser?.phone}</span>
                            </div>
                            {officerUser?.wardId && (
                                <div className="flex items-center gap-1 text-emerald-400">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Ward Assigned</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            On Duty (SLA Watch Active)
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
                            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <p className="text-2xl font-black text-white">{value}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Dual-Tab Navigation */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <button
                        onClick={() => setActiveTab('assigned')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                            activeTab === 'assigned'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                    >
                        <ClipboardList className="w-4 h-4" />
                        My Assigned Tasks ({assignedTasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('ward')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                            activeTab === 'ward'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                    >
                        <Layers className="w-4 h-4" />
                        Ward Claimable Pool ({wardTasks.length})
                    </button>
                </div>

                {/* Task List */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="font-black text-white text-base">
                                {activeTab === 'assigned' ? 'Tasks Assigned to You' : 'Unassigned Ward Grievance Pool'}
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {activeTab === 'assigned' 
                                    ? 'Execute fixes, upload GPS before/after proof, and complete milestones.' 
                                    : 'Pick up open ward issues directly to initiate immediate remediation.'}
                            </p>
                        </div>
                    </div>

                    {currentTasks.length === 0 ? (
                        <div className="text-center py-16">
                            <CheckCircle2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">
                                {activeTab === 'assigned' ? 'No pending tasks assigned' : 'No unassigned tickets in ward pool'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {activeTab === 'assigned' ? 'Switch to Ward Pool tab to claim tickets.' : 'All ward complaints are currently under resolution.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800/60">
                            {currentTasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => router.push(`/officer/tasks/${task.id}`)}
                                    className="p-5 hover:bg-slate-800/50 transition-colors cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                            <span className="text-[11px] font-mono text-emerald-400 font-bold">
                                                {task.complaintNumber}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority] || 'bg-slate-800 text-slate-300'}`}>
                                                {task.priority.toUpperCase()}
                                            </span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status] || 'bg-slate-800 text-slate-300'}`}>
                                                {task.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span className="text-[10px] text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-md">
                                                {task.category}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-100 text-sm group-hover:text-emerald-400 transition-colors">
                                            {task.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                                            <span>By: {task.citizen_name}</span>
                                            {task.location_address && <span>📍 {task.location_address}</span>}
                                            <span>{new Date(task.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {activeTab === 'ward' ? (
                                            <button
                                                onClick={(e) => handleClaimAndStart(task.id, e)}
                                                disabled={claimingId === task.id}
                                                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                                            >
                                                {claimingId === task.id ? (
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Play className="w-3.5 h-3.5 fill-current" />
                                                )}
                                                Claim & Start Work
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700">
                                                <span>Inspect & Action</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl z-40">
                <div className="max-w-2xl mx-auto flex">
                    <Link
                        href="/officer/dashboard"
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-bold text-emerald-400 transition-colors"
                    >
                        <CheckSquare className="w-4 h-4" />
                        <span>My Tasks</span>
                    </Link>
                    <Link
                        href="/officer/history"
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <Clock className="w-4 h-4" />
                        <span>History</span>
                    </Link>
                    <Link
                        href="/officer/profile"
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
