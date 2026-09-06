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

  assign: async (id: string, officerId: string): Promise<Complaint> => {
    const response = await api.patch(`/complaints/${id}/assign`, { officerId });
    return response.data;
  },

  startWork: async (id: string): Promise<Complaint> => {
    const response = await api.patch(`/complaints/${id}/start-work`);
    return response.data;
  },

  completeWork: async (id: string, data: { resolutionNotes: string; resolutionEvidenceUrl?: string }): Promise<Complaint> => {
    const response = await api.post(`/complaints/${id}/complete-work`, data);
    return response.data;
  },

  verifyClose: async (id: string, data?: { notes?: string }): Promise<Complaint> => {
    const response = await api.patch(`/complaints/${id}/verify-close`, data || {});
    return response.data;
  },

  listMyAssigned: async (): Promise<Complaint[]> => {
    const response = await api.get('/complaints/assigned/me');
    return response.data;
  },

  issueDirective: async (data: {
    complaintId: string;
    mlaName: string;
    constituency: string;
    directiveType: string;
    instructionNotes: string;
  }): Promise<any> => {
    const response = await api.post('/mla/directives', data);
    return response.data;
  },

  getDirectivesForComplaint: async (complaintId: string): Promise<any[]> => {
    const response = await api.get(`/mla/directives/complaint/${complaintId}`);
    return response.data;
  },
};
