import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, ShieldAlert, CheckCircle2, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../analytics/api/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  metrics: Record<string, any>;
}

function KpiCard({ title, value, icon: Icon, color, bg, trend, delay = 0 }: {
  title: string; value: any; icon: React.ElementType; color: string; bg: string; trend?: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border p-6 rounded-2xl hover:border-govos-blue/50 transition-all hover:shadow-lg hover:shadow-govos-blue/5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <TrendingUp size={12} className="text-green-500" /> {trend}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-foreground">{value ?? '—'}</h3>
      <p className="text-muted-foreground font-medium text-sm mt-1">{title}</p>
    </motion.div>
  );
}

export const TenantAdminDashboard: React.FC<Props> = ({ metrics }) => {
  const { data: analytics } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary(),
    staleTime: 60_000,
  });

  const totalComplaints = metrics.totalComplaints || analytics?.totalComplaints || 0;
  const resolvedComplaints = metrics.resolvedComplaints || analytics?.resolvedComplaints || 0;
  const pendingComplaints = metrics.pendingComplaints || 0;
  const activeOfficers = metrics.activeOfficers || analytics?.activeOfficers || 0;

  const resolutionRate = totalComplaints > 0
    ? Math.round((resolvedComplaints / totalComplaints) * 100)
    : 0;

  const kpis = [
    { title: 'Total Complaints', value: totalComplaints, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Pending / Open', value: pendingComplaints, icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Resolved', value: resolvedComplaints, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'Active Officers', value: activeOfficers, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <KpiCard key={kpi.title} {...kpi} delay={idx * 0.08} />
        ))}
      </div>

      {/* Resolution Rate + SLA Gauge Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resolution Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-4"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider self-start">Resolution Rate</h3>
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" className="text-secondary" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none" stroke="#1B4FD8" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - resolutionRate / 100) }}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{resolutionRate}%</span>
              <span className="text-xs text-muted-foreground">resolved</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{resolvedComplaints} of {totalComplaints} complaints resolved</p>
        </motion.div>

        {/* Complaint Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Complaint Trend (6 months)</h3>
          <div className="h-[180px]">
            {(analytics?.complaintTrends?.length ?? 0) === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                <Clock size={20} className="mr-2 opacity-40" /> No trend data yet — complaints filed this month will appear here.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.complaintTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="complaints" name="Filed" stroke="#1B4FD8" fill="#1B4FD8" fillOpacity={0.15} strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#16A34A" fill="#16A34A" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Infrastructure Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        {[
          { label: 'Active Assets', value: analytics?.activeAssets ?? 0, icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Ongoing Projects', value: analytics?.ongoingProjects ?? 0, icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Total Documents', value: analytics?.totalDocuments ?? 0, icon: FileText, color: 'text-purple-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-secondary/40 rounded-xl p-5 flex items-center gap-4">
            <Icon size={22} className={color} />
            <div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
