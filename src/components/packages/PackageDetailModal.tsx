import { useTranslation } from 'react-i18next';
import { X, Package, Download, RefreshCw, Trash2, CheckCircle, Tag, Shield } from 'lucide-react';
import type { CatalogPackage } from '../../types/packages';

interface PackageDetailModalProps {
  pkg: CatalogPackage;
  lang: string;
  onClose: () => void;
  onInstall?: (pkg: CatalogPackage) => void;
  onUpdate?: (pkg: CatalogPackage) => void;
  onUninstall?: (pkg: CatalogPackage) => void;
  loadingInstall?: boolean;
  loadingUninstall?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function PackageDetailModal({
  pkg,
  lang,
  onClose,
  onInstall,
  onUpdate,
  onUninstall,
  loadingInstall,
  loadingUninstall,
}: PackageDetailModalProps) {
  const { t } = useTranslation();
  const meta = pkg.metadata[lang] || pkg.metadata['en'] || Object.values(pkg.metadata)[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-[var(--border-primary)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
              <Package size={24} className="text-[var(--accent-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{meta?.name || pkg.id}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{pkg.author}</p>
            </div>
          </div>
          <button
            className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Description */}
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {meta?.description || t('common.noDescription')}
          </p>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <span className="text-[var(--text-tertiary)] text-xs">{t('packageStore.version', 'Version')}</span>
              <p className="text-[var(--text-primary)] font-mono mt-0.5">v{pkg.version}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <span className="text-[var(--text-tertiary)] text-xs">{t('packageStore.category', 'Category')}</span>
              <p className="text-[var(--text-primary)] capitalize mt-0.5">{pkg.category}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <span className="text-[var(--text-tertiary)] text-xs">{t('packageStore.size', 'Size')}</span>
              <p className="text-[var(--text-primary)] mt-0.5">{formatSize(pkg.size_bytes)}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <span className="text-[var(--text-tertiary)] text-xs">{t('packageStore.registry', 'Registry')}</span>
              <p className="text-[var(--text-primary)] mt-0.5 truncate">{pkg.registry_id}</p>
            </div>
          </div>

          {/* Min app version */}
          {pkg.min_app_version && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <Shield size={14} />
              <span>{t('packageStore.requiresVersion', 'Requires app version')}: {pkg.min_app_version}+</span>
            </div>
          )}

          {/* Tags */}
          {pkg.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Tag size={14} className="text-[var(--text-tertiary)] mt-0.5" />
              {pkg.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Installed info */}
          {pkg.is_installed && (
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 rounded-lg p-3">
              <CheckCircle size={16} />
              <span>{t('packageStore.installedVersion', 'Installed version')}: v{pkg.installed_version}</span>
            </div>
          )}

          {/* Checksum */}
          {pkg.checksum_sha256 && (
            <div className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-secondary)] rounded-lg p-3 font-mono break-all">
              <span className="text-[var(--text-tertiary)] block mb-1">SHA-256:</span>
              {pkg.checksum_sha256}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 pt-4 border-t border-[var(--border-primary)] flex justify-end gap-3">
          {pkg.is_installed && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              onClick={() => onUninstall?.(pkg)}
              disabled={loadingUninstall}
            >
              {loadingUninstall ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {t('packageStore.uninstall', 'Uninstall')}
            </button>
          )}

          {pkg.is_installed && pkg.has_update && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
              onClick={() => onUpdate?.(pkg)}
              disabled={loadingInstall}
            >
              {loadingInstall ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {t('packageStore.update', 'Update')}
            </button>
          )}

          {!pkg.is_installed && (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[var(--accent-primary)] text-white hover:opacity-90 transition-colors disabled:opacity-50"
              onClick={() => onInstall?.(pkg)}
              disabled={loadingInstall}
            >
              {loadingInstall ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
              {t('packageStore.install', 'Install')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
