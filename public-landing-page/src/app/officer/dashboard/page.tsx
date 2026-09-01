"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, ClipboardList, CheckCircle, Clock, AlertTriangle, Building2, User, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface OfficerSession {
    token: string;
    officer: { id: number; name: string; email: string; department: string; role: string };
}

interface Task {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    citizen_name: string;
    location_address: string;
    created_at: string;
}

interface Stats {
    assigned: string;
    in_progress: string;
    resolved: string;
    total: string;
}

const PRIORITY_COLORS: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
};

const STATUS_COLORS: Record<string, string> = {
    assigned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-orange-100 text-orange-700',
    resolved: 'bg-green-100 text-green-700',
    pending: 'bg-gray-100 text-gray-600'
};

export default function OfficerDashboardPage() {
    const [session, setSession] = useState<OfficerSession | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadDashboard = useCallback(async (token: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/v1/officers/dashboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem('officer_session');
                router.replace('/officer/login');
                return;
            }

            const data = await res.json();
            if (data.success) {
                setTasks(data.data.tasks || []);
                setStats(data.data.stats);
            }
        } catch {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const stored = localStorage.getItem('officer_session');
        if (!stored) {
            router.replace('/officer/login');
            return;
        }
        try {
            const s = JSON.parse(stored) as OfficerSession;
            setSession(s);
            loadDashboard(s.token);
        } catch {
            localStorage.removeItem('officer_session');
            router.replace('/officer/login');
        }
    }, [router, loadDashboard]);

    const handleLogout = () => {
        localStorage.removeItem('officer_session');
        router.replace('/officer/login');
    };

    if (!session || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-slate-600 animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: 'Assigned', value: stats?.assigned || '0', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'In Progress', value: stats?.in_progress || '0', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Resolved', value: stats?.resolved || '0', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Total Tasks', value: stats?.total || '0', icon: AlertTriangle, color: 'text-slate-600', bg: 'bg-slate-50' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-slate-800 text-white px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-black text-sm">CivicPath</p>
                            <p className="text-white/60 text-xs">Officer Portal</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black text-xl">{session.officer.name.charAt(0)}</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900">{session.officer.name}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Building2 className="w-3.5 h-3.5" />
                                {session.officer.department}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <User className="w-3.5 h-3.5" />
                                {session.officer.email}
                            </div>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Active</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <p className="text-2xl font-black text-gray-900">{value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Tasks */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="font-black text-gray-900">Assigned Tasks</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{tasks.length} tasks assigned to you</p>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="text-center py-12">
                            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400 font-medium">No tasks assigned yet</p>
                            <p className="text-xs text-gray-400 mt-1">Tasks will appear here when assigned by admin</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {tasks.map(task => (
                                <div key={task.id} className="p-5 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                                                    {task.priority}
                                                </span>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs text-gray-400">{task.category}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-sm">{task.title}</h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                <span>By: {task.citizen_name}</span>
                                                {task.location_address && <span>📍 {task.location_address}</span>}
                                                <span>{new Date(task.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
