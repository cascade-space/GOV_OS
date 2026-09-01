import { api } from '../../../lib/api';
import { GovDocument } from './types';

export const documentsApi = {
  list: async (): Promise<GovDocument[]> => {
    const response = await api.get('/documents');
    return response.data;
  },
  create: async (data: Partial<GovDocument>): Promise<GovDocument> => {
    const response = await api.post('/documents', data);
    return response.data;
  },
  update: async (id: string, data: Partial<GovDocument>): Promise<GovDocument> => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  }
};
