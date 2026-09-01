import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/api';

export const DASHBOARD_QUERY_KEY = 'dashboard-summary';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY],
    queryFn: () => dashboardApi.getSummary(),
    staleTime: 60_000,
  });
};
