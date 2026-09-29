"use client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, getSLAStatus, cn, truncate } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { COMPLAINT_STATUSES, CATEGORIES, PRIORITIES } from "@/lib/constants";
import {
    Search, Filter, Download, Eye, ChevronDown,
    AlertTriangle, CheckSquare, Copy, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon, MapPin, ShieldCheck
} from "lucide-react";
import { AdminRoleGuard } from "@/components/auth/AdminRoleGuard";
import { QCVerificationModal } from "@/components/admin/QCVerificationModal";
import api from "@/lib/api-client";
import toast from "react-hot-toast";

import { getRealtimeSocket } from "@/lib/realtime";

const STATUSES_FILTER = ["all", ...COMPLAINT_STATUSES] as const;
const PRIORITIES_FILTER = ["all", ...PRIORITIES] as const;

export default function ComplaintsPage() {
    return (
        <AdminRoleGuard requiredRole="admin">
            <ComplaintsPageContent />
        </AdminRoleGuard>
    );
}

function ComplaintsPageContent() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [selected, setSelected] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [qcModalComplaint, setQcModalComplaint] = useState<any | null>(null);
    const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);
    const [slaFilter, setSlaFilter] = useState<'all' | 'at_risk' | 'breached'>('all');
    const PER_PAGE = 10;

    // Fetch complaints from API
    useEffect(() => {
        fetchComplaints();
    }, []);

    // Subscribe to Realtime WebSocket events
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('govos_auth_token') || '' : '';
        const socket = getRealtimeSocket(token);

        const onConnect = () => {
            setIsLiveStreamActive(true);
            const tenantId = typeof window !== 'undefined' ? localStorage.getItem('govos_tenant_id') || '00000000-0000-0000-0000-000000000002' : '';
            if (tenantId) {
                socket.emit('join:tenant');
            }
            socket.emit('join:public');
        };

        const onDisconnect = () => {
            setIsLiveStreamActive(false);
        };

        const onComplaintCreated = (newComplaint: any) => {
            console.log('[Realtime] complaint:created received:', newComplaint);
            const normalized = {
                id: newComplaint.id,
                complaint_number: newComplaint.complaintNumber || newComplaint.complaint_number,
                title: newComplaint.title,
                description: newComplaint.description,
                category: newComplaint.category,
                priority: newComplaint.priority || 'MEDIUM',
                status: newComplaint.status || 'NEW',
                citizen_name: newComplaint.reporterName || newComplaint.citizen_name || 'Citizen',
                citizen_phone: newComplaint.reporterMobile || newComplaint.citizen_phone,
                location: newComplaint.locationAddress || newComplaint.location,
                created_at: newComplaint.createdAt || newComplaint.created_at || new Date().toISOString(),
                sla_deadline: newComplaint.slaDeadline || newComplaint.sla_deadline,
                assigned_officer_name: newComplaint.assignedOfficerName || null,
            };

            setComplaints(prev => {
                const filteredPrev = prev.filter(c => c.id !== normalized.id && c.complaint_number !== normalized.complaint_number);
                const updated = [normalized, ...filteredPrev];
                return updated.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
            });

            toast.success(`⚡ New Grievance Received: ${normalized.complaint_number || 'New Issue'}`);
        };

        const onComplaintStatusChanged = (updated: any) => {
            console.log('[Realtime] complaint:status_changed received:', updated);
            const compNum = updated.complaintNumber || updated.complaint_number;

            setComplaints(prev => prev.map(c => {
                if (c.id === updated.id || c.complaint_number === compNum) {
                    return {
                        ...c,
                        status: updated.status || c.status,
                        rework_reason: updated.reworkReason || c.rework_reason,
                        rework_count: updated.reworkCount ?? c.rework_count,
                        resolution_notes: updated.resolutionNotes || c.resolution_notes,
                        resolution_evidence_url: updated.resolutionEvidenceUrl || c.resolution_evidence_url,
                        distance_deviation_meters: updated.distanceDeviationMeters ?? c.distance_deviation_meters,
                        sla_deadline: updated.slaDeadline || c.sla_deadline,
                        resolved_at: updated.resolvedAt || c.resolved_at,
                    };
                }
                return c;
            }));

            toast(`🔔 Status Updated: ${compNum || 'Complaint'} is now ${updated.status}`, {
                icon: '🔄',
            });
        };

        const onSlaWarning = (data: any) => {
            console.log('[Realtime] sla:warning received:', data);
            const compNum = data.complaintNumber || data.complaint_number;
            setComplaints(prev => prev.map(c => {
                if (c.id === data.id || c.complaint_number === compNum) {
                    return { ...c, sla_warning_sent: true };
                }
                return c;
            }));
            toast(`⚠️ SLA Warning: Complaint ${compNum || ''} has reached 75% elapsed window!`, {
                icon: '⚠️',
                duration: 6000,
            });
        };

        const onSlaBreach = (data: any) => {
            console.log('[Realtime] sla:breach received:', data);
            const compNum = data.complaintNumber || data.complaint_number;
            setComplaints(prev => prev.map(c => {
                if (c.id === data.id || c.complaint_number === compNum) {
                    return { ...c, sla_breached: true, escalation_level: 1 };
                }
                return c;
            }));
            toast.error(`🚨 SLA Breach: Complaint ${compNum || ''} breached SLA! Escalated to Level 1 (Dept Head).`, {
                duration: 8000,
            });
        };

        const onSlaEscalated = (data: any) => {
            console.log('[Realtime] sla:escalated received:', data);
            const compNum = data.complaintNumber || data.complaint_number;
            setComplaints(prev => prev.map(c => {
                if (c.id === data.id || c.complaint_number === compNum) {
                    return { ...c, sla_breached: true, escalation_level: 2, priority: 'CRITICAL' };
                }
                return c;
            }));
            toast.error(`🔥 Critical Escalation: Complaint ${compNum || ''} escalated to Level 2 (Commissioner)!`, {
                duration: 10000,
            });
        };

        if (socket.connected) {
            onConnect();
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('complaint:created', onComplaintCreated);
        socket.on('complaint:status_changed', onComplaintStatusChanged);
        socket.on('complaint:rework_requested', onComplaintStatusChanged);
        socket.on('sla:warning', onSlaWarning);
        socket.on('sla:breach', onSlaBreach);
        socket.on('sla:escalated', onSlaEscalated);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('complaint:created', onComplaintCreated);
            socket.off('complaint:status_changed', onComplaintStatusChanged);
            socket.off('complaint:rework_requested', onComplaintStatusChanged);
            socket.off('sla:warning', onSlaWarning);
            socket.off('sla:breach', onSlaBreach);
            socket.off('sla:escalated', onSlaEscalated);
        };
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response: any = await api.get('/complaints');
            let complaintsData: any[] = [];
            if (Array.isArray(response)) {
                complaintsData = response;
            } else if (response?.data) {
                complaintsData = Array.isArray(response.data) ? response.data : (response.data.complaints || []);
            } else if (response?.complaints) {
                complaintsData = response.complaints;
            }

            const normalized = complaintsData.map((c: any) => ({
                ...c,
                id: c.id,
                complaint_number: c.complaintNumber || c.complaint_number,
                citizen_name: c.reporterName || c.citizenName || c.citizen_name || 'Citizen',
                citizen_phone: c.reporterMobile || c.citizenPhone || c.citizen_phone,
                location: c.locationAddress || c.location || 'Dharwad Municipal Corporation',
                created_at: c.createdAt || c.created_at,
                sla_deadline: c.slaDeadline || c.sla_deadline,
                priority: (c.priority || 'MEDIUM').toUpperCase(),
                status: (c.status || 'NEW').toUpperCase(),
            }));

            // Guaranteed sorting newest-first by creation timestamp
            normalized.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

            setComplaints(normalized);
        } catch (error: any) {
            console.error('Error fetching complaints:', error);
            const errorMsg = error?.message || 'Unknown error';
            setError(errorMsg);
            toast.error(`Failed to load complaints: ${errorMsg}`);
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = complaints.filter((c) => {
        const s = search.trim().toLowerCase();
        const num = (c.complaint_number || c.complaintNumber || '').toLowerCase();
        const cit = (c.citizen_name || c.reporterName || '').toLowerCase();
        const tit = (c.title || '').toLowerCase();
        const matchSearch = s === "" || num.includes(s) || cit.includes(s) || tit.includes(s);
        
        const itemStatus = (c.status || '').toLowerCase();
        const filterStatus = statusFilter.toLowerCase();
        const matchStatus = filterStatus === "all" 
            || itemStatus === filterStatus
            || (filterStatus === "submitted" && itemStatus === "new")
            || (filterStatus === "new" && itemStatus === "submitted");

        const matchPriority = priorityFilter === "all" || (c.priority || '').toLowerCase() === priorityFilter.toLowerCase();

        let matchSla = true;
        if (slaFilter === 'at_risk') {
            const sla = getSLAStatus(c.sla_deadline || c.slaDeadline, { isBreached: c.sla_breached, escalationLevel: c.escalation_level, isWarning: c.sla_warning_sent });
            matchSla = sla.isWarning && !sla.isBreached;
        } else if (slaFilter === 'breached') {
            const sla = getSLAStatus(c.sla_deadline || c.slaDeadline, { isBreached: c.sla_breached, escalationLevel: c.escalation_level, isWarning: c.sla_warning_sent });
            matchSla = sla.isBreached;
        }

        return matchSearch && matchStatus && matchPriority && matchSla;
    });

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(filtered.length / PER_PAGE);

    const toggleSelect = (id: string) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        setSelected(selected.length === paginated.length ? [] : paginated.map((c) => c.id.toString()));
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-civic-blue mx-auto mb-3" />
                        <p className="text-gray-500">Loading complaints...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to Load Complaints</h3>
                        <p className="text-gray-600 mb-4">
                            Could not connect to the backend server. Please make sure:
                        </p>
                        <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                            <li>• Backend server is running on <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8080</code></li>
                            <li>• Database is connected and running</li>
                            <li>• No firewall blocking the connection</li>
                        </ul>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={fetchComplaints} leftIcon={<Loader2 className="w-4 h-4" />}>
                                Retry
                            </Button>
                            <Button 
                                variant="ghost" 
                                onClick={() => window.open('http://localhost:8080/api/v1/complaints', '_blank')}
                            >
                                Test API
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">Error: {error}</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-5 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-gray-900">Complaint Management</h2>
                            {isLiveStreamActive ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    LIVE WEBSOCKET
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                    CONNECTING...
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm">{filtered.length} complaints found</p>
                    </div>
                    <Button variant="ghost" leftIcon={<Download className="w-4 h-4" />}>Export CSV</Button>
                </div>

                {/* Filters */}
                <div className="civic-card p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by ID, name, or description..."
                                className="input-field pl-9"
                            />
                        </div>
                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="input-field appearance-none pr-9 min-w-[140px]"
                            >
                                {STATUSES_FILTER.map((s) => (
                                    <option key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {/* Priority Filter */}
                        <div className="relative">
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="input-field appearance-none pr-9 min-w-[130px]"
                            >
                                {PRIORITIES_FILTER.map((p) => (
                                    <option key={p} value={p}>{p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* SLA Quick Filter Pills */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">SLA Filter:</span>
                        <button
                            type="button"
                            onClick={() => { setSlaFilter('all'); setPage(1); }}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                                slaFilter === 'all'
                                    ? "bg-gray-800 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            All Tickets ({complaints.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSlaFilter('at_risk'); setPage(1); }}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                                slaFilter === 'at_risk'
                                    ? "bg-amber-600 text-white shadow-sm"
                                    : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                            )}
                        >
                            <span>⚠️</span> SLA At Risk ({complaints.filter(c => {
                                const s = getSLAStatus(c.sla_deadline, { isBreached: c.sla_breached, escalationLevel: c.escalation_level, isWarning: c.sla_warning_sent });
                                return s.isWarning && !s.isBreached;
                            }).length})
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSlaFilter('breached'); setPage(1); }}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                                slaFilter === 'breached'
                                    ? "bg-red-600 text-white shadow-sm"
                                    : "bg-red-50 text-red-800 border border-red-200 hover:bg-red-100"
                            )}
                        >
                            <span>🚨</span> Breached & Escalated ({complaints.filter(c => {
                                const s = getSLAStatus(c.sla_deadline, { isBreached: c.sla_breached, escalationLevel: c.escalation_level, isWarning: c.sla_warning_sent });
                                return s.isBreached;
                            }).length})
                        </button>
                    </div>

                    {/* Bulk Actions */}
                    {selected.length > 0 && (
                        <div className="mt-3 flex items-center gap-3 pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-600">{selected.length} selected</span>
                            <Button variant="secondary" size="sm">Assign Selected</Button>
                            <Button variant="ghost" size="sm" leftIcon={<Copy className="w-3.5 h-3.5" />}>Mark Duplicate</Button>
                            <Button variant="danger" size="sm">Bulk Reject</Button>
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="civic-card overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="data-table min-w-[1200px]">
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selected.length === paginated.length && paginated.length > 0}
                                            onChange={toggleAll}
                                            className="rounded border-gray-300"
                                        />
                                    </th>
                                    <th>Complaint ID</th>
                                    <th>Citizen Name</th>
                                    <th>Mobile</th>
                                    <th>Issue</th>
                                    <th>Category</th>
                                    <th>Photo</th>
                                    <th>Map Location</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>SLA</th>
                                    <th>Assigned To</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={13} className="text-center py-12 text-gray-400">
                                            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">No complaints match your filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((c) => {
                                        const sla = getSLAStatus(c.sla_deadline, {
                                            isBreached: c.sla_breached,
                                            escalationLevel: c.escalation_level,
                                            isWarning: c.sla_warning_sent,
                                        });
                                        return (
                                            <tr key={c.id} className={cn(selected.includes(c.id.toString()) && "bg-blue-50/30")}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(c.id.toString())}
                                                        onChange={() => toggleSelect(c.id.toString())}
                                                        className="rounded border-gray-300"
                                                    />
                                                </td>
                                                <td>
                                                    <div>
                                                        <span className="font-mono text-xs font-semibold text-civic-blue">{c.complaint_number}</span>
                                                        {c.external_ticket_id && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs" title={`Federated with ${c.external_system || 'External System'}`}>
                                                                    🌐 {c.external_ticket_id}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {c.is_escalated && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                                                <span className="text-red-500 text-xs font-semibold">Escalated</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <p className="font-semibold text-gray-800 text-sm">{c.citizen_name || 'N/A'}</p>
                                                </td>
                                                <td>
                                                    <p className="font-mono text-xs text-gray-600">{c.citizen_mobile || 'N/A'}</p>
                                                </td>
                                                <td>
                                                    <p className="text-gray-700 text-xs truncate max-w-[200px]">{truncate(c.title, 50)}</p>
                                                    <p className="text-gray-400 text-xs">{c.ward}</p>
                                                </td>
                                                <td>
                                                    <span className="text-xs text-gray-600 capitalize">{c.category?.replace(/_/g, " ")}</span>
                                                    <br />
                                                    <span className="text-xs text-gray-400">{c.sub_category}</span>
                                                </td>
                                                <td>
                                                    {c.attachments && c.attachments.length > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            {c.attachments
                                                                .filter((att: any) => att.file_type === 'photo')
                                                                .slice(0, 1)
                                                                .map((att: any, idx: number) => (
                                                                    <a
                                                                        key={idx}
                                                                        href={att.file_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="group relative block"
                                                                        title="Click to view full image"
                                                                    >
                                                                        <img
                                                                            src={att.file_url}
                                                                            alt="Complaint"
                                                                            className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 group-hover:border-civic-blue transition-all cursor-pointer"
                                                                            onError={(e) => {
                                                                                const target = e.target as HTMLImageElement;
                                                                                target.style.display = 'none';
                                                                                const parent = target.parentElement;
                                                                                if (parent) {
                                                                                    parent.innerHTML = '<div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                                                                }
                                                                            }}
                                                                        />
                                                                    </a>
                                                                ))}
                                                            {c.attachments.filter((att: any) => att.file_type === 'photo').length > 1 && (
                                                                <span className="text-xs text-gray-500 font-medium">
                                                                    +{c.attachments.filter((att: any) => att.file_type === 'photo').length - 1}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                                                            <ImageIcon className="w-5 h-5 text-gray-300" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {c.latitude && c.longitude ? (
                                                        <a
                                                            href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg transition-colors group"
                                                            title={`View location: ${c.latitude}, ${c.longitude}`}
                                                        >
                                                            <MapPin className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                            View Map
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No location</span>
                                                    )}
                                                </td>
                                                <td><PriorityBadge priority={c.priority} /></td>
                                                <td><StatusBadge status={c.status} /></td>
                                                <td>
                                                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap shadow-xs", sla.bg, sla.color)}>
                                                        {sla.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <p className="text-xs font-medium text-gray-700">{c.officer_name || "—"}</p>
                                                    <p className="text-xs text-gray-400">{c.department_name || "Unassigned"}</p>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-1.5">
                                                        <Link
                                                            href={`/admin/complaints/${c.id}`}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-civic-blue text-white text-xs font-semibold rounded-lg hover:bg-navy-700 transition-colors"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            View
                                                        </Link>
                                                        {["work_completed", "verification_pending", "under_verification", "rework_required"].includes((c.status || "").toLowerCase()) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setQcModalComplaint(c)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm shadow-emerald-600/20"
                                                                title="Inspect & Verify Work (Milestone M5)"
                                                            >
                                                                <ShieldCheck className="w-3 h-3" />
                                                                QC Inspect
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={cn("w-7 h-7 rounded-lg text-xs font-semibold", p === page ? "bg-civic-blue text-white" : "hover:bg-gray-100 text-gray-600")}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* QC Verification Side-by-Side Modal (Milestone M5) */}
            <QCVerificationModal
                isOpen={!!qcModalComplaint}
                complaint={qcModalComplaint}
                onClose={() => setQcModalComplaint(null)}
                onActionCompleted={fetchComplaints}
            />
        </AdminLayout>
    );
}
