// src/stores/useUIStore.ts
import { create } from 'zustand';

type ModalType = 'newProject' | 'editCharacter' | 'settings' | null;
type ViewType = 'editor' | 'relations' | 'timeline' | 'stats' | 'entities';

interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  activeModal: ModalType;
  activeView: ViewType;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setActiveView: (view: ViewType) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  theme: 'dark',
  activeModal: null,
  activeView: 'editor',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: (theme) => set({ theme }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setActiveView: (view) => set({ activeView: view }),
}));
