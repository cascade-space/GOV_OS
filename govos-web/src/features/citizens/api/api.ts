import { api } from '../../../lib/api';
import { Citizen } from './types';

export const citizensApi = {
  list: async (): Promise<Citizen[]> => {
    const response = await api.get('/citizens');
    return response.data;
  },
  create: async (data: Partial<Citizen>): Promise<Citizen> => {
    const response = await api.post('/citizens', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Citizen>): Promise<Citizen> => {
    const response = await api.put(`/citizens/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/citizens/${id}`);
  }
};
