import React from 'react';
import { useUiStore } from '../store/ui.store';
import { useNotificationStore } from '../store/notification.store';
import { X, Check, Trash2, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationTray() {
  const { notificationTrayOpen, setNotificationTrayOpen } = useUiStore();
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info size={16} className="text-blue-500" />;
      case 'success': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {notificationTrayOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setNotificationTrayOpen(false)}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 w-full sm:w-96 h-full bg-card border-l border-border shadow-xl flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Notifications</h2>
              <button 
                onClick={() => setNotificationTrayOpen(false)}
                className="p-1 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-2 flex items-center gap-2 border-b border-border">
              <button 
                onClick={markAllAsRead}
                className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary rounded-md transition-colors flex items-center justify-center gap-1"
              >
                <Check size={14} /> Mark all read
              </button>
              <button 
                onClick={clearAll}
                className="flex-1 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary rounded-md transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 size={14} /> Clear all
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center space-y-4">
                  <BellOff size={48} className="opacity-20" />
                  <p>You're all caught up! No new notifications.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        n.isRead 
                          ? 'bg-card border-transparent opacity-60' 
                          : 'bg-secondary/50 border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-2">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-govos-blue mt-1.5 shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Temporary icon for empty state
const BellOff = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
    <path d="M18 8a6 6 0 0 0-9.33-5"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
)
