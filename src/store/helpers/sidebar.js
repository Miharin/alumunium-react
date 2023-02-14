import { create } from 'zustand';

export const sidebarConfig = create((set) => ({
  openDashboard: false,
  openUsers: false,
  openProducts: false,
  toggleDashboard: () => set((state) => ({ openDashboard: !state.openDashboard })),
  toggleUsers: () => set((state) => ({ openUsers: !state.openUsers })),
  toggleProducts: () => set((state) => ({ openProducts: !state.openProducts })),
}));
