import { create } from 'zustand';

export const sidebarConfig = create((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open })),
}));
