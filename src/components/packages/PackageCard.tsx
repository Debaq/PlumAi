import { useTranslation } from 'react-i18next';
import { Package, Download, RefreshCw, Trash2, CheckCircle } from 'lucide-react';
import type { CatalogPackage } from '../../types/packages';

interface PackageCardProps {
  pkg: CatalogPackage;
  lang: string;
  onInstall?: (pkg: CatalogPackage) => void;
  onUpdate?: (pkg: CatalogPackage) => void;
  onUninstall?: (pkg: CatalogPackage) => void;
  onDetail?: (pkg: CatalogPackage) => void;
  loadingInstall?: boolean;
  loadingUninstall?: boolean;
}

const categoryColors: Record<string, string> = {
  content: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  identity: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  hybrid: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  template: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

function formatSize(bytes: number): string {
  if (bytes === 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function PackageCard({
  pkg,
  lang,
  onInstall,
  onUpdate,
  onUninstall,
  onDetail,
  loadingInstall,
  loadingUninstall,
}: PackageCardProps) {
  const { t } = useTranslation();
  const meta = pkg.metadata[lang] || pkg.metadata['en'] || Object.values(pkg.metadata)[0];
  const catClass = categoryColors[pkg.category] || categoryColors.content;

  return (
    <div
      className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 flex flex-col gap-3 hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
      onClick={() => onDetail?.(pkg)}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
          <Package size={20} className="text-[var(--accent-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text-primary)] truncate">{meta?.name || pkg.id}</h3>
          <p className="text-xs text-[var(--text-secondary)]">{pkg.author}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 flex-1">
        {meta?.description || ''}
      </p>

      {/* Tags & Category */}
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full border ${catClass}`}>
          {pkg.category}
        </span>
        {pkg.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer: version + size + action */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-primary)]">
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <span>v{pkg.version}</span>
          {pkg.size_bytes > 0 && <span>{formatSize(pkg.size_bytes)}</span>}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          {pkg.is_installed && pkg.has_update && (
            <button
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
              onClick={() => onUpdate?.(pkg)}
              disabled={loadingInstall}
            >
              {loadingInstall ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              {t('packageStore.update', 'Update')}
            </button>
          )}

          {pkg.is_installed && !pkg.has_update && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle size={14} />
                {t('packageStore.installed', 'Installed')}
              </span>
              <button
                className="text-xs p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                onClick={() => onUninstall?.(pkg)}
                disabled={loadingUninstall}
                title={t('packageStore.uninstall', 'Uninstall')}
              >
                {loadingUninstall ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          )}

          {!pkg.is_installed && (
            <button
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/30 transition-colors disabled:opacity-50"
              onClick={() => onInstall?.(pkg)}
              disabled={loadingInstall}
            >
              {loadingInstall ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {t('packageStore.install', 'Install')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
