import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Package, Download, ArrowUpCircle, RefreshCw, Settings2 } from 'lucide-react';
import { usePackageStore, type PackageCategoryFilter, type PackageStoreTab } from '../../stores/usePackageStore';
import PackageCatalog from './PackageCatalog';
import PackageInstalled from './PackageInstalled';
import PackageUpdates from './PackageUpdates';
import PackageDetailModal from './PackageDetailModal';
import RegistryManager from './RegistryManager';
import { useSettingsStore } from '../../stores/useSettingsStore';
import type { CatalogPackage } from '../../types/packages';

const TABS: { key: PackageStoreTab; icon: typeof Package; labelKey: string; fallback: string }[] = [
  { key: 'browse', icon: Package, labelKey: 'packageStore.browse', fallback: 'Browse' },
  { key: 'installed', icon: Download, labelKey: 'packageStore.installedTab', fallback: 'Installed' },
  { key: 'updates', icon: ArrowUpCircle, labelKey: 'packageStore.updatesTab', fallback: 'Updates' },
];

const CATEGORIES: { key: PackageCategoryFilter; labelKey: string; fallback: string }[] = [
  { key: 'all', labelKey: 'packageStore.filterAll', fallback: 'All' },
  { key: 'content', labelKey: 'packageStore.filterContent', fallback: 'Content' },
  { key: 'identity', labelKey: 'packageStore.filterIdentity', fallback: 'Identity' },
  { key: 'hybrid', labelKey: 'packageStore.filterHybrid', fallback: 'Hybrid' },
];

export default function PackageStoreView() {
  const { t } = useTranslation();
  const { language } = useSettingsStore();
  const {
    activeTab,
    setActiveTab,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    updates,
    loadingCatalog,
    loadingInstall,
    loadingUninstall,
    error,
    fetchRegistries,
    fetchCatalog,
    fetchInstalled,
    checkUpdates,
    installPackage,
    updatePackage,
    uninstallPackage,
  } = usePackageStore();

  const [detailPkg, setDetailPkg] = useState<CatalogPackage | null>(null);
  const [showRegistries, setShowRegistries] = useState(false);

  // Initial data load
  useEffect(() => {
    fetchRegistries();
    fetchCatalog();
    fetchInstalled();
    checkUpdates();
  }, []);

  const handleRefresh = () => {
    fetchCatalog();
    fetchInstalled();
    checkUpdates();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              {t('packageStore.title', 'Package Store')}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {t('packageStore.subtitle', 'Browse, install, and manage content packages')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              onClick={() => setShowRegistries(!showRegistries)}
              title={t('packageStore.manageRegistries', 'Manage registries')}
            >
              <Settings2 size={18} />
            </button>
            <button
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
              onClick={handleRefresh}
              title={t('packageStore.refresh', 'Refresh')}
            >
              <RefreshCw size={18} className={loadingCatalog ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-1 mb-4">
          {TABS.map(({ key, icon: Icon, labelKey, fallback }) => (
            <button
              key={key}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                activeTab === key
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={16} />
              <span>{t(labelKey, fallback)}</span>
              {key === 'updates' && updates.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-amber-500 text-white font-bold">
                  {updates.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Filters (Browse tab only) */}
        {activeTab === 'browse' && (
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder={t('packageStore.searchPlaceholder', 'Search packages...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
            <div className="flex items-center gap-1">
              {CATEGORIES.map(({ key, labelKey, fallback }) => (
                <button
                  key={key}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    categoryFilter === key
                      ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                  onClick={() => setCategoryFilter(key)}
                >
                  {t(labelKey, fallback)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search (Installed tab) */}
        {activeTab === 'installed' && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder={t('packageStore.searchInstalled', 'Search installed packages...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Registry manager panel */}
      {showRegistries && (
        <div className="flex-shrink-0 px-6 pb-4">
          <RegistryManager />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 'browse' && <PackageCatalog onDetail={setDetailPkg} />}
        {activeTab === 'installed' && <PackageInstalled />}
        {activeTab === 'updates' && <PackageUpdates />}
      </div>

      {/* Detail modal */}
      {detailPkg && (
        <PackageDetailModal
          pkg={detailPkg}
          lang={language}
          onClose={() => setDetailPkg(null)}
          onInstall={(p) => {
            installPackage(p.registry_id, p.id);
            setDetailPkg(null);
          }}
          onUpdate={(p) => {
            updatePackage(p.registry_id, p.id);
            setDetailPkg(null);
          }}
          onUninstall={(p) => {
            uninstallPackage(p.id);
            setDetailPkg(null);
          }}
          loadingInstall={loadingInstall === detailPkg.id}
          loadingUninstall={loadingUninstall === detailPkg.id}
        />
      )}
    </div>
  );
}
