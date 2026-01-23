// src/stores/useUIStore.ts
import { create } from 'zustand';

type ModalType = 'newProject' | 'editCharacter' | 'settings' | null;

interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  activeModal: ModalType;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  theme: 'dark',
  activeModal: null,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: (theme) => set({ theme }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}));
