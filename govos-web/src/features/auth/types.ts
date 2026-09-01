import { z } from 'zod';

export const OtpRequestSchema = z.object({
  identifier: z.string().min(1, 'Phone or email is required'),
});

export type OtpRequestType = z.infer<typeof OtpRequestSchema>;

export interface OtpSentResponse {
  sent: boolean;
  maskedDestination: string;
  expiryMinutes: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  user: {
    id: string;
    fullName: string;
    displayName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    primaryRole: string;
    wardId?: string;
    departmentId?: string;
    mfaEnabled: boolean;
  };
  tenant: {
    id: string;
    name: string;
    code: string;
    subdomain: string;
    logoUrl?: string;
    primaryColor: string;
    timezone: string;
    locale: string;
  };
}
