import { api } from '../../../lib/api';
import { AuditLog } from './types';

export const adminApi = {
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const response = await api.get('/admin/audit');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getTenantConfig: async () => {
    const response = await api.get('/admin/tenant');
    return response.data;
  },
};
