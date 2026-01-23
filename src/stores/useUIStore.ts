// src/stores/useUIStore.ts
import { create } from 'zustand';

type ModalType = 'newProject' | 'editCharacter' | 'settings' | 'newChapter' | 'newScene' | 'newLocation' | 'newTimelineEvent' | 'newLore' | null;
type ViewType = 'editor' | 'relations' | 'timeline' | 'stats' | 'entities' | 'lore' | 'chapters' | 'scenes' | 'images' | 'publishing' | 'aiAssistant';

interface UIState {
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  activeModal: ModalType;
  activeView: ViewType;

  // Editor State
  editorSaveStatus: 'saved' | 'saving' | 'unsaved';
  currentEditingChapterId: string | null;
  editorZenMode: boolean;

  // Actions
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  setActiveView: (view: ViewType) => void;

  setEditorSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;
  setCurrentEditingChapterId: (id: string | null) => void;
  toggleEditorZenMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  theme: 'dark',
  activeModal: null,
  activeView: 'editor',

  editorSaveStatus: 'saved',
  currentEditingChapterId: null,
  editorZenMode: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setTheme: (theme) => set({ theme }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setActiveView: (view) => set({ activeView: view }),

  setEditorSaveStatus: (status) => set({ editorSaveStatus: status }),
  setCurrentEditingChapterId: (id) => set({ currentEditingChapterId: id }),
  toggleEditorZenMode: () => set((state) => ({ editorZenMode: !state.editorZenMode })),
}));
