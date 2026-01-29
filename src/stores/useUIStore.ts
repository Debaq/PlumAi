// src/stores/useUIStore.ts
import { create } from 'zustand';

type ModalType = 'newProject' | 'welcome' | 'editCharacter' | 'newChapter' | 'editChapter' | 'newScene' | 'editScene' | 'loreItem' | 'timelineEvent' | 'editLocation' | 'editRelationship' | 'settings' | 'editCreature' | 'editWorldRule' | 'editNpc' | 'projectSettings' | null;
type ViewType = 'editor' | 'relations' | 'timeline' | 'stats' | 'entities' | 'lore' | 'chapters' | 'scenes' | 'images' | 'publishing' | 'aiAssistant' | 'versionControl' | 'rpgTools' | 'ragStudio' | 'settings' | 'projects' | 'projectSettings' | 'packageStore';
type EditorSaveStatus = 'saved' | 'saving' | 'unsaved';
type LoreTab = 'summary' | 'characters' | 'relations' | 'events' | 'locations' | 'scenes' | 'map' | 'bestiary' | 'npcs' | 'worldRules';
type SettingsTab = 'general' | 'ia' | 'security' | 'data' | 'integrations' | 'advanced' | 'packages';
type PublishingTab = 'book' | 'zines';

interface UIState {
  isSidebarOpen: boolean;
  activeModal: ModalType;
  modalData: any;
  activeView: ViewType;
  previousView: ViewType | null;
  editorSaveStatus: EditorSaveStatus;
  currentEditingChapterId: string | null;
  editorZenMode: boolean;
  isCommandPaletteOpen: boolean;
  activeLoreTab: LoreTab;
  activeSettingsTab: SettingsTab;
  isLocked: boolean;
  isRpgPanelOpen: boolean;
  activePublishingTab: PublishingTab;

  toggleSidebar: () => void;
  openModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;
  setActiveView: (view: ViewType) => void;
  goBack: () => void;
  setEditorSaveStatus: (status: EditorSaveStatus) => void;
  setCurrentEditingChapterId: (id: string | null) => void;
  toggleEditorZenMode: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveLoreTab: (tab: LoreTab) => void;
  setActiveSettingsTab: (tab: SettingsTab) => void;
  setLocked: (locked: boolean) => void;
  toggleRpgPanel: () => void;
  setActivePublishingTab: (tab: PublishingTab) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  activeModal: null,
  modalData: null,
  activeView: 'projects',
  previousView: null,
  editorSaveStatus: 'saved',
  currentEditingChapterId: null,
  editorZenMode: false,
  isCommandPaletteOpen: false,
  activeLoreTab: 'summary',
  activeSettingsTab: 'general',
  isLocked: false,
  isRpgPanelOpen: false,
  activePublishingTab: 'book',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  setActiveView: (view) => set((state) => ({ 
    previousView: state.activeView !== view ? state.activeView : state.previousView,
    activeView: view 
  })),
  goBack: () => set((state) => ({ 
    activeView: state.previousView || 'projects',
    previousView: null 
  })),
  setEditorSaveStatus: (status) => set({ editorSaveStatus: status }),
  setCurrentEditingChapterId: (id) => set({ currentEditingChapterId: id }),
  toggleEditorZenMode: () => set((state) => ({ editorZenMode: !state.editorZenMode })),
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
  setActiveLoreTab: (tab) => set({ activeLoreTab: tab }),
  setActiveSettingsTab: (tab) => set({ activeSettingsTab: tab }),
  setLocked: (isLocked) => set({ isLocked }),
  toggleRpgPanel: () => set((state) => ({ isRpgPanelOpen: !state.isRpgPanelOpen })),
  setActivePublishingTab: (tab) => set({ activePublishingTab: tab }),
}));