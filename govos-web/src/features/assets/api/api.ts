import { api } from '../../../lib/api';
import { CivicAsset } from './types';

export const assetsApi = {
  list: async (): Promise<CivicAsset[]> => {
    const response = await api.get('/assets');
    return response.data;
  },
  create: async (data: Partial<CivicAsset>): Promise<CivicAsset> => {
    const response = await api.post('/assets', data);
    return response.data;
  },
  update: async (id: string, data: Partial<CivicAsset>): Promise<CivicAsset> => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  }
};
