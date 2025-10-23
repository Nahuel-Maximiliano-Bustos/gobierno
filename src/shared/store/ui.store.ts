import { create } from 'zustand';

interface UIPanelState {
  id: string;
  open: boolean;
}

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  breadcrumb: string[];
  setBreadcrumb: (items: string[]) => void;
  panel: UIPanelState | null;
  openPanel: (id: string) => void;
  closePanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  breadcrumb: [],
  setBreadcrumb: (items) => set({ breadcrumb: items }),
  panel: null,
  openPanel: (id) => set({ panel: { id, open: true } }),
  closePanel: () => set({ panel: null })
}));
