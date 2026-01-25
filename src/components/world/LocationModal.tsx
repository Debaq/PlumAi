import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { Location, LocationImage, LocationConnection } from '@/types/domain';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Trash2, 
  Map, 
  Info, 
  Image as ImageIcon, 
  Plus, 
  Link as LinkIcon, 
  ArrowRight,
  Plane
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AITextArea } from '@/components/ui/ai-textarea';

export const LocationModal = () => {
  const { t } = useTranslation();
  const { activeModal, modalData, closeModal } = useUIStore();
  const { 
    activeProject,
    addLocation, 
    updateLocation, 
    deleteLocation,
    addLocationImage,
    removeLocationImage,
    addLocationConnection,
    removeLocationConnection
  } = useProjectStore();

  const isEditing = activeModal === 'editLocation' && modalData?.id;
  
  const [activeTab, setActiveTab] = useState<'info' | 'gallery' | 'plans' | 'connections'>('info');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [significance, setSignificance] = useState('');
  const [notes, setNotes] = useState('');

  // Local state for adding connections
  const [connTargetId, setConnTargetId] = useState('');
  const [connDistance, setConnDistance] = useState('');
  const [connTravel, setConnTravel] = useState('walking');

  useEffect(() => {
    if (activeModal === 'editLocation') {
      if (modalData) {
        setName(modalData.name || '');
        setType(modalData.type || '');
        setDescription(modalData.description || '');
        setSignificance(modalData.significance || '');
        setNotes(modalData.notes || '');
      } else {
        setName('');
        setType('');
        setDescription('');
        setSignificance('');
        setNotes('');
      }
      setActiveTab('info');
    }
  }, [activeModal, modalData]);

  if (activeModal !== 'editLocation') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: Omit<Location, 'id'> = {
      name: name.trim(),
      type: type.trim(),
      description: description.trim(),
      significance: significance.trim(),
      notes: notes.trim(),
      imageUrl: modalData?.imageUrl,
      gallery: modalData?.gallery || [],
      plans: modalData?.plans || [],
      connections: modalData?.connections || []
    };

    if (isEditing && modalData?.id) {
      updateLocation(modalData.id, data);
    } else {
      addLocation(data);
    }
    
    closeModal();
  };

  const handleAddImage = (type: 'gallery' | 'plans') => {
    if (!modalData?.id) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file && modalData?.id) {
        const reader = new FileReader();
        reader.onload = (re) => {
          addLocationImage(modalData.id, type, {
            url: re.target?.result as string,
            title: file.name
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAddConnection = () => {
    if (!connTargetId || !modalData?.id) return;
    addLocationConnection(modalData.id, {
      targetLocationId: connTargetId,
      distance: connDistance || 'N/A',
      travelType: connTravel
    });
    setConnTargetId('');
    setConnDistance('');
  };

  const handleDelete = () => {
    if (isEditing && confirm(`¿Estás seguro de que quieres eliminar "${name}"?`)) {
      deleteLocation(modalData.id);
      closeModal();
    }
  };

  return (
    <Dialog open={activeModal === 'editLocation'} onOpenChange={() => closeModal()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? <MapPin className="w-5 h-5 text-primary" /> : <Map className="w-5 h-5 text-primary" />}
            {isEditing ? `Editar ${name}` : 'Nueva Ubicación'}
          </DialogTitle>
        </DialogHeader>

        {isEditing && (
          <div className="flex bg-muted/50 p-1 mx-6 mt-4 rounded-lg shrink-0">
            {(['info', 'gallery', 'plans', 'connections'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 text-[10px] uppercase font-black py-2 rounded-md transition-all ${
                  activeTab === tab ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'info' ? 'Información' : tab === 'gallery' ? 'Galería' : tab === 'plans' ? 'Planos' : 'Conexiones'}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loc-name">Nombre</Label>
                  <Input 
                    id="loc-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Nombre del lugar..."
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="loc-type">Tipo</Label>
                  <Input 
                    id="loc-type" 
                    value={type} 
                    onChange={(e) => setType(e.target.value)} 
                    placeholder="Ej: Ciudad, Bosque, Castillo..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loc-description">Descripción</Label>
                <AITextArea 
                  id="loc-description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe cómo se ve y se siente este lugar..."
                  className="min-h-[100px]"
                  label="Location Description"
                  context={`Location Name: ${name}. Type: ${type}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loc-significance" className="flex items-center gap-2">
                  <Info className="w-3 h-3 text-primary" />
                  Significancia / Importancia
                </Label>
                <AITextArea 
                  id="loc-significance" 
                  value={significance} 
                  onChange={(e) => setSignificance(e.target.value)} 
                  placeholder="¿Por qué es importante este lugar en tu historia?..."
                  className="min-h-[80px]"
                  label="Significance"
                  context={`Location Name: ${name}. Type: ${type}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loc-notes">Notas adicionales</Label>
                <AITextArea 
                  id="loc-notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Secretos, clima, población, detalles menores..."
                  className="min-h-[80px] bg-muted/20"
                  label="Private Notes"
                  context={`Location Name: ${name}. Type: ${type}`}
                />
              </div>
            </form>
          )}

          {(activeTab === 'gallery' || activeTab === 'plans') && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  {activeTab === 'gallery' ? 'Galería de Imágenes' : 'Planos y Mapas'}
                </h3>
                <Button size="sm" className="h-8 gap-2" onClick={() => handleAddImage(activeTab)}>
                  <Plus className="w-3 h-3" /> Añadir
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(modalData?.[activeTab] || []).map((img: LocationImage) => (
                  <div key={img.id} className="group relative aspect-video rounded-xl overflow-hidden border bg-muted shadow-sm">
                    <img src={img.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                      <p className="text-[10px] font-bold text-white mb-2 truncate w-full px-2">{img.title}</p>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => removeLocationImage(modalData.id, activeTab, img.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(modalData?.[activeTab] || []).length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed rounded-2xl opacity-30">
                    <p className="text-xs italic">No hay archivos cargados.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="space-y-6">
              <div className="space-y-4 p-4 border rounded-xl bg-accent/5">
                <h4 className="text-xs font-bold uppercase text-primary tracking-widest">Añadir Conexión</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Destino</Label>
                    <Select value={connTargetId} onValueChange={setConnTargetId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Seleccionar lugar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activeProject?.locations
                          .filter(l => l.id !== modalData.id)
                          .map(l => (
                            <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Distancia / Tiempo</Label>
                    <Input 
                      placeholder="Ej: 50km, 2 días..." 
                      className="h-9 text-sm"
                      value={connDistance}
                      onChange={(e) => setConnDistance(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2 items-end justify-between">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Método de Viaje</Label>
                    <Input 
                      placeholder="Ej: A pie, Barco, Portal..." 
                      className="h-9 text-sm"
                      value={connTravel}
                      onChange={(e) => setConnTravel(e.target.value)}
                    />
                  </div>
                  <Button size="sm" className="h-9 px-6" onClick={handleAddConnection} disabled={!connTargetId}>
                    Añadir Conexión
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <LinkIcon className="w-3 h-3" />
                  Rutas Existentes
                </h4>
                <div className="space-y-2">
                  {(modalData?.connections || []).map((conn: LocationConnection) => {
                    const target = activeProject?.locations.find(l => l.id === conn.targetLocationId);
                    return (
                      <div key={conn.id} className="flex items-center justify-between p-3 bg-card border rounded-xl group shadow-sm">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2 font-bold text-sm">
                            <span>{name}</span>
                            <ArrowRight size={14} className="text-primary/40" />
                            <span>{target?.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="secondary" className="text-[9px] h-5">{conn.distance}</Badge>
                            <Badge variant="outline" className="text-[9px] h-5 flex gap-1 items-center">
                              <Plane size={8} /> {conn.travelType}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeLocationConnection(modalData.id, conn.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {(modalData?.connections || []).length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed rounded-xl opacity-30">
                      <p className="text-xs italic">No hay conexiones definidas.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-muted/30 flex justify-between items-center sm:justify-between">
          <div>
            {isEditing && (
              <Button type="button" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-2" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => closeModal()}>
              {t('common.cancel')}
            </Button>
            {activeTab === 'info' ? (
              <Button type="submit" onClick={handleSubmit} disabled={!name.trim()}>
                {isEditing ? 'Guardar Cambios' : 'Crear Ubicación'}
              </Button>
            ) : (
              <Button type="button" onClick={() => closeModal()}>
                Listo
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};