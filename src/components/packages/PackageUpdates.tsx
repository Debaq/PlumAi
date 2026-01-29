import { useTranslation } from 'react-i18next';
import { Package, RefreshCw, ArrowUpCircle } from 'lucide-react';
import { usePackageStore } from '../../stores/usePackageStore';

export default function PackageUpdates() {
  const { t } = useTranslation();
  const { updates, loadingInstall, updatePackage } = usePackageStore();

  if (updates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--text-tertiary)]">
        <Package size={48} className="opacity-30" />
        <p>{t('packageStore.noUpdates', 'All packages are up to date')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {updates.map((update) => {
        return (
          <div
            key={update.id}
            className="bg-[var(--bg-secondary)] border border-amber-500/30 rounded-lg p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <ArrowUpCircle size={20} className="text-amber-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--text-primary)] truncate">{update.id}</h3>
              <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mt-0.5">
                <span>v{update.current_version}</span>
                <span className="text-amber-400">→</span>
                <span className="text-amber-400 font-semibold">v{update.available_version}</span>
              </div>
            </div>

            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50 flex-shrink-0"
              onClick={() => updatePackage(update.registry_id, update.id)}
              disabled={loadingInstall === update.id}
            >
              {loadingInstall === update.id ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              {t('packageStore.update', 'Update')}
            </button>
          </div>
        );
      })}
    </div>
  );
}
