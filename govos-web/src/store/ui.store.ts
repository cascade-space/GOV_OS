import { create } from 'zustand';

type OSModule = 'dashboard' | 'complaints' | 'citizens' | 'assets' | 'projects' | 'documents' | 'officers' | 'analytics' | 'admin' | 'map' | 'notifications';

interface UiState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  notificationTrayOpen: boolean;
  activeModule: OSModule;
  
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  
  toggleNotificationTray: () => void;
  setNotificationTrayOpen: (isOpen: boolean) => void;
  
  setActiveModule: (module: OSModule) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  notificationTrayOpen: false,
  activeModule: 'dashboard',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setCommandPaletteOpen: (isOpen) => set({ commandPaletteOpen: isOpen }),
  
  toggleNotificationTray: () => set((state) => ({ notificationTrayOpen: !state.notificationTrayOpen })),
  setNotificationTrayOpen: (isOpen) => set({ notificationTrayOpen: isOpen }),
  
  setActiveModule: (module) => set({ activeModule: module }),
}));
