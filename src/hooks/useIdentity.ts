import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useBannerStore } from '@/stores/useBannerStore';
import { invoke } from '@tauri-apps/api/core';
import { convertFileSrc } from '@tauri-apps/api/core';
import { PackageManifest } from '@/types/packages';

export const useIdentity = () => {
  const { activeProject } = useProjectStore();
  const { getBanner: getDefaultBanner } = useBannerStore();
  const [activePackage, setActivePackage] = useState<PackageManifest | null>(null);
  const [packageBanners, setPackageBanners] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeProject?.activeIdentityPackage) {
      loadPackage(activeProject.activeIdentityPackage);
    } else {
      setActivePackage(null);
      setPackageBanners({});
    }
  }, [activeProject?.activeIdentityPackage]);

  const loadPackage = async (id: string) => {
    try {
      const pkg: PackageManifest | null = await invoke('get_package_by_id', { id });
      setActivePackage(pkg);
      
      if (pkg?.styles?.banners) {
        const resolvedBanners: Record<string, string> = {};
        for (const [context, filename] of Object.entries(pkg.styles.banners)) {
          try {
            const absolutePath: string = await invoke('resolve_package_asset', { 
              packageId: id, 
              assetPath: `banners/${filename}` 
            });
            resolvedBanners[context] = convertFileSrc(absolutePath);
          } catch (e) {
            console.error(`Failed to resolve banner ${filename}:`, e);
          }
        }
        setPackageBanners(resolvedBanners);
      }
    } catch (err) {
      console.error('Failed to load identity package:', err);
      setActivePackage(null);
    }
  };

  const getBanner = (context: string) => {
    // 1. Check if package has a banner for this context
    if (packageBanners[context]) {
      return packageBanners[context];
    }

    // 2. Check if project has a custom banner
    if (activeProject?.banners?.[context]) {
      return activeProject.banners[context];
    }

    // 3. Fallback to global defaults
    return getDefaultBanner(context);
  };

  const getStyle = () => {
    if (!activePackage?.styles) return null;
    return {
      primaryColor: activePackage.styles.primary_color,
      secondaryColor: activePackage.styles.secondary_color,
      fontFamily: activePackage.styles.font_family,
      theme: activePackage.styles.theme,
    };
  };

  return {
    activePackage,
    getBanner,
    getStyle,
    isUsingPackage: !!activePackage
  };
};
