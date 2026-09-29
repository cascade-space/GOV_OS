"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationEvents, NOTIFICATION_EVENTS } from '@/lib/notificationEvents';
import api from '@/lib/api-client';

interface NotificationCounts {
    newComplaints: number;
    pendingComplaints: number;
    slaBreached: number;
    highPriorityPending: number;
    escalatedComplaints: number;
}

interface NotificationContextType {
    counts: NotificationCounts;
    loading: boolean;
    refresh: () => Promise<void>;
    incrementNewComplaints: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [counts, setCounts] = useState<NotificationCounts>({
        newComplaints: 0,
        pendingComplaints: 0,
        slaBreached: 0,
        highPriorityPending: 0,
        escalatedComplaints: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchNotificationCounts = async () => {
        try {
            // Use API client with proper authentication headers
            const data: any = await api.get('/admin/notifications').catch(() => null);
            
            if (data?.success && data?.data) {
                setCounts(data.data);
            } else if (Array.isArray(data)) {
                setCounts({
                    newComplaints: data.filter((c: any) => c.status === 'NEW').length,
                    pendingComplaints: data.filter((c: any) => ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length,
                    slaBreached: data.filter((c: any) => c.sla_breached || c.slaBreached).length,
                    highPriorityPending: data.filter((c: any) => (c.priority === 'HIGH' || c.priority === 'CRITICAL') && c.status !== 'RESOLVED').length,
                    escalatedComplaints: data.filter((c: any) => (c.escalation_level || 0) > 0).length,
                });
            }
        } catch {
            // Non-critical background metric
        } finally {
            setLoading(false);
        }
    };

    const incrementNewComplaints = () => {
        setCounts(prev => ({
            ...prev,
            newComplaints: prev.newComplaints + 1,
            pendingComplaints: prev.pendingComplaints + 1
        }));
    };

    useEffect(() => {
        fetchNotificationCounts();
        
        // Set up polling to refresh counts every 30 seconds
        const interval = setInterval(fetchNotificationCounts, 30000);
        
        // Listen for notification events
        const handleNewComplaint = () => {
            incrementNewComplaints();
        };
        
        const handleRefreshCounts = () => {
            fetchNotificationCounts();
        };
        
        notificationEvents.on(NOTIFICATION_EVENTS.NEW_COMPLAINT, handleNewComplaint);
        notificationEvents.on(NOTIFICATION_EVENTS.REFRESH_COUNTS, handleRefreshCounts);
        
        return () => {
            clearInterval(interval);
            notificationEvents.off(NOTIFICATION_EVENTS.NEW_COMPLAINT, handleNewComplaint);
            notificationEvents.off(NOTIFICATION_EVENTS.REFRESH_COUNTS, handleRefreshCounts);
        };
    }, []);

    return (
        <NotificationContext.Provider value={{
            counts,
            loading,
            refresh: fetchNotificationCounts,
            incrementNewComplaints
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}