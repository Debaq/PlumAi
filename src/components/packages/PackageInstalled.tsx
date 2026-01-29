import { useTranslation } from 'react-i18next';
import { Package, Trash2, RefreshCw } from 'lucide-react';
import { usePackageStore } from '../../stores/usePackageStore';
import type { PackageMetadata } from '../../types/packages';
import { useSettingsStore } from '../../stores/useSettingsStore';

export default function PackageInstalled() {
  const { t } = useTranslation();
  const { language } = useSettingsStore();
  const { installed, loadingUninstall, uninstallPackage, searchQuery } = usePackageStore();

  const filtered = installed.filter((pkg) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    let meta: { name?: string; description?: string } = {};
    try {
      const parsed = JSON.parse(pkg.metadata) as Record<string, PackageMetadata>;
      meta = parsed[language] || parsed['en'] || Object.values(parsed)[0] || {};
    } catch { /* ignore */ }
    return (
      pkg.id.toLowerCase().includes(q) ||
      pkg.author.toLowerCase().includes(q) ||
      (meta.name && meta.name.toLowerCase().includes(q))
    );
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--text-tertiary)]">
        <Package size={48} className="opacity-30" />
        <p>{t('packageStore.noInstalledPackages', 'No installed packages')}</p>
        <p className="text-xs">{t('packageStore.browseToInstall', 'Browse the catalog to install packages')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {filtered.map((pkg) => {
        let meta: { name?: string; description?: string } = {};
        try {
          const parsed = JSON.parse(pkg.metadata) as Record<string, PackageMetadata>;
          meta = parsed[language] || parsed['en'] || Object.values(parsed)[0] || {};
        } catch { /* ignore */ }

        return (
          <div
            key={pkg.id}
            className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
              <Package size={20} className="text-[var(--accent-primary)]" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--text-primary)] truncate">
                {meta.name || pkg.id}
              </h3>
              <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mt-0.5">
                <span>{pkg.author}</span>
                <span>v{pkg.version}</span>
                <span className="capitalize">{pkg.category}</span>
                {pkg.registry_id !== 'local' && <span>{pkg.registry_id}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                onClick={() => uninstallPackage(pkg.id)}
                disabled={loadingUninstall === pkg.id}
                title={t('packageStore.uninstall', 'Uninstall')}
              >
                {loadingUninstall === pkg.id ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
