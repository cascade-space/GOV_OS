import axios from 'axios';
import { useAuthStore } from '../../../store/auth.store';

// Assuming we have an axios instance setup somewhere, or we just configure it here
const getApi = () => {
  const token = useAuthStore.getState().accessToken;
  return axios.create({
    baseURL: '/api/v1',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export interface Complaint {
  id: string;
  tenantId: string;
  reporterId: string;
  complaintNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  latitude: number;
  longitude: number;
  wardId: string;
  assignedOfficerId: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchComplaints = async (): Promise<Complaint[]> => {
  const api = getApi();
  const response = await api.get('/complaints');
  return response.data;
};

export const createComplaint = async (data: { title: string, description: string, latitude: number, longitude: number }) => {
  const api = getApi();
  const response = await api.post('/complaints', data);
  return response.data;
};

export const updateComplaintStatus = async (id: string, status: string) => {
  const api = getApi();
  const response = await api.put(`/complaints/${id}/status`, { status });
  return response.data;
};
