import { useState, useEffect } from 'react';
import { useSettingsStore, AIProvider, TokenOptimizationLevel, AppTheme, AppLanguage } from '@/stores/useSettingsStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { useTranslation } from 'react-i18next';
import { CryptoService } from '@/lib/crypto';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Brain, 
  Image as ImageIcon, 
  Zap, 
  Terminal, 
  Database, 
  Save, 
  Trash2, 
  Shield, 
  Info,
  Star,
  Plus,
  Type,
  ExternalLink,
  Lock,
  Key,
  AlertTriangle,
  GitBranch,
  Dices
} from 'lucide-react';

export const SettingsModal = () => {
  const { i18n, t } = useTranslation();
  const { activeModal, closeModal } = useUIStore();
  const settings = useSettingsStore();
  const { activeProject, setActiveProject, addApiKey, deleteApiKey, setDefaultApiKey } = useProjectStore();
  
  const [activeTab, setActiveTab] = useState<'general' | 'ai-text' | 'ai-image' | 'optimization' | 'advanced' | 'security' | 'data' | 'integrations' | 'brain'>('general');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  // Security state
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (activeModal === 'settings') {
      setSecurityError('');
      setMasterPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setIsChangingPassword(false);
    }
  }, [activeModal]);

  if (activeModal !== 'settings') return null;

  const handleSetMasterPassword = async () => {
    if (masterPassword.length < 4) {
      setSecurityError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (masterPassword !== confirmPassword) {
      setSecurityError('Las contraseñas no coinciden');
      return;
    }

    const hash = await CryptoService.hashPassword(masterPassword);
    settings.setMasterPassword(hash);
    setMasterPassword('');
    setConfirmPassword('');
    setSecurityError('');
    alert('Contraseña maestra configurada correctamente');
  };

  const handleChangePassword = async () => {
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
  };

  const handleRemovePassword = async () => {
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
    { id: 'googleImagen', name: 'Google Imagen' },
    { id: 'dalle', name: 'DALL-E' },
    { id: 'stabilityai', name: 'Stable Diffusion' },
    { id: 'replicate', name: 'Replicate' },
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

  const handleDeleteAll = () => {
    if (confirm('¿ESTÁS SEGURO? Esta acción eliminará permanentemente todos los datos de este proyecto.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 4)}••••${key.slice(-4)}`;
  };

  return (
    <Dialog open={activeModal === 'settings'} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-[600px] w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border">
        <DialogHeader className="p-6 border-b bg-card shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>{t('header.settings')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-muted/30 border-r flex flex-col p-2 shrink-0 overflow-y-auto">
            <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Settings} label="General" />
            <TabButton active={activeTab === 'ai-text'} onClick={() => setActiveTab('ai-text')} icon={Type} label="IA Texto" />
            <TabButton active={activeTab === 'ai-image'} onClick={() => setActiveTab('ai-image')} icon={ImageIcon} label="IA Imágenes" />
            <TabButton active={activeTab === 'optimization'} onClick={() => setActiveTab('optimization')} icon={Zap} label="Optimización" />
            <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={Shield} label="Seguridad" />
            <TabButton active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} icon={GitBranch} label="Integraciones" />
            <TabButton active={activeTab === 'advanced'} onClick={() => setActiveTab('advanced')} icon={Terminal} label="Avanzado" />
            <TabButton active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={Database} label="Datos" />
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            
            {/* GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div>
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Apariencia y Lenguaje</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tema de la aplicación</Label>
                      <Select value={settings.theme} onValueChange={(v: AppTheme) => settings.setTheme(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dark">Oscuro (VSCode)</SelectItem>
                          <SelectItem value="dracula">Dracula</SelectItem>
                          <SelectItem value="light">Claro Pastel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Idioma</Label>
                      <Select value={settings.language} onValueChange={(v: AppLanguage) => handleLanguageChange(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">🇪🇸 Español</SelectItem>
                          <SelectItem value="en">🇬🇧 English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* RPG Mode Toggle */}
                  <div className="pt-4 border-t border-border mt-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Dices className="w-4 h-4 text-primary" />
                      {t('ai.settings.worldbuilder.title')}
                    </h4>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                      <div className="space-y-1">
                         <Label className="cursor-pointer" htmlFor="worldbuilder-mode-toggle">{t('ai.settings.worldbuilder.enable')}</Label>
                         <p className="text-xs text-muted-foreground">
                           {t('ai.settings.worldbuilder.description')}
                         </p>
                      </div>
                      <input 
                        id="worldbuilder-mode-toggle"
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

            {/* AI TEXT */}
            {activeTab === 'ai-text' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div>
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Configuración de Texto</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Proveedor Principal</Label>
                      <Select value={settings.activeProvider} onValueChange={(v: AIProvider) => settings.setActiveProvider(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} ({p.freeTier})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Key Management */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <Label>API Keys para {providers.find(p => p.id === settings.activeProvider)?.name}</Label>
                        <Badge variant="outline">{activeProject?.apiKeys?.text[settings.activeProvider]?.length || 0} guardadas</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Nombre (ej: Principal)" 
                            className="w-1/3" 
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                          />
                          <Input 
                            placeholder="sk-..." 
                            type="password" 
                            className="flex-1"
                            value={newKeyValue}
                            onChange={(e) => setNewKeyValue(e.target.value)}
                          />
                          <Button size="icon" onClick={() => handleAddKey('text', settings.activeProvider)}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 border rounded-md divide-y overflow-hidden">
                        {(activeProject?.apiKeys?.text[settings.activeProvider] || []).map((keyEntry) => (
                          <div key={keyEntry.id} className="p-3 flex items-center justify-between bg-card/50">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                {keyEntry.isDefault && <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />}
                                <span className="text-sm font-medium">{keyEntry.name}</span>
                              </div>
                              <code className="text-[10px] text-muted-foreground">{maskKey(keyEntry.key)}</code>
                            </div>
                            <div className="flex items-center gap-1">
                              {!keyEntry.isDefault && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDefaultApiKey('text', settings.activeProvider, keyEntry.id)}>
                                  <Star className="w-4 h-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteApiKey('text', settings.activeProvider, keyEntry.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {(activeProject?.apiKeys?.text[settings.activeProvider] || []).length === 0 && (
                          <div className="p-8 text-center text-muted-foreground text-sm">
                            No hay llaves configuradas para este proveedor.
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Groq Model Routing */}
                    {settings.activeProvider === 'groq' && (
                      <div className="pt-4 border-t border-border mt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-3">
                           <div className="p-1 rounded-md bg-orange-500/10 text-orange-500">
                              <Zap className="w-4 h-4" />
                           </div>
                           <h4 className="text-sm font-semibold">Enrutamiento de Modelos (Groq)</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                          Asigna modelos especializados para cada tipo de tarea. Esto optimiza velocidad y calidad.
                        </p>
                        
                        <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-card/50">
                          <div className="space-y-2">
                             <Label className="text-xs uppercase font-bold text-muted-foreground">Narrativa (Creativo)</Label>
                             <Select 
                               value={settings.groqModelMap?.creative || 'llama-3.3-70b-versatile'} 
                               onValueChange={(v: string) => settings.setGroqModelMap({
                                 creative: v, 
                                 logical: settings.groqModelMap?.logical || 'mixtral-8x7b-32768', 
                                 fast: settings.groqModelMap?.fast || 'llama-3.1-8b-instant'
                               })}
                             >
                               <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B (Versatile)</SelectItem>
                                 <SelectItem value="llama-3.1-70b-versatile">Llama 3.1 70B (Versatile)</SelectItem>
                                 <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                               </SelectContent>
                             </Select>
                          </div>

                          <div className="space-y-2">
                             <Label className="text-xs uppercase font-bold text-muted-foreground">Lógica y Reglas (Razonamiento)</Label>
                             <Select 
                               value={settings.groqModelMap?.logical || 'mixtral-8x7b-32768'} 
                               onValueChange={(v: string) => settings.setGroqModelMap({
                                 logical: v, 
                                 creative: settings.groqModelMap?.creative || 'llama-3.3-70b-versatile', 
                                 fast: settings.groqModelMap?.fast || 'llama-3.1-8b-instant'
                               })}
                             >
                               <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B (Recomendado)</SelectItem>
                                 <SelectItem value="llama-3.3-70b-versatile">Llama 3.3 70B</SelectItem>
                                 <SelectItem value="llama3-70b-8192">Llama 3 70B</SelectItem>
                               </SelectContent>
                             </Select>
                          </div>

                          <div className="space-y-2">
                             <Label className="text-xs uppercase font-bold text-muted-foreground">Chat Rápido / NPCs (Velocidad)</Label>
                             <Select 
                               value={settings.groqModelMap?.fast || 'llama-3.1-8b-instant'} 
                               onValueChange={(v: string) => settings.setGroqModelMap({
                                 fast: v, 
                                 creative: settings.groqModelMap?.creative || 'llama-3.3-70b-versatile', 
                                 logical: settings.groqModelMap?.logical || 'mixtral-8x7b-32768'
                               })}
                             >
                               <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="llama-3.1-8b-instant">Llama 3.1 8B Instant (Ultra Rápido)</SelectItem>
                                 <SelectItem value="gemma2-9b-it">Gemma 2 9B</SelectItem>
                                 <SelectItem value="llama3-8b-8192">Llama 3 8B</SelectItem>
                               </SelectContent>
                             </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AI IMAGE */}
            {activeTab === 'ai-image' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div>
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Generación de Imágenes</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Proveedor de Imagen</Label>
                      <Select defaultValue="googleImagen">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imageProviders.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="p-4 border border-dashed rounded-lg bg-muted/20 text-center">
                      <p className="text-sm text-muted-foreground">La gestión de llaves de imagen estará disponible próximamente.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OPTIMIZATION */}
            {activeTab === 'optimization' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div>
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Eficiencia de Contexto</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Nivel de Optimización de Tokens</Label>
                      <Select value={settings.tokenOptimizationLevel} onValueChange={(v: TokenOptimizationLevel) => settings.setTokenLevel(v)}>
                        <SelectTrigger>
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

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/10">
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2 cursor-pointer" htmlFor="agentic-mode">
                          <Brain className="w-4 h-4 text-primary" />
                          Sistema de IA Agéntica
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          La IA analiza tu tarea y decide qué contexto necesita.
                        </p>
                      </div>
                      <input 
                        id="agentic-mode"
                        type="checkbox" 
                        className="w-4 h-4 accent-primary" 
                        checked={settings.useAgenticContext}
                        onChange={(e) => settings.setAgenticContext(e.target.checked)}
                      />
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Info className="w-4 h-4" />
                        <span>¿Cómo funciona?</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        El sistema analiza personajes y lore mencionados para incluir solo lo relevante, 
                        ahorrando tokens sin perder calidad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div>
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Privacidad y Protección</h3>
                  
                  {!settings.masterPasswordHash ? (
                    <div className="space-y-4">
                      <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Sin Contraseña Maestra</p>
                          <p className="text-xs text-muted-foreground">
                            Tus API Keys se guardan en texto plano en el navegador. Cualquiera con acceso físico a este equipo podría verlas.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 p-4 border rounded-lg bg-card">
                        <Label>Configurar Contraseña Maestra</Label>
                        <div className="space-y-2">
                          <Input 
                            type="password" 
                            placeholder="Nueva Contraseña" 
                            value={masterPassword}
                            onChange={(e) => setMasterPassword(e.target.value)}
                          />
                          <Input 
                            type="password" 
                            placeholder="Confirmar Contraseña" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          {securityError && <p className="text-xs text-destructive">{securityError}</p>}
                          <Button className="w-full gap-2" onClick={handleSetMasterPassword}>
                            <Lock className="w-4 h-4" />
                            Activar Protección
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-lg flex gap-3">
                        <Shield className="w-5 h-5 text-green-500 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Protección Activada</p>
                          <p className="text-xs text-muted-foreground">
                            La contraseña maestra permite encriptar tus datos sensibles.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            Encriptar API Keys
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Requiere la contraseña maestra al iniciar sesión.
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
                          <Button variant="outline" className="flex-1" onClick={() => setIsChangingPassword(true)}>
                            Cambiar Contraseña
                          </Button>
                          <Button variant="ghost" className="text-destructive" onClick={() => setIsChangingPassword(false)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3 p-4 border rounded-lg bg-card">
                          <Label>Cambiar Contraseña Maestra</Label>
                          <div className="space-y-2">
                            <Input 
                              type="password" 
                              placeholder="Contraseña Actual" 
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <hr className="my-2" />
                            <Input 
                              type="password" 
                              placeholder="Nueva Contraseña" 
                              value={masterPassword}
                              onChange={(e) => setMasterPassword(e.target.value)}
                            />
                            <Input 
                              type="password" 
                              placeholder="Confirmar Nueva Contraseña" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {securityError && <p className="text-xs text-destructive">{securityError}</p>}
                            <div className="flex gap-2">
                              <Button variant="ghost" className="flex-1" onClick={() => setIsChangingPassword(false)}>Cancelar</Button>
                              <Button className="flex-1" onClick={handleChangePassword}>Actualizar</Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {!isChangingPassword && (
                        <div className="pt-4 border-t">
                          <Label className="text-destructive block mb-2">Zona de Peligro</Label>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Para eliminar la contraseña maestra, introduce la actual:</p>
                            <div className="flex gap-2">
                              <Input 
                                type="password" 
                                placeholder="Contraseña Actual" 
                                className="flex-1"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                              />
                              <Button variant="destructive" onClick={handleRemovePassword}>Eliminar</Button>
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
            {activeTab === 'integrations' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div>
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Sincronización Externa</h3>
                  <div className="space-y-6">
                    {/* GitHub */}
                    <div className="p-4 border rounded-xl bg-card space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-foreground/10 rounded-full">
                          <GitBranch className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">GitHub</p>
                          <p className="text-xs text-muted-foreground">Sincroniza tu archivo .pluma con un repositorio privado.</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Personal Access Token</Label>
                          <Input 
                            type="password" 
                            placeholder="ghp_..." 
                            value={settings.githubToken || ''} 
                            onChange={(e: any) => settings.setGithubToken(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Repositorio (usuario/repo)</Label>
                          <Input 
                            placeholder="nick/mi-novela" 
                            value={settings.githubRepo || ''} 
                            onChange={(e: any) => settings.setGithubRepo(e.target.value)}
                          />
                        </div>
                        <Button className="w-full h-9 rounded-lg gap-2 text-xs" variant="outline" disabled={!settings.githubToken}>
                          <Save size={14} />
                          Probar Conexión y Push
                        </Button>
                      </div>
                    </div>

                    {/* Dropbox Placeholder */}
                    <div className="p-4 border rounded-xl bg-card/50 opacity-60 grayscale space-y-4 cursor-not-allowed">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-full">
                            <ExternalLink className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Dropbox</p>
                            <p className="text-xs text-muted-foreground">Próximamente: Sincronización automática con Dropbox.</p>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ADVANCED */}
            {activeTab === 'advanced' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div>
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Depuración</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label className="flex items-center gap-2 cursor-pointer" htmlFor="debug-logs">
                          <Terminal className="w-4 h-4" />
                          Logs de IA en Consola
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Ver información técnica de peticiones en F12.
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
              </div>
            )}

            {/* DATA */}
            {activeTab === 'data' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div>
                  <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Gestión de Datos</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-card space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Almacenamiento Local</p>
                          <p className="text-xs text-muted-foreground">Tus datos nunca salen de este navegador.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 pt-2">
                        <Button variant="outline" className="justify-start gap-2 h-10" onClick={handleExportAll}>
                          <Save className="w-4 h-4" />
                          Exportar Backup (.pluma / .json)
                        </Button>
                        <Button variant="outline" className="justify-start gap-2 h-10" onClick={handleImport}>
                          <Plus className="w-4 h-4" />
                          Importar Proyecto
                        </Button>
                        <Button variant="outline" className="justify-start gap-2 h-10 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDeleteAll}>
                          <Trash2 className="w-4 h-4" />
                          Eliminar Todos los Datos
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/30 border border-dashed flex flex-col items-center justify-center gap-2 text-center">
                      <ExternalLink className="w-8 h-8 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground">Próximamente: Sincronización en la Nube</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/20 shrink-0">
          <Button variant="secondary" onClick={() => closeModal()}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all
      ${active 
        ? 'bg-primary text-primary-foreground shadow-sm font-medium' 
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }
    `}
  >
    <Icon className={`w-4 h-4 ${active ? '' : 'text-muted-foreground'}`} />
    <span>{label}</span>
  </button>
);
