import React from 'react';
import { useAuthStore } from '../../store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user } = useAuthStore();

  const DefaultFallback = () => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full h-full min-h-[150px] bg-secondary/20 backdrop-blur-sm border border-border/50 rounded-xl flex flex-col items-center justify-center p-6 text-center"
      >
        <ShieldAlert className="text-muted-foreground mb-3" size={32} />
        <h3 className="text-sm font-semibold text-foreground mb-1">Access Restricted</h3>
        <p className="text-xs text-muted-foreground">You don't have permission to view this module.</p>
      </motion.div>
    </AnimatePresence>
  );

  if (!user) return <>{fallback !== undefined ? fallback : <DefaultFallback />}</>;

  // SUPER_ADMIN can bypass all role checks in the UI layer as well
  if (user.primaryRole === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  const hasRole = allowedRoles.includes(user.primaryRole);

  if (!hasRole) {
    return <>{fallback !== undefined ? fallback : <DefaultFallback />}</>;
  }

  return <>{children}</>;
}
