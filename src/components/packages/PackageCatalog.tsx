import { useTranslation } from 'react-i18next';
import { Package, RefreshCw } from 'lucide-react';
import { usePackageStore } from '../../stores/usePackageStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import PackageCard from './PackageCard';
import type { CatalogPackage } from '../../types/packages';

interface PackageCatalogProps {
  onDetail: (pkg: CatalogPackage) => void;
}

export default function PackageCatalog({ onDetail }: PackageCatalogProps) {
  const { t } = useTranslation();
  const { language } = useSettingsStore();
  const {
    catalog,
    searchQuery,
    categoryFilter,
    loadingCatalog,
    loadingInstall,
    loadingUninstall,
    installPackage,
    updatePackage,
    uninstallPackage,
  } = usePackageStore();

  const filtered = catalog.filter((pkg) => {
    if (categoryFilter !== 'all' && pkg.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const meta = pkg.metadata[language] || pkg.metadata['en'] || Object.values(pkg.metadata)[0];
      return (
        pkg.id.toLowerCase().includes(q) ||
        pkg.author.toLowerCase().includes(q) ||
        meta?.name.toLowerCase().includes(q) ||
        meta?.description.toLowerCase().includes(q) ||
        pkg.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (loadingCatalog) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--text-tertiary)]">
        <RefreshCw size={32} className="animate-spin text-[var(--accent-primary)]" />
        <p>{t('packageStore.loadingCatalog', 'Loading package catalog...')}</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--text-tertiary)]">
        <Package size={48} className="opacity-30" />
        <p>{t('packageStore.noPackagesFound', 'No packages found')}</p>
        {searchQuery && (
          <p className="text-xs">{t('packageStore.tryDifferentSearch', 'Try a different search term')}</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((pkg) => (
        <PackageCard
          key={pkg.id}
          pkg={pkg}
          lang={language}
          onInstall={(p) => installPackage(p.registry_id, p.id)}
          onUpdate={(p) => updatePackage(p.registry_id, p.id)}
          onUninstall={(p) => uninstallPackage(p.id)}
          onDetail={onDetail}
          loadingInstall={loadingInstall === pkg.id}
          loadingUninstall={loadingUninstall === pkg.id}
        />
      ))}
    </div>
  );
}
