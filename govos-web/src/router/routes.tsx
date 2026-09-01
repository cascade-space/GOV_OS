import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from '../shell/AppShell';
import LoginPage from '../features/auth/components/LoginPage';
import ProtectedRoute from '../components/ui/ProtectedRoute';
import RoleGuard from '../components/ui/RoleGuard';
import ComplaintsModule from '../features/complaints/components/ComplaintsModule';
import OfficerList from '../features/officers/components/OfficerList';
import CitizenList from '../features/citizens/components/CitizenList';
import AssetRegistry from '../features/assets/components/AssetRegistry';
import ProjectTracker from '../features/projects/components/ProjectTracker';
import DocumentManager from '../features/documents/components/DocumentManager';
import AdminConsole from '../features/admin/components/AdminConsole';
import AnalyticsDashboard from '../features/analytics/components/AnalyticsDashboard';
import MapDashboard from '../features/map/components/MapDashboard';

import Dashboard from '../features/dashboard/components/Dashboard';
import NotificationsPage from '../features/notifications/components/NotificationsPage';

// Temporary skeletons for unimplemented modules


export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'documents',
        element: <DocumentManager />,
      },
      {
        path: 'officers',
        element: <RoleGuard allowedRoles={['TENANT_ADMIN', 'OFFICER']}><OfficerList /></RoleGuard>,
      },
      {
        path: 'citizens',
        element: <CitizenList />,
      },
      {
        path: 'admin',
        element: <RoleGuard allowedRoles={['TENANT_ADMIN']}><AdminConsole /></RoleGuard>,
      },
      {
        path: 'projects',
        element: <ProjectTracker />,
      },
      {
        path: 'complaints',
        element: <ComplaintsModule />,
      },
      {
        path: 'assets',
        element: <AssetRegistry />,
      },
      {
        path: 'analytics',
        element: <RoleGuard allowedRoles={['TENANT_ADMIN', 'OFFICER']}><AnalyticsDashboard /></RoleGuard>,
      },
      {
        path: 'map',
        element: <MapDashboard />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      }
    ],
  },
]);
