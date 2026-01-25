import { create } from 'zustand';

interface BannerStore {
  banners: Record<string, string>; // category -> currentBannerUrl
  isInitialized: boolean;
  initializeBanners: () => Promise<void>;
  getBanner: (category: string) => string | null;
}

export const useBannerStore = create<BannerStore>((set, get) => ({
  banners: {},
  isInitialized: false,
  initializeBanners: async () => {
    if (get().isInitialized) return;

    try {
      const response = await fetch('/banners.json');
      if (!response.ok) throw new Error('Failed to load banner manifest');
      
      const manifest: Record<string, string[]> = await response.json();
      const selectedBanners: Record<string, string> = {};

      Object.entries(manifest).forEach(([category, files]) => {
        if (files && files.length > 0) {
          // Pick random file
          const randomIndex = Math.floor(Math.random() * files.length);
          selectedBanners[category] = files[randomIndex];
        }
      });

      set({ banners: selectedBanners, isInitialized: true });
    } catch (error) {
      console.error('Error initializing banners:', error);
      // Fallback or empty
      set({ isInitialized: true });
    }
  },
  getBanner: (category: string) => {
    return get().banners[category] || null;
  }
}));
