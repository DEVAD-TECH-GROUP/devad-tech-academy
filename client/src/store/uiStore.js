import { create } from "zustand";

const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  mobileDrawer: false,
  activeModal: null,

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  openMobileDrawer: () => set({ mobileDrawer: true }),
  closeMobileDrawer: () => set({ mobileDrawer: false }),
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
}));

export default useUIStore;