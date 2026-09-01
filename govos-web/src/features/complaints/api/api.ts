import { api } from '../../../lib/api';
import { Complaint, CreateComplaintRequest, ComplaintStatus } from '../types';

export const complaintsApi = {
  list: async (): Promise<Complaint[]> => {
    const response = await api.get('/complaints');
    return response.data;
  },

  create: async (data: CreateComplaintRequest): Promise<Complaint> => {
    const response = await api.post('/complaints', data);
    return response.data;
  },

  updateStatus: async (id: string, status: ComplaintStatus): Promise<Complaint> => {
    const response = await api.put(`/complaints/${id}/status`, { status });
    return response.data;
  },
};
