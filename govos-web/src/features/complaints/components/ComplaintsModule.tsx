import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintsApi } from '../api/api';
import {
  useUpdateComplaintStatus,
  useAssignComplaint,
  useStartWork,
  useCompleteWork,
  useVerifyClose,
} from '../hooks/useComplaints';
import { officersApi } from '../../officers/api/api';
import { useAuthStore } from '../../../store/auth.store';
import {
  FileText,
  Search,
  Plus,
  ChevronDown,
  User,
  Clock,
  MapPin,
  CheckCircle2,
  Play,
  ShieldCheck,
  Eye,
  Camera,
  X,
  ExternalLink,
  Phone,
  Briefcase,
  AlertTriangle,
  Zap,
  Landmark,
  FileCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateComplaintModal from './CreateComplaintModal';
import { ComplaintStatus, Complaint, MlaDirective } from '../types';

const STATUS_FLOW: ComplaintStatus[] = [
  'NEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'WORK_COMPLETED',
  'RESOLVED',
  'CLOSED',
  'REOPENED',
];

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  ASSIGNED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  IN_PROGRESS: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  WORK_COMPLETED: 'bg-teal-500/15 text-teal-400 border-teal-500/40 font-semibold',
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

/* ─── SLA Countdown Chip ─── */
function SlaBadge({ complaint }: { complaint: Complaint }) {
  if (['RESOLVED', 'CLOSED'].includes(complaint.status)) {
    return (
      <span className="text-[10px] text-green-400 font-medium flex items-center gap-1">
        <CheckCircle2 size={10} /> SLA Met
      </span>
    );
  }

  if (!complaint.slaDeadline) {
    return <span className="text-[10px] text-muted-foreground">SLA Pending</span>;
  }

  const deadline = new Date(complaint.slaDeadline).getTime();
  const now = Date.now();
  const diffMs = deadline - now;
  const isBreached = complaint.slaBreached || diffMs <= 0;

  if (isBreached) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
        <AlertTriangle size={10} /> BREACHED
      </span>
    );
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const isUrgent = hours <= 4;

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
        isUrgent
          ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
          : 'bg-secondary text-muted-foreground border-border'
      }`}
    >
      <Clock size={10} /> {hours}h {mins}m left
    </span>
  );
}

/* ─── Issue MLA Directive Modal ─── */
function IssueMlaDirectiveModal({
  complaint,
  isOpen,
  onClose,
}: {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [mlaName, setMlaName] = useState('Hon. Suresh Angadi');
  const [constituency, setConstituency] = useState('Central Bengaluru');
  const [directiveType, setDirectiveType] = useState('URGENT_INQUIRY');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const issueMutation = useMutation({
    mutationFn: (data: any) => complaintsApi.issueDirective(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setNotes('');
      onClose();
    },
  });

  if (!isOpen || !complaint) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    issueMutation.mutate({
      complaintId: complaint.id,
      mlaName: mlaName.trim(),
      constituency: constituency.trim(),
      directiveType,
      instructionNotes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-amber-500/30 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Landmark size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Issue MLA Legislative Directive
              </h3>
              <p className="text-xs text-muted-foreground">
                High-priority oversight order for {complaint.complaintNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                MLA / Representative Name *
              </label>
              <input
                type="text"
                required
                value={mlaName}
                onChange={(e) => setMlaName(e.target.value)}
                className="w-full px-3 py-2 bg-secondary rounded-xl text-xs border border-border focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Constituency *
              </label>
              <input
                type="text"
                required
                value={constituency}
                onChange={(e) => setConstituency(e.target.value)}
                className="w-full px-3 py-2 bg-secondary rounded-xl text-xs border border-border focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Directive Type *
            </label>
            <select
              value={directiveType}
              onChange={(e) => setDirectiveType(e.target.value)}
              className="w-full px-3 py-2 bg-secondary rounded-xl text-xs border border-border focus:border-amber-500 focus:outline-none"
            >
              <option value="URGENT_INQUIRY">Urgent Legislative Inquiry</option>
              <option value="EXPEDITE_RESOLUTION">Expedite Resolution Order</option>
              <option value="CITIZEN_REPRESENTATION">Citizen Grievance Representation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Instruction / Legislative Directive Notes *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. MLA Office received direct complaint. Municipal engineers must inspect site and report resolution progress within 4 hours."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-secondary rounded-xl text-xs border border-border focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
            <strong>Impact:</strong> Submitting will automatically escalate this complaint to{' '}
            <span className="font-bold text-red-400">CRITICAL</span> priority and tier-3 legislative tracking.
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!notes.trim() || issueMutation.isPending}
              className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm"
            >
              {issueMutation.isPending ? 'Issuing Directive...' : 'Confirm Legislative Directive'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Assign Officer Modal ─── */
function AssignModal({
  complaint,
  isOpen,
  onClose,
}: {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const assignMutation = useAssignComplaint();

  const { data: officers, isLoading } = useQuery({
    queryKey: ['officers'],
    queryFn: officersApi.list,
    enabled: isOpen,
  });

  if (!isOpen || !complaint) return null;

  const handleAssign = () => {
    if (!selectedOfficerId) return;
    assignMutation.mutate(
      { id: complaint.id, officerId: selectedOfficerId },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-bold">Dispatch Field Officer</h3>
            <p className="text-xs text-muted-foreground">
              Assign task for {complaint.complaintNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground">
            Select Officer
          </label>
          {isLoading ? (
            <div className="py-4 text-center text-xs text-muted-foreground animate-pulse">
              Loading field officers...
            </div>
          ) : (
            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary rounded-xl text-sm border border-border focus:border-govos-blue focus:outline-none"
            >
              <option value="">-- Choose Field Officer --</option>
              {officers?.map((off: any) => (
                <option key={off.id} value={off.id}>
                  {off.fullName || off.displayName || off.email} (
                  {off.designation || 'Field Officer'})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedOfficerId || assignMutation.isPending}
            className="px-4 py-2 text-xs font-semibold bg-govos-blue hover:bg-govos-blue/90 text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm"
          >
            {assignMutation.isPending ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Complete Work & Evidence Modal ─── */
function CompleteWorkModal({
  complaint,
  isOpen,
  onClose,
}: {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const completeMutation = useCompleteWork();

  if (!isOpen || !complaint) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    completeMutation.mutate(
      {
        id: complaint.id,
        notes: notes.trim(),
        evidenceUrl: evidenceUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          setNotes('');
          setEvidenceUrl('');
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">Submit Work Completion</h3>
              <p className="text-xs text-muted-foreground">
                Provide field resolution details & evidence for{' '}
                {complaint.complaintNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Resolution Summary & Action Taken *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Cleared clogged storm drain, replaced broken manhole grate, and tested flow."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-secondary rounded-xl text-sm border border-border focus:border-teal-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Resolution Evidence / Photo URL
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="http://localhost:9000/govos-complaints/evidence-..."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-secondary rounded-xl text-xs border border-border focus:border-teal-500 focus:outline-none font-mono"
              />
              <Camera
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Provide direct image link or MinIO storage URL showing the
              resolved issue.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium bg-secondary hover:bg-secondary/80 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!notes.trim() || completeMutation.isPending}
              className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm"
            >
              {completeMutation.isPending
                ? 'Submitting Proof...'
                : 'Mark Work Completed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Complaint Inspection Detail Modal ─── */
function ComplaintDetailModal({
  complaint,
  isOpen,
  onClose,
}: {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !complaint) return null;

  // Fetch directives for this complaint
  const { data: directives } = useQuery({
    queryKey: ['directives', complaint.id],
    queryFn: () => complaintsApi.getDirectivesForComplaint(complaint.id),
    enabled: isOpen && !!complaint.id,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-govos-blue">
                {complaint.complaintNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  STATUS_COLORS[complaint.status]
                }`}
              >
                {complaint.status.replace('_', ' ')}
              </span>
              <span
                className={`text-xs uppercase font-bold ${
                  PRIORITY_COLORS[complaint.priority]
                }`}
              >
                {complaint.priority}
              </span>
              <SlaBadge complaint={complaint} />
              {(complaint.escalationLevel ?? 0) >= 3 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                  <Zap size={11} className="text-amber-400 fill-amber-400" />
                  MLA DIRECTIVE
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold mt-1.5">{complaint.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl bg-secondary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Description & Citizen Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/40 rounded-2xl border border-border space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Citizen / Reporter
            </h4>
            <div className="text-sm font-medium">
              {complaint.reporterName || 'Anonymous Citizen'}
            </div>
            {complaint.reporterMobile && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone size={12} />
                <span>{complaint.reporterMobile}</span>
              </div>
            )}
            <div className="text-xs text-muted-foreground pt-1">
              Source:{' '}
              <span className="font-semibold text-foreground">
                {complaint.source || 'PUBLIC'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-secondary/40 rounded-2xl border border-border space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Jurisdiction & Location
            </h4>
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin size={14} className="text-govos-blue mt-0.5 shrink-0" />
              <span>{complaint.locationAddress || 'Address not logged'}</span>
            </div>
            {complaint.latitude && complaint.longitude && (
              <div className="text-[11px] font-mono text-muted-foreground/80 pl-5">
                GPS: {complaint.latitude.toFixed(4)},{' '}
                {complaint.longitude.toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {/* Issue Details */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Complaint Description
          </h4>
          <p className="text-sm text-foreground bg-secondary/20 p-4 rounded-2xl border border-border whitespace-pre-line leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* MLA Directives (Legislative Oversight) Section */}
        {directives && directives.length > 0 && (
          <div className="p-5 bg-amber-500/5 border border-amber-500/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Landmark size={18} />
              Legislative Oversight / MLA Directives ({directives.length})
            </div>
            <div className="space-y-3 pl-6">
              {directives.map((d: any) => (
                <div key={d.id} className="p-3 bg-secondary/60 rounded-xl border border-amber-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-amber-300">
                    <span>{d.mlaName} ({d.constituency})</span>
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      {d.directiveType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-foreground/90 whitespace-pre-line">{d.instructionNotes}</p>
                  <div className="text-[10px] text-muted-foreground pt-1">
                    Issued on: {new Date(d.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Field Resolution & Evidence section */}
        {(complaint.resolutionNotes || complaint.resolutionEvidenceUrl) && (
          <div className="p-5 bg-teal-500/5 border border-teal-500/20 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <CheckCircle2 size={18} />
              Field Officer Resolution Report
            </div>
            {complaint.resolutionNotes && (
              <div className="text-sm text-foreground/90 pl-6">
                {complaint.resolutionNotes}
              </div>
            )}
            {complaint.resolutionEvidenceUrl && (
              <div className="pl-6 pt-2">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Resolution Photo / Verification Evidence:
                </p>
                <a
                  href={complaint.resolutionEvidenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-xs rounded-xl hover:bg-secondary/80 transition-colors font-mono text-govos-blue"
                >
                  <Camera size={13} />
                  View Resolution Proof
                  <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Lifecycle Timestamps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-muted-foreground border-t border-border pt-4">
          <div>
            <span className="block font-semibold text-foreground">Filed:</span>
            {new Date(complaint.createdAt).toLocaleString('en-IN')}
          </div>
          {complaint.workStartedAt && (
            <div>
              <span className="block font-semibold text-foreground">
                Work Started:
              </span>
              {new Date(complaint.workStartedAt).toLocaleString('en-IN')}
            </div>
          )}
          {complaint.workCompletedAt && (
            <div>
              <span className="block font-semibold text-foreground">
                Work Completed:
              </span>
              {new Date(complaint.workCompletedAt).toLocaleString('en-IN')}
            </div>
          )}
          {complaint.resolvedAt && (
            <div>
              <span className="block font-semibold text-foreground">
                Verified & Closed:
              </span>
              {new Date(complaint.resolvedAt).toLocaleString('en-IN')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Status Dropdown ─── */
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
        className={`appearance-none flex items-center gap-1.5 px-3 py-1.5 pr-8 rounded-full text-xs font-semibold border outline-none cursor-pointer transition-all ${
          STATUS_COLORS[complaint.status]
        }`}
      >
        {STATUS_FLOW.map((s) => (
          <option
            key={s}
            value={s}
            className="bg-card text-foreground font-medium"
          >
            {s.replace('_', ' ')}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
          STATUS_COLORS[complaint.status].split(' ')[1]
        }`}
      />
    </div>
  );
}

/* ─── Main Complaints Module ─── */
export default function ComplaintsModule() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>(
    'ALL'
  );
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  // Modals state
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Complaint | null>(null);
  const [inspectTarget, setInspectTarget] = useState<Complaint | null>(null);
  const [mlaTarget, setMlaTarget] = useState<Complaint | null>(null);

  const user = useAuthStore((s) => s.user);

  // Action mutations
  const startWorkMutation = useStartWork();
  const verifyCloseMutation = useVerifyClose();

  const {
    data: complaints,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['complaints'],
    queryFn: complaintsApi.list,
  });

  const isOfficer = user?.primaryRole === 'OFFICER';
  const isAdmin = ['SUPER_ADMIN', 'TENANT_ADMIN'].includes(
    user?.primaryRole ?? ''
  );

  const filtered = complaints?.filter((c) => {
    const matchSearch =
      !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.complaintNumber ?? '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (c.reporterName ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchPriority =
      priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchMyTasks = myTasksOnly ? c.assignedToId === user?.id : true;
    return matchSearch && matchStatus && matchPriority && matchMyTasks;
  });

  const canCreate = ['SUPER_ADMIN', 'TENANT_ADMIN', 'OFFICER', 'CITIZEN'].includes(
    user?.primaryRole ?? ''
  );

  return (
    <div className="p-6 md:p-8 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="text-govos-blue" />
            Civic Issue Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            SLA deadlines, field officer tasks, and legislative oversight orders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* My Tasks Toggle */}
          {(isOfficer || isAdmin) && (
            <button
              onClick={() => setMyTasksOnly(!myTasksOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                myTasksOnly
                  ? 'bg-govos-blue text-white border-govos-blue shadow-md shadow-govos-blue/20'
                  : 'bg-secondary text-muted-foreground hover:text-foreground border-border'
              }`}
            >
              <Briefcase size={13} />
              My Assigned Tasks
            </button>
          )}

          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search ID, Title, Citizen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-secondary rounded-xl text-xs border border-transparent focus:border-govos-blue focus:outline-none w-56 transition-all"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ComplaintStatus | 'ALL')
            }
            className="px-3 py-2 bg-secondary rounded-xl text-xs border border-transparent focus:border-govos-blue focus:outline-none transition-all"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_FLOW.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-secondary rounded-xl text-xs border border-transparent focus:border-govos-blue focus:outline-none transition-all"
          >
            <option value="ALL">All Priorities</option>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {canCreate && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-govos-blue hover:bg-govos-blue/90 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus size={14} />
              New Complaint
            </button>
          )}
        </div>
      </div>

      {/* KPI stats bar */}
      {!isLoading && complaints && (
        <div className="flex flex-wrap gap-2.5">
          {(
            [
              'NEW',
              'ASSIGNED',
              'IN_PROGRESS',
              'WORK_COMPLETED',
              'RESOLVED',
            ] as ComplaintStatus[]
          ).map((s) => {
            const count = complaints.filter((c) => c.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'ALL' : s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  statusFilter === s
                    ? STATUS_COLORS[s] + ' ring-1 ring-offset-1 ring-current'
                    : STATUS_COLORS[s] + ' opacity-70 hover:opacity-100'
                }`}
              >
                {s.replace('_', ' ')} · {count}
              </button>
            );
          })}
        </div>
      )}

      {/* Complaints Table */}
      <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/60 text-muted-foreground uppercase text-[11px] font-semibold sticky top-0">
              <tr>
                <th className="px-5 py-3.5">Complaint #</th>
                <th className="px-5 py-3.5">Title & Citizen</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Priority & SLA</th>
                <th className="px-5 py-3.5">Assigned Officer</th>
                <th className="px-5 py-3.5">Resolution Actions</th>
                <th className="px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-secondary/70 rounded-lg animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-red-500">
                    Failed to load complaints. Ensure backend is running.
                  </td>
                </tr>
              ) : (filtered ?? []).length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-muted-foreground"
                  >
                    <FileText size={36} className="mx-auto mb-3 opacity-25" />
                    No complaints found matching current filters.
                  </td>
                </tr>
              ) : (
                (filtered ?? []).map((complaint, index) => (
                  <motion.tr
                    key={complaint.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-secondary/30 transition-colors group"
                  >
                    {/* Complaint Number & Tag */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-govos-blue">
                          {complaint.complaintNumber ||
                            complaint.id.slice(0, 8).toUpperCase()}
                        </span>
                        {(complaint.escalationLevel ?? 0) >= 3 && (
                          <span
                            title="Under Active MLA Directive"
                            className="p-0.5 rounded bg-amber-500/20 text-amber-300"
                          >
                            <Zap size={12} className="fill-amber-400 text-amber-400" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(complaint.createdAt).toLocaleDateString(
                          'en-IN'
                        )}
                      </div>
                    </td>

                    {/* Title & Citizen Info */}
                    <td className="px-5 py-4">
                      <div
                        className="font-medium max-w-[220px] truncate"
                        title={complaint.title}
                      >
                        {complaint.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        {complaint.category && (
                          <span className="text-[11px] bg-secondary px-1.5 py-0.5 rounded">
                            {complaint.category}
                          </span>
                        )}
                        {complaint.reporterName && (
                          <span className="truncate max-w-[120px]">
                            {complaint.reporterName}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status with dropdown */}
                    <td className="px-5 py-4">
                      <StatusDropdown complaint={complaint} />
                    </td>

                    {/* Priority & SLA */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`text-xs font-semibold ${
                            PRIORITY_COLORS[complaint.priority] ??
                            'text-muted-foreground'
                          }`}
                        >
                          {complaint.priority || 'MEDIUM'}
                        </span>
                        <SlaBadge complaint={complaint} />
                      </div>
                    </td>

                    {/* Assigned Officer */}
                    <td className="px-5 py-4">
                      {complaint.assignedToId ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <User size={12} className="text-govos-blue" />
                          <span className="font-mono text-muted-foreground">
                            {complaint.assignedToId.slice(0, 8)}…
                          </span>
                          {isAdmin && (
                            <button
                              onClick={() => setAssignTarget(complaint)}
                              className="text-[10px] text-govos-blue hover:underline ml-1"
                            >
                              Reassign
                            </button>
                          )}
                        </div>
                      ) : (
                        <div>
                          {isAdmin ? (
                            <button
                              onClick={() => setAssignTarget(complaint)}
                              className="px-2.5 py-1 text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition-colors font-medium flex items-center gap-1"
                            >
                              <User size={11} />
                              Assign Officer
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Unassigned
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Resolution Action Triggers */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {/* If ASSIGNED: Start Work */}
                        {complaint.status === 'ASSIGNED' && (
                          <button
                            onClick={() =>
                              startWorkMutation.mutate(complaint.id)
                            }
                            disabled={startWorkMutation.isPending}
                            className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <Play size={11} />
                            Start Work
                          </button>
                        )}

                        {/* If IN_PROGRESS: Submit Resolution Evidence */}
                        {complaint.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => setCompleteTarget(complaint)}
                            className="px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                          >
                            <CheckCircle2 size={11} />
                            Complete Work
                          </button>
                        )}

                        {/* If WORK_COMPLETED: Verify & Close (Admin) */}
                        {complaint.status === 'WORK_COMPLETED' && (
                          <>
                            {isAdmin ? (
                              <button
                                onClick={() =>
                                  verifyCloseMutation.mutate({
                                    id: complaint.id,
                                    notes: 'Verified by Admin',
                                  })
                                }
                                disabled={verifyCloseMutation.isPending}
                                className="px-2.5 py-1 bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                              >
                                <ShieldCheck size={11} />
                                Verify & Close
                              </button>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[11px] bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                                Evidence Submitted
                              </span>
                            )}
                          </>
                        )}

                        {/* If RESOLVED / CLOSED */}
                        {['RESOLVED', 'CLOSED'].includes(complaint.status) && (
                          <span className="text-xs text-green-400/80 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Closed
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions & Inspection */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {isAdmin && (
                          <button
                            onClick={() => setMlaTarget(complaint)}
                            className="p-1.5 text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Issue MLA Directive"
                          >
                            <Landmark size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => setInspectTarget(complaint)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                          title="View Full Details"
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateComplaintModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <AssignModal
        complaint={assignTarget}
        isOpen={!!assignTarget}
        onClose={() => setAssignTarget(null)}
      />

      <CompleteWorkModal
        complaint={completeTarget}
        isOpen={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
      />

      <ComplaintDetailModal
        complaint={inspectTarget}
        isOpen={!!inspectTarget}
        onClose={() => setInspectTarget(null)}
      />

      <IssueMlaDirectiveModal
        complaint={mlaTarget}
        isOpen={!!mlaTarget}
        onClose={() => setMlaTarget(null)}
      />
    </div>
  );
}
