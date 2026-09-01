import React from 'react';
import { useAuthStore } from '../../../store/auth.store';
import { useDashboardSummary } from '../hooks/useDashboard';
import { useDashboardRealtime } from '../hooks/useDashboardRealtime';
import { ModuleSkeleton } from '../../../components/ui/ModuleSkeleton';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { TenantAdminDashboard } from './TenantAdminDashboard';
import { OfficerDashboard } from './OfficerDashboard';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuthStore();
  
  // Connect Socket.IO listeners
  useDashboardRealtime();

  const { data: summary, isLoading, error } = useDashboardSummary();

  if (isLoading) return <ModuleSkeleton />;
  if (error) return <div className="p-8 text-red-500">Failed to load dashboard metrics.</div>;

  const role = user?.primaryRole || 'UNKNOWN';
  const metrics = summary?.metrics || {};

  return (
    <div className="p-6 md:p-8 space-y-8 h-full bg-background overflow-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.fullName || 'User'}. Here's what's happening.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {role === 'SUPER_ADMIN' && <SuperAdminDashboard metrics={metrics} />}
        {role === 'TENANT_ADMIN' && <TenantAdminDashboard metrics={metrics} />}
        {role === 'OFFICER' && <OfficerDashboard metrics={metrics} />}
        {!['SUPER_ADMIN', 'TENANT_ADMIN', 'OFFICER'].includes(role) && (
          <div className="p-8 text-center text-muted-foreground border rounded-2xl">
            No specific dashboard widgets available for role: {role}
          </div>
        )}
      </motion.div>
    </div>
  );
}
