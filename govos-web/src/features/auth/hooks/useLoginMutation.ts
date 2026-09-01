import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../../../store/auth.store';
import { useNavigate, useLocation } from 'react-router-dom';
import { OtpRequestType } from '../types';

export const useRequestOtpMutation = () => {
  return useMutation({
    mutationFn: (data: OtpRequestType) => authApi.requestOtp(data),
  });
};

export const useVerifyOtpMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: ({ identifier, otp }: { identifier: string; otp: string }) =>
      authApi.verifyOtp(identifier, otp),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user, data.tenant);
      
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    },
  });
};
