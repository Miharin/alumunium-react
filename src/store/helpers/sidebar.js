import { create } from 'zustand';

export const sidebarConfig = create((set) => ({
  openDashboard: false,
  toggleDashboard: () => set((state) => ({ open: !state.open })),
}));
