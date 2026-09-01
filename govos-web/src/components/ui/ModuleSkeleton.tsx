import React from 'react';
import { motion } from 'framer-motion';

export const ModuleSkeleton: React.FC = () => {
  return (
    <div className="p-6 md:p-8 space-y-8 h-full bg-background animate-pulse">
      <div className="h-10 bg-secondary/50 rounded-lg w-1/4 mb-4"></div>
      <div className="h-6 bg-secondary/50 rounded-lg w-2/4"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-2xl h-32 flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-secondary/50"></div>
             <div className="space-y-2 flex-1">
                <div className="h-4 bg-secondary/50 rounded w-1/2"></div>
                <div className="h-8 bg-secondary/50 rounded w-3/4"></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
