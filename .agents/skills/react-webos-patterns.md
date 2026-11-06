# Skill: React Web OS Patterns
# Reference for WebOSFrontend agent — govos-web

---

## Zustand Store Slice Pattern
```typescript
// src/store/auth.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  wardId?: string;
}

interface Tenant {
  id: string;
  name: string;
  code: string;
  subdomain: string;
}

interface AuthState {
  user: User | null;
  token: string | null;      // In-memory only — NEVER localStorage
  tenant: Tenant | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, tenant: Tenant) => void;
  updateToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      token: null,
      tenant: null,
      isAuthenticated: false,
      setAuth: (user, token, tenant) => set({ user, token, tenant, isAuthenticated: true }),
      updateToken: (token) => set({ token }),
      clearAuth: () => set({ user: null, token: null, tenant: null, isAuthenticated: false }),
    }),
    { name: 'auth-store' }
  )
);
```

---

## API Client Configuration
```typescript
// src/lib/api.ts
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT + tenant context
api.interceptors.request.use((config) => {
  const { token, tenant } = useAuthStore.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenant) config.headers['X-Tenant-ID'] = tenant.id;
  return config;
});

// Handle 401 — refresh and retry
api.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true;
    try {
      const { data } = await axios.post('/api/v1/auth/refresh');
      useAuthStore.getState().updateToken(data.accessToken);
      error.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(error.config);
    } catch {
      useAuthStore.getState().clearAuth();
    }
  }
  return Promise.reject(normalizeError(error));
});
```

---

## Mock Data & Form Dropdowns
1. **Never use arbitrary UUIDs** (e.g. `11111111-1111-...`) for foreign key fields (Wards, Departments) in dropdowns or default form values.
2. **Always align with seed data**: Any UUID sent from the frontend to the backend MUST exist in the backend's Flyway seed data (`V5__seed_data.sql`, etc). 
3. If you need to present multiple options in a dropdown (e.g. "Ward 1", "Ward 2"), you MUST either use the actual seeded UUIDs or write a backend migration to seed those mock records.
4. Ensure payload mappings match backend DTOs (e.g. mapping `department` to `departmentId` if required by the API).

---

## Feature Query Hook Pattern
```typescript
// src/features/complaints/hooks/useComplaintsQuery.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { complaintsApi } from '../api/complaints.api';

export const COMPLAINTS_KEY = 'complaints';

export const useComplaintsList = (filters: ComplaintFilters) => {
  return useQuery({
    queryKey: [COMPLAINTS_KEY, 'list', filters],
    queryFn: () => complaintsApi.list(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,  // Keep old data while fetching
  });
};

export const useComplaintDetail = (id: string) => {
  return useQuery({
    queryKey: [COMPLAINTS_KEY, 'detail', id],
    queryFn: () => complaintsApi.getById(id),
    staleTime: 60_000,
    enabled: !!id,
  });
};
```

---

## Real-time Hook Pattern
```typescript
// src/features/complaints/hooks/useComplaintsRealtime.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '@/lib/socket';
import { COMPLAINTS_KEY } from './useComplaintsQuery';

export const useComplaintsRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleStatusChanged = ({ id, toStatus }: { id: string; toStatus: string }) => {
      queryClient.setQueryData(
        [COMPLAINTS_KEY, 'detail', id],
        (old: Complaint | undefined) => old ? { ...old, status: toStatus } : old
      );
      queryClient.invalidateQueries({ queryKey: [COMPLAINTS_KEY, 'list'] });
    };

    const handleNewComplaint = () => {
      queryClient.invalidateQueries({ queryKey: [COMPLAINTS_KEY, 'list'] });
    };

    socket.on('complaint:status_changed', handleStatusChanged);
    socket.on('complaint:created', handleNewComplaint);

    return () => {
      socket.off('complaint:status_changed', handleStatusChanged);
      socket.off('complaint:created', handleNewComplaint);
    };
  }, [queryClient]);
};
```

---

## Module Entry Component Pattern
```tsx
// src/features/complaints/index.tsx
import { Suspense, lazy } from 'react';
import { useComplaintsRealtime } from './hooks/useComplaintsRealtime';
import { ModuleSkeleton } from '@/components/ui/ModuleSkeleton';

const ComplaintsList = lazy(() => import('./components/ComplaintsList'));

export const ComplaintsModule: React.FC = () => {
  // Register real-time listeners for this module
  useComplaintsRealtime();

  return (
    <Suspense fallback={<ModuleSkeleton />}>
      <ComplaintsList />
    </Suspense>
  );
};
```

---

## RoleGuard Component
```tsx
// src/components/RoleGuard.tsx
import { useAuthStore } from '@/store/auth.store';

interface Props {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<Props> = ({ roles, children, fallback = null }) => {
  const { user } = useAuthStore();
  if (!user || !roles.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
};

// Usage:
<RoleGuard roles={['DEPT_HEAD', 'TENANT_ADMIN']}>
  <Button onClick={escalate}>Escalate Complaint</Button>
</RoleGuard>
```

---

## Framer Motion Animations
```tsx
// Module enter/exit animation
import { AnimatePresence, motion } from 'framer-motion';

const moduleVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const AnimatedModule: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    variants={moduleVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
    transition={{ duration: 0.15, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);
```

---

## Leaflet Map Pattern
```tsx
// src/components/map/WardMap.tsx
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import { useWardBoundaries } from '@/features/geo/hooks/useWardBoundaries';

interface Props {
  complaints: Complaint[];
  tenantId: string;
}

export const WardMap: React.FC<Props> = ({ complaints, tenantId }) => {
  const { data: boundaries } = useWardBoundaries(tenantId);

  return (
    <MapContainer
      center={[20.5937, 78.9629]}  // India center
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url={import.meta.env.VITE_MAPS_TILE_URL}
        attribution='© OpenStreetMap contributors'
      />
      {boundaries && (
        <GeoJSON
          data={boundaries}
          style={{ color: '#1B4FD8', weight: 2, fillOpacity: 0.1 }}
        />
      )}
      {complaints.map((c) => (
        <CircleMarker
          key={c.id}
          center={[c.location.lat, c.location.lon]}
          radius={8}
          color={statusColor[c.status]}
        >
          <Popup>{c.title}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};
```
