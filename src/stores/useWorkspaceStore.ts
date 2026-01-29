import { create } from 'zustand';
import {
  wsGetDefaultPath,
  wsGetWorkspacePath,
  wsIsFirstLaunch,
  wsInitializeWorkspace,
  wsValidatePath,
  wsCompressProject,
  wsListBackups,
  wsCloseProject,
  wsSaveImage,
  wsResolveImage,
  wsSyncToDisk,
  wsSyncFromDisk,
  wsMigrateExistingData,
  wsOpenProject,
  wsMoveWorkspace,
} from '@/lib/tauri-bridge';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'unavailable';

interface WorkspaceState {
  workspacePath: string | null;
  isFirstLaunch: boolean;
  isInitialized: boolean;
  syncStatus: SyncStatus;
  lastSyncError: string | null;

  // Initialization
  checkFirstLaunch: () => Promise<void>;
  initializeWorkspace: (path: string) => Promise<void>;
  loadWorkspacePath: () => Promise<void>;

  // Project operations
  syncProjectToDisk: (projectId: string) => Promise<void>;
  syncProjectFromDisk: (projectId: string) => Promise<void>;
  openProject: (projectId: string) => Promise<string>;
  closeProject: (projectId: string, projectTitle: string) => Promise<void>;

  // Image operations
  saveImage: (projectId: string, category: string, imageData: string) => Promise<string>;
  resolveImage: (projectId: string, relativePath: string) => Promise<string>;

  // Backup operations
  compressProject: (projectId: string, projectTitle: string) => Promise<string>;
  listBackups: (projectSlug: string) => Promise<string[]>;

  // Migration
  migrateExistingData: () => Promise<number>;

  // Workspace management
  moveWorkspace: (newPath: string) => Promise<void>;
  getDefaultPath: () => Promise<string>;
  validatePath: (path: string) => Promise<boolean>;

  // Internal
  setSyncStatus: (status: SyncStatus) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspacePath: null,
  isFirstLaunch: true,
  isInitialized: false,
  syncStatus: 'idle',
  lastSyncError: null,

  checkFirstLaunch: async () => {
    try {
      const isFirst = await wsIsFirstLaunch();
      set({ isFirstLaunch: isFirst });
      if (!isFirst) {
        await get().loadWorkspacePath();
      }
    } catch (error) {
      console.warn('Failed to check first launch:', error);
      set({ isFirstLaunch: false });
    }
  },

  initializeWorkspace: async (path: string) => {
    await wsInitializeWorkspace(path);
    set({
      workspacePath: path,
      isFirstLaunch: false,
      isInitialized: true,
    });
  },

  loadWorkspacePath: async () => {
    try {
      const path = await wsGetWorkspacePath();
      set({
        workspacePath: path,
        isInitialized: path !== null,
      });
    } catch (error) {
      console.warn('Failed to load workspace path:', error);
    }
  },

  syncProjectToDisk: async (projectId: string) => {
    const { workspacePath } = get();
    if (!workspacePath) return;

    set({ syncStatus: 'syncing', lastSyncError: null });
    try {
      await wsSyncToDisk(projectId);
      set({ syncStatus: 'synced' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      set({ syncStatus: 'error', lastSyncError: msg });
      console.error('Sync to disk failed:', error);
    }
  },

  syncProjectFromDisk: async (projectId: string) => {
    const { workspacePath } = get();
    if (!workspacePath) return;

    set({ syncStatus: 'syncing', lastSyncError: null });
    try {
      await wsSyncFromDisk(projectId);
      set({ syncStatus: 'synced' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      set({ syncStatus: 'error', lastSyncError: msg });
      console.error('Sync from disk failed:', error);
    }
  },

  openProject: async (projectId: string) => {
    const { workspacePath } = get();
    if (!workspacePath) return 'no-workspace';

    try {
      const source = await wsOpenProject(projectId);
      return source;
    } catch (error) {
      console.warn('Workspace open failed, falling back to SQL:', error);
      return 'sql';
    }
  },

  closeProject: async (projectId: string, projectTitle: string) => {
    const { workspacePath } = get();
    if (!workspacePath) return;

    try {
      await wsCloseProject(projectId, projectTitle);
    } catch (error) {
      console.error('Close project failed:', error);
    }
  },

  saveImage: async (projectId: string, category: string, imageData: string) => {
    return await wsSaveImage(projectId, category, imageData);
  },

  resolveImage: async (projectId: string, relativePath: string) => {
    return await wsResolveImage(projectId, relativePath);
  },

  compressProject: async (projectId: string, projectTitle: string) => {
    return await wsCompressProject(projectId, projectTitle);
  },

  listBackups: async (projectSlug: string) => {
    return await wsListBackups(projectSlug);
  },

  migrateExistingData: async () => {
    return await wsMigrateExistingData();
  },

  moveWorkspace: async (newPath: string) => {
    await wsMoveWorkspace(newPath);
    set({ workspacePath: newPath });
  },

  getDefaultPath: async () => {
    return await wsGetDefaultPath();
  },

  validatePath: async (path: string) => {
    return await wsValidatePath(path);
  },

  setSyncStatus: (status: SyncStatus) => set({ syncStatus: status }),
}));
