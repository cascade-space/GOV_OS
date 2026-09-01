import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import NotificationTray from './NotificationTray';
import CommandPalette from './CommandPalette';
import { useRealtime } from '../hooks/useRealtime';

export default function AppShell() {
  useRealtime(); // Initialize Socket.IO connection when shell mounts

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-background/50">
          <Outlet />
        </main>
      </div>
      <NotificationTray />
      <CommandPalette />
    </div>
  );
}
