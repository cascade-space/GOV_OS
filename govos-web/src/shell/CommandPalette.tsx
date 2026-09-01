import React, { useEffect } from 'react';
import { useUiStore } from '../store/ui.store';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border overflow-hidden relative z-10 flex flex-col"
          >
            <div className="flex items-center px-4 py-3 border-b border-border">
              <Search size={20} className="text-muted-foreground mr-3" />
              <input 
                type="text" 
                placeholder="Search complaints, citizens, assets..." 
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">ESC</span>
                </kbd>
                <button 
                  onClick={() => setCommandPaletteOpen(false)}
                  className="sm:hidden p-1 rounded-md hover:bg-secondary text-muted-foreground"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-2 max-h-96 overflow-y-auto">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Quick Actions</div>
              <button className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors text-left">
                Create new complaint
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors text-left">
                View my assignments
              </button>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground mt-2">Recent Searches</div>
              <button className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors text-left">
                CMP-MUM-202403-0012
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
