import { api } from '../../../lib/api';
import { Officer } from './types';

export const officersApi = {
  list: async (): Promise<Officer[]> => {
    const response = await api.get('/officers');
    return response.data;
  },
  create: async (data: Partial<Officer>): Promise<Officer> => {
    const response = await api.post('/officers', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Officer>): Promise<Officer> => {
    const response = await api.put(`/officers/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/officers/${id}`);
  }
};
