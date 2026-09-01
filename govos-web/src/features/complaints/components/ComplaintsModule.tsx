import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { complaintsApi } from '../api/api';
import { useUpdateComplaintStatus } from '../hooks/useComplaints';
import { useAuthStore } from '../../../store/auth.store';
import { FileText, Search, Plus, ChevronDown, User, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import CreateComplaintModal from './CreateComplaintModal';
import { ComplaintStatus, Complaint } from '../types';

const STATUS_FLOW: ComplaintStatus[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED'];

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  ASSIGNED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  IN_PROGRESS: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  RESOLVED: 'bg-green-500/10 text-green-400 border-green-500/30',
  CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  REOPENED: 'bg-red-500/10 text-red-400 border-red-500/30',
  DUPLICATE: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-500 font-bold',
  HIGH: 'text-orange-500 font-semibold',
  MEDIUM: 'text-amber-500',
  LOW: 'text-slate-400',
};

function StatusDropdown({ complaint }: { complaint: Complaint }) {
  const updateStatus = useUpdateComplaintStatus();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ComplaintStatus;
    if (newStatus !== complaint.status) {
      updateStatus.mutate({ id: complaint.id, status: newStatus });
    }
  };

  return (
    <div className="relative">
      <select
        value={complaint.status}
        onChange={handleChange}
        disabled={updateStatus.isPending}
        className={`appearance-none flex items-center gap-1.5 px-3 py-1.5 pr-8 rounded-full text-xs font-semibold border outline-none cursor-pointer transition-all ${STATUS_COLORS[complaint.status]}`}
      >
        {STATUS_FLOW.map(s => (
          <option key={s} value={s} className="bg-card text-foreground font-medium">
            {s.replace('_', ' ')}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${STATUS_COLORS[complaint.status].split(' ')[1]}`} />
    </div>
  );
}

export default function ComplaintsModule() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const user = useAuthStore(s => s.user);

  const { data: complaints, isLoading, isError } = useQuery({
    queryKey: ['complaints'],
    queryFn: complaintsApi.list,
  });

  const filtered = complaints?.filter(c => {
    const matchSearch =
      !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.complaintNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchOfficer = user?.primaryRole === 'OFFICER' ? c.assignedToId === user.id : true;
    return matchSearch && matchStatus && matchPriority && matchOfficer;
  });

  const canCreate = ['SUPER_ADMIN', 'TENANT_ADMIN', 'OFFICER', 'CITIZEN'].includes(user?.primaryRole ?? '');

  return (
    <div className="p-6 md:p-8 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="text-govos-blue" />
            Complaints
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage and track all citizen issues in your jurisdiction.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ID, Title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-secondary rounded-md text-sm border-transparent focus:border-govos-blue focus:ring-1 focus:ring-govos-blue w-52 transition-all"
            />
          </div>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ComplaintStatus | 'ALL')}
            className="px-3 py-2 bg-secondary rounded-md text-sm border-transparent focus:border-govos-blue transition-all"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_FLOW.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-secondary rounded-md text-sm border-transparent focus:border-govos-blue transition-all"
          >
            <option value="ALL">All Priorities</option>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {canCreate && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-govos-blue hover:bg-govos-blue/90 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={15} />
              New Complaint
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      {!isLoading && complaints && (
        <div className="flex flex-wrap gap-3">
          {(['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as ComplaintStatus[]).map(s => {
            const count = complaints.filter(c => c.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  statusFilter === s ? STATUS_COLORS[s] + ' ring-1 ring-offset-1 ring-current' : STATUS_COLORS[s] + ' opacity-60 hover:opacity-100'
                }`}
              >
                {s.replace('_', ' ')} · {count}
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-semibold sticky top-0">
              <tr>
                <th className="px-5 py-4">Complaint #</th>
                <th className="px-5 py-4">Title</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Assigned To</th>
                <th className="px-5 py-4">Filed</th>
                <th className="px-5 py-4">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-secondary/70 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-red-500">
                    Failed to load complaints. Ensure the backend is running.
                  </td>
                </tr>
              ) : (filtered ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground">
                    <FileText size={40} className="mx-auto mb-4 opacity-20" />
                    No complaints found.
                  </td>
                </tr>
              ) : (
                (filtered ?? []).map((complaint, index) => (
                  <motion.tr
                    key={complaint.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-secondary/30 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-govos-blue">
                        {complaint.complaintNumber || complaint.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium max-w-[220px] truncate" title={complaint.title}>
                        {complaint.title}
                      </div>
                      {complaint.category && (
                        <div className="text-xs text-muted-foreground mt-0.5">{complaint.category}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusDropdown complaint={complaint} />
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs ${PRIORITY_COLORS[complaint.priority] ?? 'text-muted-foreground'}`}>
                        {complaint.priority || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {complaint.assignedToId ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User size={12} />
                          <span className="font-mono">{complaint.assignedToId.slice(0, 8)}…</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {complaint.latitude && complaint.longitude ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <MapPin size={11} className="text-govos-blue/60" />
                          {complaint.latitude.toFixed(3)}, {complaint.longitude.toFixed(3)}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateComplaintModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
