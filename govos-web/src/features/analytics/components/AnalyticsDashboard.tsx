import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/api';
import { useUiStore } from '../../../store/ui.store';
import {
  BarChart as BarChartIcon, TrendingUp, Users, Target, IndianRupee, Download,
  Building2, HardHat, FileText, Truck, Shield
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

function KpiCard({
  label, value, sub, icon: Icon, color
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card border border-border p-6 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-muted-foreground text-sm">{label}</h3>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-bold">{value ?? '—'}</p>
      {sub && <p className="text-xs text-muted-foreground mt-2">{sub}</p>}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { setActiveModule } = useUiStore();

  useEffect(() => {
    setActiveModule('analytics');
  }, [setActiveModule]);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => analyticsApi.getSummary(),
  });

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col h-full space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-secondary rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-card border border-border rounded-xl" />)}
        </div>
        <div className="h-[400px] bg-card border border-border rounded-xl" />
      </div>
    );
  }

  const resolutionRate = summary?.totalComplaints
    ? Math.round((summary.resolvedComplaints / summary.totalComplaints) * 100)
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col h-full space-y-8 overflow-y-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChartIcon className="text-govos-blue" />
            Command Center Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time telemetry of municipal operations and citizen satisfaction.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-secondary text-sm font-medium transition-colors">
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {/* Primary KPIs — Complaints */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Complaint Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            label="Total Complaints"
            value={summary?.totalComplaints ?? 0}
            sub="All-time in this tenant"
            icon={TrendingUp}
            color="bg-govos-blue/10 text-govos-blue"
          />
          <KpiCard
            label="Resolution Rate"
            value={`${resolutionRate}%`}
            sub={`${summary?.resolvedComplaints ?? 0} resolved`}
            icon={Target}
            color="bg-green-500/10 text-green-600"
          />
          <KpiCard
            label="Citizen Satisfaction"
            value={`${summary?.citizenSatisfactionScore?.toFixed(1) ?? '—'} / 5.0`}
            sub="Derived from resolution rate"
            icon={Users}
            color="bg-amber-500/10 text-amber-500"
          />
          <KpiCard
            label="Budget Utilization"
            value={`${summary?.budgetUtilization ?? 0}%`}
            sub="Across all active projects"
            icon={IndianRupee}
            color="bg-purple-500/10 text-purple-600"
          />
        </div>
      </div>

      {/* Budget utilization bar */}
      {(summary?.budgetUtilization !== undefined) && (
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden -mt-4">
          <div
            className={`h-full rounded-full transition-all ${summary.budgetUtilization > 90 ? 'bg-red-500' : summary.budgetUtilization > 70 ? 'bg-amber-500' : 'bg-govos-blue'}`}
            style={{ width: `${Math.min(summary.budgetUtilization, 100)}%` }}
          />
        </div>
      )}

      {/* Infrastructure KPIs */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Infrastructure Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Registered Citizens', value: summary?.registeredCitizens, icon: Users, color: 'text-govos-blue' },
            { label: 'Active Officers', value: summary?.activeOfficers, icon: Shield, color: 'text-green-500' },
            { label: 'Active Assets', value: summary?.activeAssets, icon: Truck, color: 'text-amber-500' },
            { label: 'Ongoing Projects', value: summary?.ongoingProjects, icon: HardHat, color: 'text-purple-500' },
            { label: 'Total Documents', value: summary?.totalDocuments, icon: FileText, color: 'text-slate-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
              <Icon size={20} className={color} />
              <p className="text-2xl font-bold">{value ?? 0}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaint Volume vs Resolution (real trend data) */}
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="font-semibold text-lg mb-6">Complaint Volume vs Resolution (6 months)</h3>
          <div className="h-[280px] w-full">
            {(summary?.complaintTrends?.length ?? 0) === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No trend data yet — complaints filed this month will appear here.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary?.complaintTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="complaints" name="New Complaints" stroke="#1B4FD8" fill="#1B4FD8" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#16A34A" fill="#16A34A" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly resolved bar chart */}
        <div className="bg-card border border-border p-6 rounded-xl">
          <h3 className="font-semibold text-lg mb-6">Monthly Resolution Performance</h3>
          <div className="h-[280px] w-full">
            {(summary?.complaintTrends?.length ?? 0) === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary?.complaintTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px' }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Bar dataKey="resolved" name="Issues Resolved" fill="#1B4FD8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="complaints" name="Total Filed" fill="#475569" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
