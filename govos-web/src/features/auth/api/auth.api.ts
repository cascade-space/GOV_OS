import { api } from '../../../lib/api';
import { AuthResponse, OtpSentResponse, OtpRequestType } from '../types';

export const authApi = {
  requestOtp: async (data: OtpRequestType): Promise<OtpSentResponse> => {
    const response = await api.post('/auth/otp/request', data);
    return response.data;
  },

  verifyOtp: async (identifier: string, otp: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/otp/verify', { identifier, otp });
    return response.data;
  },
};

