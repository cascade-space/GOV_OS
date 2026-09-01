import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../../../lib/socket';
import { DASHBOARD_QUERY_KEY } from './useDashboard';

export const useDashboardRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMetricChanged = () => {
      // Invalidate dashboard summary so it refetches new KPIs
      queryClient.invalidateQueries({ queryKey: [DASHBOARD_QUERY_KEY] });
    };

    socket.on('complaint:created', handleMetricChanged);
    socket.on('complaint:status_changed', handleMetricChanged);
    socket.on('sla:breach', handleMetricChanged);

    return () => {
      socket.off('complaint:created', handleMetricChanged);
      socket.off('complaint:status_changed', handleMetricChanged);
      socket.off('sla:breach', handleMetricChanged);
    };
  }, [queryClient]);
};
