import React from 'react';
import { useUiStore } from '../store/ui.store';
import { useAuthStore } from '../store/auth.store';
import { useNotificationStore } from '../store/notification.store';
import { Menu, Search, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function TopBar() {
  const { toggleSidebar, toggleCommandPalette, toggleNotificationTray } = useUiStore();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <button 
          onClick={toggleCommandPalette}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-full text-sm text-muted-foreground w-64 transition-colors"
        >
          <Search size={16} />
          <span>Search GovOS... (Ctrl+K)</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleNotificationTray}
          className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-card animate-pulse" />
          )}
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border relative" ref={dropdownRef}>
          <div className="hidden md:flex flex-col items-end cursor-pointer" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">{user?.displayName || user?.fullName}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">{user?.primaryRole.replace('_', ' ')}</span>
          </div>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full bg-govos-blue flex items-center justify-center text-white font-bold cursor-pointer"
          >
            {user?.displayName?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
          </div>
          
          {dropdownOpen && (
            <div className="absolute top-12 right-0 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-border mb-1 md:hidden">
                <p className="text-sm font-medium truncate">{user?.displayName || user?.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.primaryRole.replace('_', ' ')}</p>
              </div>
              <button 
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-secondary transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
