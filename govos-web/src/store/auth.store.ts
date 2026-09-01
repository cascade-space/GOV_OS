import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { disconnectSocket } from '../lib/socket';

export interface UserProfile {
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
}

export interface TenantInfo {
  id: string;
  name: string;
  code: string;
  subdomain: string;
  logoUrl?: string;
  primaryColor: string;
  timezone: string;
  locale: string;
}

interface AuthState {
  accessToken: string | null;
  user: UserProfile | null;
  tenant: TenantInfo | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, user: UserProfile, tenant: TenantInfo) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      tenant: null,
      isAuthenticated: false,

      setAuth: (accessToken, user, tenant) =>
        set({
          accessToken,
          user,
          tenant,
          isAuthenticated: true,
        }),

      logout: () => {
        disconnectSocket();
        set({
          accessToken: null,
          user: null,
          tenant: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'govos-auth-storage',
      // We ONLY store user and tenant metadata in localStorage.
      // Access token should ideally be memory-only or securely stored.
      // For this implementation, we will persist it for convenience but in a real app,
      // it should be HTTPOnly cookie or memory only with silent refresh.
      partialize: (state) => ({ 
        accessToken: state.accessToken,
        user: state.user,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
