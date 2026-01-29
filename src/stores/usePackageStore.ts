import { create } from 'zustand';
import type { RegistrySource, CatalogPackage, InstalledPackageInfo, PackageUpdateInfo } from '../types/packages';
import {
  pkgGetRegistries,
  pkgAddRegistry,
  pkgRemoveRegistry,
  pkgToggleRegistry,
  pkgFetchCatalog,
  pkgInstallPackage,
  pkgUpdatePackage,
  pkgUninstallPackage,
  pkgGetInstalled,
  pkgCheckUpdates,
} from '../lib/tauri-bridge';

export type PackageStoreTab = 'browse' | 'installed' | 'updates';
export type PackageCategoryFilter = 'all' | 'content' | 'identity' | 'hybrid';

interface PackageStoreState {
  activeTab: PackageStoreTab;
  categoryFilter: PackageCategoryFilter;
  searchQuery: string;
  registries: RegistrySource[];
  catalog: CatalogPackage[];
  installed: InstalledPackageInfo[];
  updates: PackageUpdateInfo[];
  loadingCatalog: boolean;
  loadingInstall: string | null; // package ID being installed
  loadingUninstall: string | null;
  error: string | null;

  setActiveTab: (tab: PackageStoreTab) => void;
  setCategoryFilter: (filter: PackageCategoryFilter) => void;
  setSearchQuery: (query: string) => void;

  fetchRegistries: () => Promise<void>;
  fetchCatalog: () => Promise<void>;
  fetchInstalled: () => Promise<void>;
  checkUpdates: () => Promise<void>;

  installPackage: (registryId: string, packageId: string) => Promise<void>;
  updatePackage: (registryId: string, packageId: string) => Promise<void>;
  uninstallPackage: (packageId: string) => Promise<void>;

  addRegistry: (url: string, name: string) => Promise<void>;
  removeRegistry: (registryId: string) => Promise<void>;
  toggleRegistry: (registryId: string, enabled: boolean) => Promise<void>;
}

export const usePackageStore = create<PackageStoreState>((set, get) => ({
  activeTab: 'browse',
  categoryFilter: 'all',
  searchQuery: '',
  registries: [],
  catalog: [],
  installed: [],
  updates: [],
  loadingCatalog: false,
  loadingInstall: null,
  loadingUninstall: null,
  error: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchRegistries: async () => {
    try {
      const registries = await pkgGetRegistries();
      set({ registries });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  fetchCatalog: async () => {
    set({ loadingCatalog: true, error: null });
    try {
      const catalog = await pkgFetchCatalog();
      set({ catalog, loadingCatalog: false });
    } catch (e) {
      set({ error: String(e), loadingCatalog: false });
    }
  },

  fetchInstalled: async () => {
    try {
      const installed = await pkgGetInstalled();
      set({ installed });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  checkUpdates: async () => {
    try {
      const updates = await pkgCheckUpdates();
      set({ updates });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  installPackage: async (registryId, packageId) => {
    set({ loadingInstall: packageId, error: null });
    try {
      await pkgInstallPackage(registryId, packageId);
      set({ loadingInstall: null });
      // Refresh data
      await get().fetchCatalog();
      await get().fetchInstalled();
    } catch (e) {
      set({ loadingInstall: null, error: String(e) });
    }
  },

  updatePackage: async (registryId, packageId) => {
    set({ loadingInstall: packageId, error: null });
    try {
      await pkgUpdatePackage(registryId, packageId);
      set({ loadingInstall: null });
      await get().fetchCatalog();
      await get().fetchInstalled();
      await get().checkUpdates();
    } catch (e) {
      set({ loadingInstall: null, error: String(e) });
    }
  },

  uninstallPackage: async (packageId) => {
    set({ loadingUninstall: packageId, error: null });
    try {
      await pkgUninstallPackage(packageId);
      set({ loadingUninstall: null });
      await get().fetchCatalog();
      await get().fetchInstalled();
      await get().checkUpdates();
    } catch (e) {
      set({ loadingUninstall: null, error: String(e) });
    }
  },

  addRegistry: async (url, name) => {
    try {
      await pkgAddRegistry(url, name);
      await get().fetchRegistries();
      await get().fetchCatalog();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  removeRegistry: async (registryId) => {
    try {
      await pkgRemoveRegistry(registryId);
      await get().fetchRegistries();
      await get().fetchCatalog();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  toggleRegistry: async (registryId, enabled) => {
    try {
      await pkgToggleRegistry(registryId, enabled);
      await get().fetchRegistries();
      await get().fetchCatalog();
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
