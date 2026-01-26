import { useState, useEffect, useRef } from 'react';
import { useSettingsStore, AIProvider, TokenOptimizationLevel, AppLanguage, AppFontFamily, AppTheme } from '@/stores/useSettingsStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { useTranslation } from 'react-i18next';
import { CryptoService } from '@/lib/crypto';
import { dbClearAllData } from '@/lib/tauri-bridge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PackageManager } from './PackageManager';
import { 
  Settings, 
  Brain, 
  Zap, 
  Terminal, 
  Save, 
  Trash2, 
  Shield,
  Star,
  Plus,
  ExternalLink,
  Lock,
  Key,
  AlertTriangle,
  GitBranch,
  Dices,
  Check,
  Palette,
  Type,
  Maximize,
  Undo2,
  Image as ImageIcon,
  Layers,
  AlertOctagon,
  Loader2
} from 'lucide-react';

export const SettingsModal = ({ isView = false }: { isView?: boolean }) => {
  const { i18n, t } = useTranslation();
  const { activeModal, closeModal, activeSettingsTab } = useUIStore();
  const settings = useSettingsStore();
  const { activeProject, setActiveProject, clearActiveProject, addApiKey, deleteApiKey, setDefaultApiKey } = useProjectStore();
  
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  // Confirmation state for Font Size
  const [isConfirmingSize, setIsConfirmingSize] = useState(false);
  const [previousSize, setPreviousSize] = useState(16);
  const [countdown, setCountdown] = useState(10);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Security state
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Danger Zone State
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const CONFIRMATION_KEYWORD = "ELIMINAR";

  useEffect(() => {
    if (activeModal === 'settings' || activeSettingsTab === 'security') {
      setSecurityError('');
      setMasterPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setIsChangingPassword(false);
    }
  }, [activeModal, activeSettingsTab]);

  // Reset danger modal when closed
  useEffect(() => {
    if (!showDangerModal) {
      setDeleteConfirmationText('');
      setIsDeleting(false);
    }
  }, [showDangerModal]);

  // Handle countdown for font size
  useEffect(() => {
    if (isConfirmingSize && countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isConfirmingSize && countdown === 0) {
      handleRevertSize();
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isConfirmingSize, countdown]);

  if (!isView && activeModal !== 'settings') return null;

  const handleSizeChange = (newSize: number) => {
    if (newSize === settings.fontSize) return;
    setPreviousSize(settings.fontSize);
    settings.setFontSize(newSize);
    setIsConfirmingSize(true);
    setCountdown(10);
  };

  const handleConfirmSize = () => {
    setIsConfirmingSize(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleRevertSize = () => {
    settings.setFontSize(previousSize);
    setIsConfirmingSize(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleSetMasterPassword = async () => {
    if (masterPassword.length < 4) {
      setSecurityError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (masterPassword !== confirmPassword) {
      setSecurityError('Las contraseñas no coinciden');
      return;
    }

    try {
      const hash = await CryptoService.hashPassword(masterPassword);
      settings.setMasterPassword(hash);
      setMasterPassword('');
      setConfirmPassword('');
      setSecurityError('');
      alert('Contraseña maestra configurada correctamente');
    } catch (err) {
      setSecurityError('Error al configurar la contraseña');
    }
  };

  const handleChangePassword = async () => {
    try {
      const currentHash = await CryptoService.hashPassword(currentPassword);
      if (currentHash !== settings.masterPasswordHash) {
        setSecurityError('La contraseña actual es incorrecta');
        return;
      }

      if (masterPassword.length < 4) {
        setSecurityError('La nueva contraseña debe tener al menos 4 caracteres');
        return;
      }

      if (masterPassword !== confirmPassword) {
        setSecurityError('Las nuevas contraseñas no coinciden');
        return;
      }

      const newHash = await CryptoService.hashPassword(masterPassword);
      settings.setMasterPassword(newHash);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setMasterPassword('');
      setConfirmPassword('');
      setSecurityError('');
      alert('Contraseña maestra actualizada');
    } catch (err) {
      setSecurityError('Error al actualizar la contraseña');
    }
  };

  const handleRemovePassword = async () => {
    try {
      const currentHash = await CryptoService.hashPassword(currentPassword);
      if (currentHash !== settings.masterPasswordHash) {
        setSecurityError('La contraseña es incorrecta');
        return;
      }

      if (confirm('¿Seguro que quieres eliminar la protección por contraseña? Tus API keys quedarán expuestas en el almacenamiento local.')) {
        settings.setMasterPassword(null);
        settings.setEncryptApiKeys(false);
        setCurrentPassword('');
        setSecurityError('');
      }
    } catch (err) {
      setSecurityError('Error al eliminar la contraseña');
    }
  };

  const providers: { id: AIProvider; name: string; freeTier: string }[] = [
    { id: 'anthropic', name: 'Claude (Anthropic)', freeTier: '$5 gratis' },
    { id: 'openai', name: 'OpenAI (ChatGPT)', freeTier: 'Solo pago' },
    { id: 'google', name: 'Google Gemini', freeTier: 'Gratis (15 RPM)' },
    { id: 'groq', name: 'Groq', freeTier: 'Gratis (Ultra rápido)' },
    { id: 'together', name: 'Together AI', freeTier: '$25 gratis' },
    { id: 'huggingface', name: 'HuggingFace', freeTier: 'Limitado' },
    { id: 'ollama', name: 'Ollama (Local)', freeTier: '100% Gratis' },
    { id: 'manual', name: 'Manual (Copy/Paste)', freeTier: 'Gratis' },
  ];

  const imageProviders = [
    { id: 'googleImagen', name: 'Google Imagen', desc: 'Calidad fotorealista de Google' },
    { id: 'dalle', name: 'DALL-E 3', desc: 'Comprensión semántica superior' },
    { id: 'stabilityai', name: 'Stable Diffusion', desc: 'Control total artístico' },
    { id: 'replicate', name: 'Replicate', desc: 'Acceso a múltiples modelos' },
  ];

  const handleAddKey = (type: 'text' | 'image', provider: string) => {
    if (!newKeyValue.trim()) return;
    addApiKey(type, provider, {
      name: newKeyName.trim() || `Key ${Date.now().toString().slice(-4)}`,
      key: newKeyValue.trim(),
    });
    setNewKeyName('');
    setNewKeyValue('');
  };

  const handleLanguageChange = (lang: AppLanguage) => {
    settings.setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleExportAll = async () => {
    if (!activeProject) return;

    let dataToExport: string;
    let filename = `${activeProject.title || 'project'}-backup.json`;

    if (settings.masterPasswordHash) {
      const shouldEncrypt = confirm('¿Deseas encriptar este backup con tu contraseña maestra? Solo podrás importarlo usando la misma contraseña.');
      if (shouldEncrypt) {
        const password = prompt('Introduce tu contraseña maestra para encriptar:');
        if (!password) return;

        const hash = await CryptoService.hashPassword(password);
        if (hash !== settings.masterPasswordHash) {
          alert('Contraseña incorrecta. El backup no se ha exportado.');
          return;
        }

        const encryptedProject = await CryptoService.encryptProject(activeProject, password);
        dataToExport = JSON.stringify(encryptedProject, null, 2);
        filename = `${activeProject.title || 'project'}-encrypted-backup.pluma`;
      } else {
        dataToExport = JSON.stringify(activeProject, null, 2);
      }
    } else {
      dataToExport = JSON.stringify(activeProject, null, 2);
    }

    const blob = new Blob([dataToExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.pluma';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event: any) => {
        try {
          let projectData = JSON.parse(event.target.result);

          if (projectData._encrypted) {
            const password = prompt('Este archivo está encriptado. Introduce la contraseña:');
            if (!password) return;

            try {
              projectData = await CryptoService.decryptProject(projectData, password);
            } catch (err) {
              alert('Contraseña incorrecta o archivo corrupto');
              return;
            }
          }

          if (confirm(`¿Importar proyecto "${projectData.title || projectData.projectInfo?.title}"? Esto reemplazará el proyecto actual.`)) {
            setActiveProject(projectData);
            alert('Proyecto importado correctamente');
          }
        } catch (err) {
          console.error('Error al importar:', err);
          alert('Error al procesar el archivo');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Triggered by button click, opens the Danger Modal
  const handleInitiateDelete = () => {
    setShowDangerModal(true);
  };

  // Executed when user confirms in the Danger Modal
  const handleExecuteDelete = async () => {
    if (deleteConfirmationText !== CONFIRMATION_KEYWORD) return;
    
    setIsDeleting(true);
    
    try {
      // 1. Clear Backend (Source of Truth)
      await dbClearAllData();
      
      // 2. Clear Frontend State
      clearActiveProject();
      
      // 3. Clear Browser Storage (Legacy & Cache)
      localStorage.clear();
      sessionStorage.clear();
      
      // 4. Hard Reload
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting all data:', error);
      alert('Error al eliminar los datos de la base de datos.');
      setIsDeleting(false);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 4)}••••${key.slice(-4)}`;
  };

  const themes: { id: AppTheme; name: string; colors: string[] }[] = [
    { id: 'dark', name: 'Dark Modern', colors: ['#1e1e1e', '#007acc'] },
    { id: 'dracula', name: 'Dracula Focus', colors: ['#282a36', '#bd93f9'] },
    { id: 'light', name: 'Light Pastel', colors: ['#faf8f3', '#a89bd5'] },
    { id: 'emerald', name: 'Emerald Forest', colors: ['#0a2e1a', '#10b981'] },
    { id: 'parchment', name: 'Parchment RPG', colors: ['#f4e4bc', '#8b4513'] },
    { id: 'hell', name: 'Hell Fire', colors: ['#0f0000', '#990000'] },
    { id: 'nordic', name: 'Nordic Clean', colors: ['#f0f2f5', '#4a5568'] },
    { id: 'midnight', name: 'Midnight Focus', colors: ['#0b0e14', '#3182ce'] },
    { id: 'cyberpunk', name: 'Terminal Green', colors: ['#000000', '#00ff00'] },
  ];

  const fonts: { id: AppFontFamily; name: string; preview: string; type: 'Serif' | 'Sans' | 'Mono' }[] = [
    { id: 'inter', name: 'Inter', preview: 'Modern UI', type: 'Sans' },
    { id: 'merriweather', name: 'Merriweather', preview: 'High Readability', type: 'Serif' },
    { id: 'lora', name: 'Lora', preview: 'Elegant Writing', type: 'Serif' },
    { id: 'garamond', name: 'EB Garamond', preview: 'Literary Classic', type: 'Serif' },
    { id: 'playfair', name: 'Playfair', preview: 'Traditional Style', type: 'Serif' },
    { id: 'montserrat', name: 'Montserrat', preview: 'Geometric Clean', type: 'Sans' },
    { id: 'jetbrains', name: 'JetBrains', preview: 'Focus Mono', type: 'Mono' },
    { id: 'system', name: 'System', preview: 'Default Native', type: 'Sans' },
  ];

  const sizes = [12, 14, 16, 18, 20, 24, 28];

  const SettingsContent = () => (
    <div className={`flex flex-col h-full overflow-hidden ${isView ? 'bg-background' : ''}`}>
      <div className="flex-1 p-6 overflow-y-auto">
        {/* GENERAL */}
        {activeSettingsTab === 'general' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-5xl mx-auto pb-20">
            
            {/* Theme Selector */}
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Tema Visual
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {themes.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => settings.setTheme(t.id)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col gap-2 text-left group ${settings.theme === t.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40 hover:bg-muted/50'}`}
                  >
                    <div className="flex gap-1">
                      <div className="w-full h-6 rounded-md border border-border/20" style={{ backgroundColor: t.colors[0] }}></div>
                      <div className="w-1/3 h-6 rounded-md border border-border/20" style={{ backgroundColor: t.colors[1] }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{t.name}</span>
                      {settings.theme === t.id && <Check size={14} className="text-primary shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Selector */}
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Type className="w-4 h-4" />
                Tipografía Profesional
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {fonts.map((f) => (
                  <button 
                    key={f.id}
                    onClick={() => settings.setFontFamily(f.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col gap-1 text-left relative overflow-hidden ${settings.fontFamily === f.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40 hover:bg-muted/50'}`}
                  >
                    <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest absolute top-2 right-3">{f.type}</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">{f.name}</span>
                    <span className="text-lg leading-tight truncate mt-1" style={{ fontFamily: `var(--font-family-${f.id})` }}>
                      {f.preview}
                    </span>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] opacity-50">Abc 123</span>
                      {settings.fontFamily === f.id && <Check size={14} className="text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Selector */}
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Maximize className="w-4 h-4" />
                Tamaño de Fuente
              </h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSizeChange(s)}
                    className={`h-12 min-w-12 px-4 rounded-xl border-2 transition-all flex items-center justify-center font-bold ${settings.fontSize === s ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-border hover:border-primary/40 text-muted-foreground'}`}
                  >
                    <span style={{ fontSize: `${Math.max(12, s * 0.8)}px` }}>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language and RPG Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
              <div className="space-y-2">
                <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest px-1">Idioma de la Interfaz</Label>
                <Select value={settings.language} onValueChange={(v: AppLanguage) => handleLanguageChange(v)}>
                  <SelectTrigger className="h-12 rounded-xl bg-card border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="en">🇬🇧 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest px-1 flex items-center gap-2">
                  <Dices className="w-3 h-3" />
                  Modo Worldbuilder
                </Label>
                <div className="flex items-center justify-between p-3 border-2 rounded-xl bg-card h-12">
                  <span className="text-xs font-medium">{t('ai.settings.worldbuilder.enable')}</span>
                  <input 
                    type="checkbox"
                    className="w-4 h-4 accent-primary"
                    checked={activeProject?.isRpgModeEnabled || false}
                    onChange={(e) => useProjectStore.getState().toggleRpgMode(e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Toast for Font Size */}
        {isConfirmingSize && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-md">
              <div className="flex flex-col">
                <span className="text-sm font-bold">¿Mantener el nuevo tamaño?</span>
                <span className="text-[10px] opacity-80 uppercase tracking-widest">Se revertirá en {countdown} segundos</span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleConfirmSize} className="rounded-lg h-9 font-bold px-4 text-primary bg-white hover:bg-white/90 transition-colors">
                  Mantener
                </Button>
                <Button variant="ghost" size="sm" onClick={handleRevertSize} className="rounded-lg h-9 font-bold px-4 hover:bg-white/10 flex gap-2 text-white border border-white/20">
                  <Undo2 size={14} />
                  Revertir
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* AI (Consolidated IA Texto, IA Imagen, Optimización) */}
        {activeSettingsTab === 'ia' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-4xl mx-auto pb-20">
            {/* Texto Section */}
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Type className="w-4 h-4" />
                Configuración de Texto e IA
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold ml-1">Proveedor Principal</Label>
                  <Select value={settings.activeProvider} onValueChange={(v: AIProvider) => settings.setActiveProvider(v)}>
                    <SelectTrigger className="h-11 border-2 rounded-xl bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.freeTier})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold ml-1">Optimización de Tokens</Label>
                  <Select value={settings.tokenOptimizationLevel} onValueChange={(v: TokenOptimizationLevel) => settings.setTokenLevel(v)}>
                    <SelectTrigger className="h-11 border-2 rounded-xl bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">⚡ Mínimo (~1,000 tokens)</SelectItem>
                      <SelectItem value="normal">⚖️ Normal (~3,000 tokens)</SelectItem>
                      <SelectItem value="complete">📚 Completo (~8,000 tokens)</SelectItem>
                      <SelectItem value="unlimited">🚀 Sin límite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Key Management */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <Label className="font-bold">API Keys para {providers.find(p => p.id === settings.activeProvider)?.name}</Label>
                  <Badge variant="outline" className="rounded-lg">{activeProject?.apiKeys?.text?.[settings.activeProvider]?.length || 0} guardadas</Badge>
                </div>
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nombre" 
                    className="w-1/3 h-11 border-2 rounded-xl" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                  <Input 
                    placeholder="sk-..." 
                    type="password" 
                    className="flex-1 h-11 border-2 rounded-xl"
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                  />
                  <Button className="h-11 w-11 rounded-xl" onClick={() => handleAddKey('text', settings.activeProvider)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(activeProject?.apiKeys?.text?.[settings.activeProvider] || []).map((keyEntry: any) => (
                    <div key={keyEntry.id} className="p-3 border-2 rounded-xl bg-card/50 flex items-center justify-between">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          {keyEntry.isDefault && <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />}
                          <span className="text-xs font-bold truncate">{keyEntry.name}</span>
                        </div>
                        <code className="text-[9px] text-muted-foreground">{maskKey(keyEntry.key)}</code>
                      </div>
                      <div className="flex items-center gap-1">
                        {!keyEntry.isDefault && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setDefaultApiKey('text', settings.activeProvider, keyEntry.id)}>
                            <Star className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => deleteApiKey('text', settings.activeProvider, keyEntry.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Agéntica Section */}
            <div className="p-4 border-2 rounded-2xl bg-primary/5 flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2 cursor-pointer font-bold" htmlFor="agentic-mode-ia">
                  <Brain className="w-4 h-4 text-primary" />
                  Sistema de IA Agéntica
                </Label>
                <p className="text-[10px] text-muted-foreground font-medium">
                  La IA analiza personajes y lore para incluirlos solo cuando son relevantes.
                </p>
              </div>
              <input 
                id="agentic-mode-ia"
                type="checkbox" 
                className="w-5 h-5 accent-primary cursor-pointer" 
                checked={settings.useAgenticContext}
                onChange={(e) => settings.setAgenticContext(e.target.checked)}
              />
            </div>

            {/* Imagen Section */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Generación de Imágenes
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold ml-1">Proveedor de Imagen</Label>
                  <Select defaultValue="googleImagen">
                    <SelectTrigger className="h-11 border-2 rounded-xl bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {imageProviders.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="font-bold">{p.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PACKAGES */}
        {activeSettingsTab === 'packages' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-5xl mx-auto pb-20">
            <PackageManager />
          </div>
        )}

        {/* SECURITY */}
        {activeSettingsTab === 'security' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-3xl mx-auto pb-20">
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Privacidad y Protección</h3>
              
              {!settings.masterPasswordHash ? (
                <div className="space-y-4">
                  <div className="p-4 border-2 border-yellow-500/20 bg-yellow-500/5 rounded-2xl flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold">Sin Contraseña Maestra</p>
                      <p className="text-xs text-muted-foreground">
                        Tus API Keys se guardan en texto plano en el navegador. Recomendamos activar la protección.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 p-6 border-2 rounded-2xl bg-card">
                    <Label className="text-lg font-black">Configurar Contraseña Maestra</Label>
                    <div className="space-y-3">
                      <Input 
                        type="password" 
                        placeholder="Nueva Contraseña" 
                        value={masterPassword}
                        onChange={(e) => setMasterPassword(e.target.value)}
                        className="h-12 rounded-xl"
                      />
                      <Input 
                        type="password" 
                        placeholder="Confirmar Contraseña" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 rounded-xl"
                      />
                      {securityError && <p className="text-xs text-destructive font-bold">{securityError}</p>}
                      <Button className="w-full h-12 gap-2 rounded-xl text-md font-bold" onClick={handleSetMasterPassword}>
                        <Lock className="w-4 h-4" />
                        Activar Protección
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border-2 border-green-500/20 bg-green-500/5 rounded-2xl flex gap-3">
                    <Shield className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-green-600">Protección Activada</p>
                      <p className="text-xs text-muted-foreground">
                        Tus datos sensibles están encriptados con tu contraseña maestra.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border-2 rounded-2xl bg-card/50">
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2 font-bold">
                        <Key className="w-4 h-4 text-primary" />
                        Encriptar API Keys
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Requiere la contraseña maestra cada vez que inicies sesión.
                      </p>
                    </div>
                    <input 
                      type="checkbox"
                      className="w-4 h-4 accent-primary"
                      checked={settings.encryptApiKeys}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => settings.setEncryptApiKeys(e.target.checked)}
                    />
                  </div>

                  {!isChangingPassword ? (
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 h-12 rounded-xl border-2 font-bold" onClick={() => setIsChangingPassword(true)}>
                        Cambiar Contraseña
                      </Button>
                      <Button variant="ghost" className="text-destructive hover:bg-destructive/10 h-12 rounded-xl font-bold" onClick={() => setIsChangingPassword(false)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 p-6 border-2 rounded-2xl bg-card">
                      <Label className="font-bold">Cambiar Contraseña Maestra</Label>
                      <div className="space-y-3">
                        <Input 
                          type="password" 
                          placeholder="Contraseña Actual" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="h-12 rounded-xl"
                        />
                        <hr className="my-2 border-border" />
                        <Input 
                          type="password" 
                          placeholder="Nueva Contraseña" 
                          value={masterPassword}
                          onChange={(e) => setMasterPassword(e.target.value)}
                          className="h-12 rounded-xl"
                        />
                        <Input 
                          type="password" 
                          placeholder="Confirmar Nueva Contraseña" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-12 rounded-xl"
                        />
                        {securityError && <p className="text-xs text-destructive font-bold">{securityError}</p>}
                        <div className="flex gap-2">
                          <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsChangingPassword(false)}>Cancelar</Button>
                          <Button className="flex-1 h-12 rounded-xl font-bold" onClick={handleChangePassword}>Actualizar</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isChangingPassword && (
                    <div className="pt-4 border-t border-border">
                      <Label className="text-destructive block mb-2 font-black uppercase tracking-tighter">Zona de Peligro</Label>
                      <div className="space-y-2 p-4 border-2 border-destructive/20 rounded-2xl bg-destructive/5">
                        <p className="text-xs text-muted-foreground font-medium">Para eliminar la protección por completo, introduce tu contraseña actual:</p>
                        <div className="flex gap-2">
                          <Input 
                            type="password" 
                            placeholder="Contraseña Actual" 
                            className="flex-1 h-11 rounded-xl"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                          <Button variant="destructive" className="h-11 rounded-xl px-6 font-bold" onClick={handleRemovePassword}>Eliminar</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* INTEGRATIONS */}
        {activeSettingsTab === 'integrations' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-3xl mx-auto pb-20">
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Sincronización Externa</h3>
              <div className="space-y-6">
                {/* GitHub */}
                <div className="p-6 border-2 rounded-2xl bg-card space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-foreground/5 rounded-full border">
                      <GitBranch className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-md font-black">GitHub Sync</p>
                      <p className="text-xs text-muted-foreground">Sincroniza tus proyectos con repositorios privados.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Personal Access Token</Label>
                      <Input 
                        type="password" 
                        placeholder="ghp_..." 
                        value={settings.githubToken || ''} 
                        onChange={(e: any) => settings.setGithubToken(e.target.value)}
                        className="h-11 rounded-xl bg-muted/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Repositorio (usuario/repo)</Label>
                      <Input 
                        placeholder="nombre/mi-obra-maestra" 
                        value={settings.githubRepo || ''} 
                        onChange={(e: any) => settings.setGithubRepo(e.target.value)}
                        className="h-11 rounded-xl bg-muted/20"
                      />
                    </div>
                    <Button className="w-full h-11 rounded-xl gap-2 text-xs font-bold border-2" variant="outline" disabled={!settings.githubToken}>
                      <Save size={14} />
                      Verificar y Sincronizar
                    </Button>
                  </div>
                </div>

                {/* Dropbox Placeholder */}
                <div className="p-6 border-2 border-dashed rounded-2xl bg-muted/10 opacity-60 grayscale flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/10 rounded-full">
                        <ExternalLink className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-md font-bold">Dropbox</p>
                        <p className="text-xs text-muted-foreground italic">Próximamente...</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADVANCED */}
        {activeSettingsTab === 'advanced' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-3xl mx-auto pb-20">
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Experiencia de Escritura</h3>
              <div className="grid grid-cols-1 gap-3">
                <ToggleItem 
                  id="typewriter" 
                  icon={Type} 
                  label="Typewriter Scroll" 
                  description="Mantiene la línea activa centrada verticalmente." 
                  checked={settings.typewriterMode} 
                  onChange={settings.setTypewriterMode} 
                />
                <ToggleItem 
                  id="hemingway" 
                  icon={Zap} 
                  label="Modo Hemingway" 
                  description="Desactiva borrar y retroceso. Solo hacia adelante." 
                  checked={settings.hemingwayMode} 
                  onChange={settings.setHemingwayMode} 
                />
                <ToggleItem 
                  id="pomodoro" 
                  icon={Maximize} 
                  label="Temporizador Pomodoro" 
                  description="Habilita un timer de 25/5 en la barra de estado." 
                  checked={settings.pomodoroEnabled} 
                  onChange={settings.setPomodoroEnabled} 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Módulos del Sistema</h3>
              <div className="grid grid-cols-1 gap-3">
                <ToggleItem 
                  id="rag-studio-toggle" 
                  icon={Layers} 
                  label="Habilitar RAG Studio" 
                  description="Muestra u oculta el módulo de entrenamiento de IA en el menú lateral." 
                  checked={settings.ragStudioEnabled} 
                  onChange={settings.setRagStudioEnabled} 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Estética y Pulido</h3>
              <div className="grid grid-cols-1 gap-3">
                <ToggleItem 
                  id="animations" 
                  icon={Palette} 
                  label="Micro-animaciones" 
                  description="Transiciones suaves entre temas y estados de UI." 
                  checked={settings.animationsEnabled} 
                  onChange={settings.setAnimationsEnabled} 
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Depuración</h3>
              <div className="flex items-center justify-between p-4 border-2 rounded-2xl bg-card/50">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 cursor-pointer font-bold" htmlFor="debug-logs">
                    <Terminal className="w-4 h-4 text-primary" />
                    Logs de IA Interactivos
                  </Label>
                  <p className="text-xs text-muted-foreground font-medium">
                    Habilita la consola técnica en la barra inferior.
                  </p>
                </div>
                <input 
                  id="debug-logs"
                  type="checkbox" 
                  className="w-4 h-4 accent-primary" 
                  checked={settings.enableLogs}
                  onChange={(e) => settings.setEnableLogs(e.target.checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* DATA */}
        {activeSettingsTab === 'data' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-3xl mx-auto pb-20">
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Gestión de Datos</h3>
              <div className="space-y-4">
                <div className="p-6 border-2 rounded-2xl bg-card space-y-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/5 rounded-full border">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-md font-black">Almacenamiento Local</p>
                      <p className="text-xs text-muted-foreground font-medium">Tus datos nunca salen de este dispositivo.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button variant="outline" className="justify-start gap-3 h-12 rounded-xl border-2 font-bold" onClick={handleExportAll}>
                      <Save className="w-4 h-4" />
                      Exportar Backup
                    </Button>
                    <Button variant="outline" className="justify-start gap-3 h-12 rounded-xl border-2 font-bold" onClick={handleImport}>
                      <Plus className="w-4 h-4" />
                      Importar Proyecto
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3 h-12 rounded-xl border-2 font-bold text-destructive hover:bg-destructive/10 hover:text-destructive sm:col-span-2" 
                      onClick={handleInitiateDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Todos los Datos de la App
                    </Button>
                  </div>
                </div>
                
                <div className="p-6 rounded-2xl bg-muted/30 border-2 border-dashed flex flex-col items-center justify-center gap-3 text-center">
                  <ExternalLink className="w-8 h-8 text-muted-foreground/30" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Próximamente</p>
                    <p className="text-xs text-muted-foreground opacity-60">Sincronización en la Nube (Google Drive, iCloud)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isView && (
        <DialogFooter className="p-4 border-t border-border bg-muted/20 shrink-0">
          <Button variant="secondary" onClick={() => closeModal()} className="rounded-xl font-bold px-8">Cerrar</Button>
        </DialogFooter>
      )}
    </div>
  );

  if (isView) {
    return (
      <>
        <SettingsContent />
        <DangerModal />
      </>
    );
  }

  // DANGER MODAL COMPONENT
  function DangerModal() {
    return (
      <Dialog open={showDangerModal} onOpenChange={setShowDangerModal}>
        <DialogContent className="sm:max-w-[450px] border-destructive/20 shadow-2xl shadow-destructive/10 bg-background/95 backdrop-blur-xl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center border-2 border-destructive/20 animate-pulse">
              <AlertOctagon className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-xl font-black text-destructive tracking-tight">
                ¿ELIMINAR ABSOLUTAMENTE TODO?
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Esta acción es <span className="font-bold text-foreground">irreversible</span>.
                Se borrarán todos los proyectos, personajes, configuraciones y claves API de este dispositivo.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="p-4 bg-muted/30 rounded-xl border-2 border-dashed text-xs text-center text-muted-foreground">
              Para confirmar, escribe <span className="font-black select-all text-foreground">ELIMINAR</span> a continuación:
            </div>
            <Input 
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Escribe ELIMINAR"
              className="text-center font-bold tracking-widest h-12 rounded-xl border-2 focus-visible:ring-destructive"
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="ghost" 
              onClick={() => setShowDangerModal(false)}
              className="rounded-xl font-bold h-11"
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleExecuteDelete}
              disabled={deleteConfirmationText !== 'ELIMINAR' || isDeleting}
              className="rounded-xl font-bold h-11 px-8 gap-2 shadow-lg shadow-destructive/20"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {isDeleting ? 'Eliminando...' : 'Sí, eliminar todo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={activeModal === 'settings'} onOpenChange={() => closeModal()}>
        <DialogContent className="sm:max-w-[800px] w-full h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border shadow-2xl rounded-3xl">
          <DialogHeader className="p-4 border-b border-border bg-card shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <span>{t('header.settings')}</span>
            </DialogTitle>
          </DialogHeader>
          <SettingsContent />
        </DialogContent>
      </Dialog>
      
      {/* Danger Modal Rendering for normal mode */}
      <DangerModal />
    </>
  );
};

const ToggleItem = ({ id, icon: Icon, label, description, checked, onChange }: { id: string, icon: any, label: string, description: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between p-4 border-2 border-border/60 rounded-2xl bg-card/50 hover:bg-card hover:border-primary/40 transition-all group">
    <div className="flex gap-3">
      <div className="p-2.5 bg-primary/10 rounded-xl h-fit group-hover:bg-primary/20 transition-colors">
        <Icon size={20} className="text-primary" />
      </div>
      <div className="space-y-0.5">
        <Label className="font-black text-sm cursor-pointer tracking-tight" htmlFor={id}>{label}</Label>
        <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{description}</p>
      </div>
    </div>
    <input 
      id={id}
      type="checkbox" 
      className="w-5 h-5 accent-primary cursor-pointer rounded-full" 
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  </div>
);