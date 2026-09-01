import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Activity, Users, Shield, Server, Zap, Globe, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../../analytics/api/api';

interface Props {
  metrics: Record<string, any>;
}

function KpiCard({ title, value, icon: Icon, color, bg, delay = 0 }: {
  title: string; value: any; icon: React.ElementType; color: string; bg: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4 hover:border-govos-blue/50 transition-all hover:shadow-lg hover:shadow-govos-blue/5"
    >
      <div className={`p-4 rounded-xl ${bg}`}>
        <Icon className={`w-7 h-7 ${color}`} />
      </div>
      <div>
        <p className="text-muted-foreground font-medium text-sm">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-foreground">{value ?? '—'}</h3>
      </div>
    </motion.div>
  );
}

export const SuperAdminDashboard: React.FC<Props> = ({ metrics }) => {
  const { data: analytics } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary(),
    staleTime: 60_000,
  });

  const kpis = [
    { title: 'Total Tenants', value: metrics.totalTenants || 1, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'System Health', value: metrics.systemHealth || 'HEALTHY', icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'Active Officers', value: analytics?.activeOfficers ?? metrics.activeOfficers ?? 0, icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Registered Citizens', value: analytics?.registeredCitizens ?? 0, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const systemStats = [
    { label: 'Complaints (All Tenants)', value: analytics?.totalComplaints ?? 0, icon: CheckCircle2, color: 'text-govos-blue' },
    { label: 'Active Assets', value: analytics?.activeAssets ?? 0, icon: Server, color: 'text-green-500' },
    { label: 'Ongoing Projects', value: analytics?.ongoingProjects ?? 0, icon: Zap, color: 'text-amber-500' },
    { label: 'Total Documents', value: analytics?.totalDocuments ?? 0, icon: Globe, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <KpiCard key={kpi.title} {...kpi} delay={idx * 0.08} />
        ))}
      </div>

      {/* System-wide Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
          System-Wide Telemetry
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemStats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex flex-col gap-2 p-4 bg-secondary/40 rounded-xl">
              <Icon size={20} className={color} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Budget Utilization */}
      {(analytics?.budgetUtilization !== undefined) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Platform Budget Utilization
            </h2>
            <span className={`text-lg font-bold ${analytics.budgetUtilization > 90 ? 'text-red-500' : analytics.budgetUtilization > 70 ? 'text-amber-500' : 'text-green-500'}`}>
              {analytics.budgetUtilization}%
            </span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(analytics.budgetUtilization, 100)}%` }}
              transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${analytics.budgetUtilization > 90 ? 'bg-red-500' : analytics.budgetUtilization > 70 ? 'bg-amber-500' : 'bg-govos-blue'}`}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Across all active municipal projects in this tenant</p>
        </motion.div>
      )}
    </div>
  );
};
