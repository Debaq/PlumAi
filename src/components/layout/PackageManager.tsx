import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { PackageManifest } from '@/types/packages';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  Download, 
  Palette, 
  Layers, 
  User, 
  Info,
  AlertCircle,
  Loader2,
  Plus,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const PackageManager = () => {
  const { i18n } = useTranslation();
  const { activeProject, applyPackageIdentity } = useProjectStore();
  const [packages, setPackages] = useState<PackageManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const available: PackageManifest[] = await invoke('get_available_packages');
      setPackages(available);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load packages:', err);
      setError(t('packageManager.error'));
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedMetadata = (pkg: PackageManifest) => {
    const lang = i18n.language || 'es';
    return pkg.metadata[lang] || pkg.metadata['en'] || Object.values(pkg.metadata)[0];
  };

  const handleApplyStyle = async (pkg: PackageManifest) => {
    const isCurrent = activeProject?.activeIdentityPackage === pkg.id;
    await applyPackageIdentity(isCurrent ? null : pkg.id);
  };

  const handleInjectContent = async (pkg: PackageManifest) => {
    if (!activeProject) return;
    
    setLoading(true);
    try {
      await invoke('inject_package_content', {
        projectId: activeProject.id,
        packageId: pkg.id,
        lang: i18n.language || 'es'
      });
      alert(t('packageManager.successInject'));
      // Optionally reload project data here
    } catch (err: any) {
      console.error('Failed to inject content:', err);
      alert(`${t('packageManager.errorInject')}: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium italic">{t('packageManager.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 border-2 border-dashed border-destructive/20 rounded-2xl bg-destructive/5 text-center flex flex-col items-center gap-3">
        <AlertCircle className="w-10 h-10 text-destructive opacity-50" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-destructive">{t('packageManager.error')}</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadPackages} className="mt-2">{t('packageManager.retry')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight uppercase">{t('packageManager.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('packageManager.subtitle')}</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1 rounded-lg">
          {packages.length} {t('packageManager.available')}
        </Badge>
      </div>

      {packages.length === 0 ? (
        <div className="p-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center gap-4 text-center bg-muted/5">
          <div className="p-4 bg-muted rounded-full">
            <Package className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <div className="max-w-xs space-y-2">
            <p className="text-sm font-bold">{t('packageManager.noPackages')}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('packageManager.noPackagesDesc')} <code className="bg-muted px-1 rounded">packages</code>
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 mt-2">
            <Plus size={14} /> {t('packageManager.howTo')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg) => {
            const meta = getLocalizedMetadata(pkg);
            const isActive = activeProject?.activeIdentityPackage === pkg.id;
            return (
              <div 
                key={pkg.id}
                className={`group p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${isActive ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/40 hover:shadow-md'}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${
                      isActive ? 'bg-primary text-primary-foreground' :
                      pkg.category === 'content' ? 'bg-blue-500/10 text-blue-500' :
                      pkg.category === 'identity' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-amber-500/10 text-amber-500'
                    }`}>
                      {pkg.category === 'content' ? <Layers size={24} /> : 
                       pkg.category === 'identity' ? <Palette size={24} /> : 
                       <Package size={24} />}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2">
                        v{pkg.version}
                      </Badge>
                      {isActive && (
                        <Badge className="text-[10px] font-black uppercase tracking-widest px-2 bg-primary">
                          {t('packageManager.active')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-md tracking-tight group-hover:text-primary transition-colors">{meta.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mb-2">{t('modals.newProject.packages.by')} {pkg.author}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {meta.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {pkg.content && (
                      <div className="flex items-center gap-1 text-[9px] font-black bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase">
                        <User size={10} /> {t('packageManager.injectable')}
                      </div>
                    )}
                    {pkg.styles && (
                      <div className="flex items-center gap-1 text-[9px] font-black bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase">
                        <Palette size={10} /> {t('packageManager.visualStyle')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  {pkg.category === 'content' || pkg.category === 'hybrid' ? (
                    <Button 
                      className="flex-1 gap-2 rounded-xl h-10 text-xs font-bold" 
                      onClick={() => handleInjectContent(pkg)}
                      disabled={loading}
                    >
                      <Download size={14} />
                      {t('packageManager.injectContent')}
                    </Button>
                  ) : null}
                  
                  {pkg.category === 'identity' || pkg.category === 'hybrid' ? (
                    <Button 
                      className="flex-1 gap-2 rounded-xl h-10 text-xs font-bold" 
                      variant={isActive ? "secondary" : "default"}
                      onClick={() => handleApplyStyle(pkg)}
                      disabled={loading}
                    >
                      {isActive ? <Check size={14} /> : <Palette size={14} />}
                      {isActive ? t('packageManager.styleApplied') : t('packageManager.applyStyle')}
                    </Button>
                  ) : null}
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl" title="Más información">
                    <Info size={16} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

