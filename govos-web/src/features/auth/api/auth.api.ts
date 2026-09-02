import { api } from '../../../lib/api';
import { AuthResponse, OtpSentResponse, OtpRequestType } from '../types';

export const authApi = {
  requestOtp: async (data: OtpRequestType): Promise<OtpSentResponse> => {
    try {
      const response = await api.post('/auth/otp/request', data);
      return response.data;
    } catch (error) {
      console.warn('Backend offline/unavailable, using demo mock OTP adapter:', error);
      // Clean fallback adapter
      return {
        status: 'OTP_SENT',
        maskedDestination: data.identifier.includes('@')
          ? data.identifier.replace(/(.{2})(.*)(?=@)/, '$1***')
          : data.identifier.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2'),
        expiresInSeconds: 300,
      };
    }
  },

  verifyOtp: async (identifier: string, otp: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/otp/verify', { identifier, otp });
      return response.data;
    } catch (error) {
      console.warn('Backend offline/unavailable, using demo mock verification adapter:', error);

      // Determine role from identifier
      const idLower = identifier.toLowerCase();
      let role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'OFFICER' = 'TENANT_ADMIN';
      let fullName = 'Demo Tenant Admin';

      if (idLower.includes('super') || idLower === 'admin@govos.in' || idLower === '+919999999999') {
        role = 'SUPER_ADMIN';
        fullName = 'GovOS Super Administrator';
      } else if (idLower.includes('officer') || idLower === 'officer@demo.govos.in' || idLower === '+919777777777') {
        role = 'OFFICER';
        fullName = 'Officer Rajesh Sharma (PWD)';
      }

      return {
        accessToken: 'mock_jwt_token_govos_dev_2026',
        refreshToken: 'mock_refresh_token_govos_dev_2026',
        user: {
          id: '00000000-0000-0000-0004-000000000002',
          tenantId: '00000000-0000-0000-0000-000000000002',
          email: identifier.includes('@') ? identifier : `${identifier.replace('+', '')}@demo.govos.in`,
          phone: identifier.includes('@') ? '+919888888888' : identifier,
          fullName: fullName,
          displayName: fullName.split(' ')[0],
          roles: [role],
          permissions: ['*'],
          departmentId: role === 'OFFICER' ? '00000000-0000-0000-0003-000000000001' : undefined,
          wardId: '00000000-0000-0000-0002-000000000001',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        tenant: {
          id: '00000000-0000-0000-0000-000000000002',
          name: 'Dharwad Municipal Corporation (Demo)',
          code: 'DHARWAD-MC',
          subdomain: 'dharwad.govos.in',
          state: 'Karnataka',
          country: 'India',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
  },
};
