import { api } from '../../../lib/api';
import { AnalyticsReport } from './types';

export const analyticsApi = {
  getSummary: async (): Promise<AnalyticsReport> => {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
};
