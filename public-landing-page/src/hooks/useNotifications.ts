import { useState, useEffect } from 'react';

interface NotificationCounts {
    newComplaints: number;
    pendingComplaints: number;
    departmentAlerts: number;
}

export function useNotifications() {
    const [counts, setCounts] = useState<NotificationCounts>({
        newComplaints: 0,
        pendingComplaints: 0,
        departmentAlerts: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchNotificationCounts = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            
            // Fetch notification counts from the API
            const response = await fetch(`${apiUrl}/api/v1/admin/notifications`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCounts(data.data);
                }
            } else {
                // Fallback: fetch stats and calculate counts
                const statsResponse = await fetch(`${apiUrl}/api/v1/admin/stats`);
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    if (statsData.success) {
                        const stats = statsData.data;
                        setCounts({
                            newComplaints: stats.pending || 0,
                            pendingComplaints: stats.pending || 0,
                            departmentAlerts: Math.min(stats.pending || 0, 99) // Cap at 99 for display
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching notification counts:', error);
            // Set default values on error
            setCounts({
                newComplaints: 0,
                pendingComplaints: 0,
                departmentAlerts: 0
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotificationCounts();
        
        // Set up polling to refresh counts every 30 seconds
        const interval = setInterval(fetchNotificationCounts, 30000);
        
        return () => clearInterval(interval);
    }, []);

    return {
        counts,
        loading,
        refresh: fetchNotificationCounts
    };
}