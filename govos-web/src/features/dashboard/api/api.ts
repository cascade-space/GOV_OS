import { api } from '../../../lib/api';

export interface DashboardSummaryResponse {
  role: string;
  metrics: Record<string, any>;
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummaryResponse> => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  }
};
