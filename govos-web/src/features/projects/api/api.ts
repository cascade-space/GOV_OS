import { api } from '../../../lib/api';
import { CivicProject } from './types';

export const projectsApi = {
  list: async (): Promise<CivicProject[]> => {
    const response = await api.get('/projects');
    return response.data;
  },
  create: async (data: Partial<CivicProject>): Promise<CivicProject> => {
    const response = await api.post('/projects', data);
    return response.data;
  },
  update: async (id: string, data: Partial<CivicProject>): Promise<CivicProject> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  }
};
