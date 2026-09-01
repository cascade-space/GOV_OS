import React from 'react';
import { useUiStore } from '../store/ui.store';
import { useAuthStore } from '../store/auth.store';
import { useNotificationStore } from '../store/notification.store';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Building, HardHat, FileSpreadsheet, Briefcase, BarChart3, Settings, LogOut, Bell, Map } from 'lucide-react';
import RoleGuard from '../components/ui/RoleGuard';

export default function Sidebar() {
  const { sidebarOpen, activeModule, setActiveModule } = useUiStore();
  const { tenant, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const handleModuleClick = (moduleName: any) => {
    setActiveModule(moduleName);
    navigate(`/${moduleName}`);
  };

  const navItems = [
    { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
    { name: 'Complaints', id: 'complaints', icon: FileText },
    { name: 'Citizens', id: 'citizens', icon: Users, roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPT_HEAD'] },
    { name: 'Assets', id: 'assets', icon: Building },
    { name: 'Projects', id: 'projects', icon: HardHat, roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPT_HEAD'] },
    { name: 'Documents', id: 'documents', icon: FileSpreadsheet },
    { name: 'Officers', id: 'officers', icon: Briefcase, roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPT_HEAD'] },
    { name: 'Analytics', id: 'analytics', icon: BarChart3, roles: ['SUPER_ADMIN', 'TENANT_ADMIN', 'DEPT_HEAD', 'REP'] },
    { name: 'Map', id: 'map', icon: Map },
    { name: 'Notifications', id: 'notifications', icon: Bell },
  ];

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-card border-r border-border h-full flex flex-col transition-all duration-300 relative z-20`}
    >
      <div className="h-16 flex items-center justify-center border-b border-border px-4 overflow-hidden">
        {sidebarOpen ? (
          <div className="flex items-center gap-3 w-full">
            {tenant?.logoUrl ? (
              <img src={tenant.logoUrl} alt="Logo" className="w-8 h-8 rounded-md" />
            ) : (
              <div className="w-8 h-8 rounded-md bg-govos-blue flex items-center justify-center text-white font-bold">
                {tenant?.code?.substring(0, 2) || 'GV'}
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm truncate">{tenant?.name || 'GovOS'}</span>
              <span className="text-xs text-muted-foreground truncate">MTAS Engine</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-md bg-govos-blue flex items-center justify-center text-white font-bold">
            {tenant?.code?.substring(0, 2) || 'GV'}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const content = (
            <button
              onClick={() => handleModuleClick(item.id)}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} h-10 rounded-md transition-colors ${
                activeModule === item.id 
                  ? 'bg-govos-blue/10 text-govos-blue font-medium' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
              title={!sidebarOpen ? item.name : undefined}
            >
              <item.icon size={20} className={activeModule === item.id ? 'text-govos-blue' : ''} />
              {sidebarOpen && <span className="ml-3 flex-1">{item.name}</span>}
              {sidebarOpen && item.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
              {!sidebarOpen && item.id === 'notifications' && unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          );

          if (item.roles) {
            return (
              <RoleGuard key={item.id} allowedRoles={item.roles} fallback={null}>
                {content}
              </RoleGuard>
            );
          }
          return <React.Fragment key={item.id}>{content}</React.Fragment>;
        })}
      </nav>

      <div className="p-2 border-t border-border space-y-1">
        <RoleGuard allowedRoles={['SUPER_ADMIN', 'TENANT_ADMIN']} fallback={null}>
          <button
            onClick={() => handleModuleClick('admin')}
            className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} h-10 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors`}
            title={!sidebarOpen ? 'Administration' : undefined}
          >
            <Settings size={20} />
            {sidebarOpen && <span className="ml-3">Admin</span>}
          </button>
        </RoleGuard>
        
        <button
          onClick={() => {
            logout();
          }}
          className={`w-full flex items-center ${sidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} h-10 rounded-md text-red-500 hover:bg-red-500/10 transition-colors`}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {sidebarOpen && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
