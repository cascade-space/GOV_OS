import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../../../lib/socket';
import { complaintsApi } from '../api/api';
import { CreateComplaintRequest, ComplaintStatus } from '../types';

export const COMPLAINTS_KEYS = {
  all: ['complaints'] as const,
  lists: () => [...COMPLAINTS_KEYS.all, 'list'] as const,
  detail: (id: string) => [...COMPLAINTS_KEYS.all, 'detail', id] as const,
};

export const useComplaints = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleComplaintUpdate = () => {
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.lists() });
    };

    socket.on('complaint:created', handleComplaintUpdate);
    socket.on('complaint:status_changed', handleComplaintUpdate);

    return () => {
      socket.off('complaint:created', handleComplaintUpdate);
      socket.off('complaint:status_changed', handleComplaintUpdate);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: COMPLAINTS_KEYS.lists(),
    queryFn: () => complaintsApi.list(),
  });
};

export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateComplaintRequest) => complaintsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.lists() });
    },
  });
};

export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ComplaintStatus }) =>
      complaintsApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.detail(variables.id) });
    },
  });
};

export const useAssignComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, officerId }: { id: string; officerId: string }) =>
      complaintsApi.assign(id, officerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.detail(variables.id) });
    },
  });
};

export const useStartWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => complaintsApi.startWork(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.detail(id) });
    },
  });
};

export const useCompleteWork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes, evidenceUrl }: { id: string; notes: string; evidenceUrl?: string }) =>
      complaintsApi.completeWork(id, { resolutionNotes: notes, resolutionEvidenceUrl: evidenceUrl }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.detail(variables.id) });
    },
  });
};

export const useVerifyClose = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      complaintsApi.verifyClose(id, { notes }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: COMPLAINTS_KEYS.detail(variables.id) });
    },
  });
};

export const useMyAssignedComplaints = () => {
  return useQuery({
    queryKey: [...COMPLAINTS_KEYS.all, 'assigned-me'],
    queryFn: () => complaintsApi.listMyAssigned(),
  });
};
