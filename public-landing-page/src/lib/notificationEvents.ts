// Simple event emitter for notification updates
class NotificationEventEmitter {
    private listeners: { [key: string]: Function[] } = {};

    on(event: string, callback: Function) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event: string, callback: Function) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event: string, data?: any) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
}

export const notificationEvents = new NotificationEventEmitter();

// Event types
export const NOTIFICATION_EVENTS = {
    NEW_COMPLAINT: 'new_complaint',
    COMPLAINT_UPDATED: 'complaint_updated',
    REFRESH_COUNTS: 'refresh_counts'
} as const;