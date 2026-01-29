import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Globe, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import { usePackageStore } from '../../stores/usePackageStore';

export default function RegistryManager() {
  const { t } = useTranslation();
  const { registries, addRegistry, removeRegistry, toggleRegistry } = usePackageStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  const handleAdd = async () => {
    if (!newUrl.trim() || !newName.trim()) return;
    await addRegistry(newUrl.trim(), newName.trim());
    setNewUrl('');
    setNewName('');
    setShowAdd(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          {t('packageStore.registries', 'Package Registries')}
        </h3>
        <button
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/30 transition-colors"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus size={14} />
          {t('packageStore.addRegistry', 'Add Registry')}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder={t('packageStore.registryNamePlaceholder', 'Registry name')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
          <input
            type="text"
            placeholder={t('packageStore.registryUrlPlaceholder', 'https://github.com/user/repo')}
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
          <div className="flex justify-end gap-2">
            <button
              className="text-xs px-3 py-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              onClick={() => setShowAdd(false)}
            >
              {t('common.cancel')}
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded-md bg-[var(--accent-primary)] text-white hover:opacity-90 transition-colors"
              onClick={handleAdd}
              disabled={!newUrl.trim() || !newName.trim()}
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      )}

      {/* Registry list */}
      <div className="flex flex-col gap-2">
        {registries.map((reg) => (
          <div
            key={reg.id}
            className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg p-3 flex items-center gap-3"
          >
            <div className="flex-shrink-0">
              {reg.is_official ? (
                <Shield size={18} className="text-[var(--accent-primary)]" />
              ) : (
                <Globe size={18} className="text-[var(--text-tertiary)]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)] truncate">{reg.name}</span>
                {reg.is_official && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                    {t('packageStore.official', 'Official')}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-tertiary)] truncate">{reg.url}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                onClick={() => toggleRegistry(reg.id, !reg.enabled)}
                title={reg.enabled ? t('packageStore.disable', 'Disable') : t('packageStore.enable', 'Enable')}
              >
                {reg.enabled ? (
                  <ToggleRight size={22} className="text-green-400" />
                ) : (
                  <ToggleLeft size={22} />
                )}
              </button>

              {!reg.is_official && (
                <button
                  className="p-1 text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
                  onClick={() => removeRegistry(reg.id)}
                  title={t('packageStore.removeRegistry', 'Remove registry')}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
