import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/api';
import { useUiStore } from '../../../store/ui.store';
import { useAuthStore } from '../../../store/auth.store';
import { Settings, Shield, Activity, Users, Database, Search, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RoleGuard from '../../../components/ui/RoleGuard';

type Tab = 'audit' | 'users' | 'tenant';

const TAB_ITEMS: { id: Tab; label: string; icon: React.ElementType; roles?: string[] }[] = [
  { id: 'audit', label: 'Audit Logs', icon: Activity },
  { id: 'users', label: 'User Management', icon: Users, roles: ['SUPER_ADMIN', 'TENANT_ADMIN'] },
  { id: 'tenant', label: 'Tenant Config', icon: Database, roles: ['SUPER_ADMIN', 'TENANT_ADMIN'] },
];

export default function AdminConsole() {
  const { setActiveModule } = useUiStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('audit');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    setActiveModule('admin');
  }, [setActiveModule]);

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => adminApi.getAuditLogs(),
    enabled: activeTab === 'audit',
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
    enabled: activeTab === 'users',
    retry: false,
  });

  const { data: tenantConfig, isLoading: tenantLoading } = useQuery({
    queryKey: ['admin-tenant'],
    queryFn: () => adminApi.getTenantConfig(),
    enabled: activeTab === 'tenant',
    retry: false,
  });

  const filteredLogs = auditLogs?.filter((log: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.user?.toLowerCase().includes(q) ||
      log.resourceType?.toLowerCase().includes(q)
    );
  });

  const filteredUsers = users?.filter((u: any) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.primaryRole?.toLowerCase().includes(q)
    );
  });

  const visibleTabs = TAB_ITEMS.filter(tab =>
    !tab.roles || tab.roles.includes(user?.primaryRole ?? '')
  );

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto flex flex-col h-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="text-govos-blue" />
          System Administration
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Tenant configuration, RBAC, and system audit logs.</p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RoleGuard allowedRoles={['TENANT_ADMIN', 'SUPER_ADMIN']} fallback={null}>
          <button
            onClick={() => setActiveTab('users')}
            className={`bg-card border p-5 rounded-xl hover:shadow-md transition-all cursor-pointer text-left ${activeTab === 'users' ? 'border-govos-blue ring-1 ring-govos-blue' : 'border-border'}`}
          >
            <Shield className="text-govos-blue mb-3" size={22} />
            <h3 className="font-semibold mb-0.5">Roles & Permissions</h3>
            <p className="text-xs text-muted-foreground">Manage access control and provisioning.</p>
          </button>
        </RoleGuard>
        <RoleGuard allowedRoles={['TENANT_ADMIN', 'SUPER_ADMIN']} fallback={null}>
          <button
            onClick={() => setActiveTab('users')}
            className={`bg-card border p-5 rounded-xl hover:shadow-md transition-all cursor-pointer text-left ${activeTab === 'users' ? 'border-govos-blue ring-1 ring-govos-blue' : 'border-border'}`}
          >
            <Users className="text-green-500 mb-3" size={22} />
            <h3 className="font-semibold mb-0.5">User Management</h3>
            <p className="text-xs text-muted-foreground">Provision and suspend government employees.</p>
          </button>
        </RoleGuard>
        <RoleGuard allowedRoles={['TENANT_ADMIN', 'SUPER_ADMIN']} fallback={null}>
          <button
            onClick={() => setActiveTab('tenant')}
            className={`bg-card border p-5 rounded-xl hover:shadow-md transition-all cursor-pointer text-left ${activeTab === 'tenant' ? 'border-govos-blue ring-1 ring-govos-blue' : 'border-border'}`}
          >
            <Database className="text-amber-500 mb-3" size={22} />
            <h3 className="font-semibold mb-0.5">Tenant Configuration</h3>
            <p className="text-xs text-muted-foreground">Configure ward boundaries and departments.</p>
          </button>
        </RoleGuard>
        <button
          onClick={() => setActiveTab('audit')}
          className={`bg-card border p-5 rounded-xl hover:shadow-md transition-all cursor-pointer text-left ${activeTab === 'audit' ? 'border-govos-blue ring-1 ring-govos-blue' : 'border-border'}`}
        >
          <Activity className="text-purple-500 mb-3" size={22} />
          <h3 className="font-semibold mb-0.5">Audit Logs</h3>
          <p className="text-xs text-muted-foreground">View real-time system activity and events.</p>
        </button>
      </div>

      {/* Tab Panel */}
      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Tab Header */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-4">
          <div className="flex">
            {visibleTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-govos-blue text-govos-blue'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative py-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-secondary rounded-md text-sm border-transparent focus:border-govos-blue focus:ring-1 focus:ring-govos-blue w-48 transition-all"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="overflow-x-auto flex-1">
          <AnimatePresence mode="wait">
            {/* AUDIT LOGS TAB */}
            {activeTab === 'audit' && (
              <motion.div
                key="audit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Resource</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {logsLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {[1, 2, 3, 4].map(j => (
                            <td key={j} className="px-6 py-4">
                              <div className="h-4 bg-secondary/70 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (filteredLogs ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                          <Clock size={32} className="mx-auto mb-3 opacity-20" />
                          {searchTerm ? `No logs matching "${searchTerm}"` : 'No audit events recorded yet.'}
                        </td>
                      </tr>
                    ) : (
                      (filteredLogs ?? []).map((log: any) => (
                        <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-govos-blue">{log.action}</span>
                          </td>
                          <td className="px-6 py-4 font-medium">{log.user}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-secondary text-muted-foreground rounded-md text-xs font-mono">
                              {log.resourceType}: {log.resourceId?.slice(0, 8)}…
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Phone / Email</th>
                      <th className="px-6 py-4">Primary Role</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {usersLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {[1, 2, 3, 4].map(j => (
                            <td key={j} className="px-6 py-4">
                              <div className="h-4 bg-secondary/70 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (filteredUsers ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                          <Users size={32} className="mx-auto mb-3 opacity-20" />
                          {searchTerm ? `No users matching "${searchTerm}"` : 'No users found. Users API may not be available.'}
                        </td>
                      </tr>
                    ) : (
                      (filteredUsers ?? []).map((u: any) => (
                        <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-govos-blue/10 text-govos-blue flex items-center justify-center font-bold text-sm">
                                {u.fullName?.charAt(0) || u.displayName?.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="font-medium">{u.fullName || u.displayName}</p>
                                <p className="text-xs text-muted-foreground font-mono">{u.id?.slice(0, 8)}…</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">{u.phone || u.email || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-govos-blue/10 text-govos-blue rounded-full text-xs font-semibold">
                              {u.primaryRole?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${u.isDeleted ? 'text-red-500' : 'text-green-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.isDeleted ? 'bg-red-500' : 'bg-green-500'}`} />
                              {u.isDeleted ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}

            {/* TENANT CONFIG TAB */}
            {activeTab === 'tenant' && (
              <motion.div
                key="tenant"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                {tenantLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 bg-secondary/70 rounded animate-pulse" />
                    ))}
                  </div>
                ) : !tenantConfig ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <AlertCircle size={32} className="mx-auto mb-3 opacity-20" />
                    <p>Tenant configuration endpoint not yet available.</p>
                    <p className="text-xs mt-1">This will display ward boundaries, department mappings, and locale settings.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(tenantConfig).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-border">
                        <span className="text-sm font-medium text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-semibold font-mono">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
