import api from '../api-client';

export const superAdminService = {
    getOverview: async () => {
        return api.get('/superadmin/overview');
    },

    getTenants: async () => {
        return api.get('/superadmin/tenants');
    },

    onboardTenant: async (data: Record<string, any>) => {
        return api.post('/superadmin/tenants', data);
    },

    updateTenantStatus: async (id: string, active: boolean) => {
        return api.patch(`/superadmin/tenants/${id}/status`, { active });
    },

    resetCommissionerPassword: async (tenantId: string) => {
        return api.post(`/superadmin/tenants/${tenantId}/commissioner/reset-password`);
    },

    getUsers: async () => {
        return api.get('/superadmin/users');
    },

    getOfficers: async () => {
        return api.get('/superadmin/officers');
    },

    getTrend: async () => {
        return api.get('/superadmin/trend');
    },

    getComplaints: async (params?: Record<string, any>) => {
        return api.get('/superadmin/complaints', { params });
    },

    inspectCity: async (tenantId: string) => {
        return api.get(`/superadmin/inspector/city/${tenantId}`);
    },

    provisionMla: async (data: Record<string, any>) => {
        return api.post('/superadmin/mlas', data);
    },

    getTelemetry: async () => {
        return api.get('/superadmin/telemetry');
    },

    getAuditLog: async () => {
        return api.get('/superadmin/audit');
    },
};
