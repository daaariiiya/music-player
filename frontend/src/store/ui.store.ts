import { create } from 'zustand';

interface UiState {
  isLoading: boolean;
  isSidebarOpen: boolean;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isLoading: false,
  isSidebarOpen: true,
  setLoading: (isLoading) => set({ isLoading }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
}));
