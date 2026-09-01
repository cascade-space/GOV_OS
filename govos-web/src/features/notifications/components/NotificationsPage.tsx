import React, { useEffect } from 'react';
import { useNotificationStore } from '../../../store/notification.store';
import { useUiStore } from '../../../store/ui.store';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const TYPE_CONFIG = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  success: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  error: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

export default function NotificationsPage() {
  const { setActiveModule } = useUiStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  useEffect(() => {
    setActiveModule('notifications');
  }, [setActiveModule]);

  return (
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="text-govos-blue" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-1 px-2.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time system alerts and operational updates.</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors"
            >
              <CheckCheck size={16} className="text-green-500" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 rounded-md text-sm font-medium text-red-500 transition-colors"
            >
              <Trash2 size={16} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 space-y-3">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-muted-foreground"
            >
              <Bell size={48} className="mb-4 opacity-20" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm mt-1">Real-time alerts will appear here as events occur in the system.</p>
            </motion.div>
          ) : (
            notifications.map((notification, index) => {
              const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.info;
              const Icon = config.icon;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => markAsRead(notification.id)}
                  className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                    notification.isRead
                      ? 'bg-card border-border opacity-60 hover:opacity-80'
                      : `bg-card ${config.border} border shadow-sm`
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${config.bg}`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-semibold text-sm ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-govos-blue shrink-0" />
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(notification.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2 opacity-60">
                      {new Date(notification.createdAt).toLocaleDateString('en-IN', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
