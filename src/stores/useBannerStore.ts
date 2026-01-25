import { create } from 'zustand';

interface BannerStore {
  banners: Record<string, string>; // category -> currentBannerUrl
  availableBanners: Record<string, string[]>; // category -> allAvailableBanners
  isInitialized: boolean;
  initializeBanners: () => Promise<void>;
  getBanner: (category: string) => string | null;
  rotateBanner: (category: string) => void;
}

export const useBannerStore = create<BannerStore>((set, get) => ({
  banners: {},
  availableBanners: {},
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

      set({ banners: selectedBanners, availableBanners: manifest, isInitialized: true });
    } catch (error) {
      console.error('Error initializing banners:', error);
      // Fallback or empty
      set({ isInitialized: true });
    }
  },
  getBanner: (category: string) => {
    return get().banners[category] || null;
  },
  rotateBanner: (category: string) => {
    const { availableBanners, banners } = get();
    const files = availableBanners[category];
    
    if (!files || files.length === 0) return;
    
    // Pick a new random file, ideally different from current if possible
    let newBanner = banners[category];
    if (files.length > 1) {
       let randomIndex;
       do {
         randomIndex = Math.floor(Math.random() * files.length);
         newBanner = files[randomIndex];
       } while (newBanner === banners[category]);
    } else {
        newBanner = files[0];
    }
    
    set({ banners: { ...banners, [category]: newBanner } });
  }
}));
