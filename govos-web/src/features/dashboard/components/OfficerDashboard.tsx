import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, ClipboardCheck, AlertTriangle } from 'lucide-react';

interface Props {
  metrics: Record<string, any>;
}

export const OfficerDashboard: React.FC<Props> = ({ metrics }) => {
  const kpis = [
    { title: 'My Assigned Total', value: metrics.myTotalAssigned || 0, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'My Pending Tasks', value: metrics.myPendingTasks || 0, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'My Resolved Tasks', value: metrics.myResolved || 0, icon: ClipboardCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4 hover:border-govos-blue/50 transition-colors"
          >
            <div className={`p-4 rounded-xl ${kpi.bg}`}>
              <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-muted-foreground font-medium text-sm">{kpi.title}</p>
              <h3 className="text-3xl font-bold mt-1 text-foreground">{kpi.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
