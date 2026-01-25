import { Location } from '@/types/domain';
import { ArrowLeft, Edit, Image as ImageIcon, Map, Link as LinkIcon, Plane } from 'lucide-react';
import { MediaManager } from './MediaManager';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LocationCardProps {
  location: Location;
  onBack: () => void;
}

export const LocationCard = ({ location, onBack }: LocationCardProps) => {
  const { openModal } = useUIStore();
  const { activeProject } = useProjectStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver a la lista
        </button>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => openModal('editLocation', location)}>
          <Edit className="w-3.5 h-3.5" />
          Editar
        </Button>
      </div>

      <div className="flex justify-between items-start bg-card/50 p-6 rounded-xl border border-border/50">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{location.name}</h2>
          <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20 mt-2">
            {location.type || 'Ubicación'}
          </span>
        </div>
        <MediaManager imageUrl={location.imageUrl} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Descripción</label>
          <div className="bg-card p-4 rounded-xl border shadow-sm text-sm leading-relaxed whitespace-pre-wrap min-h-[150px]">
            {location.description || 'Sin descripción.'}
          </div>
        </div>
         <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Significancia</label>
          <div className="bg-card p-4 rounded-xl border shadow-sm text-sm leading-relaxed italic whitespace-pre-wrap min-h-[150px]">
            {location.significance || 'Sin detalles sobre su importancia.'}
          </div>
        </div>
      </div>

      {location.notes && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Notas adicionales</label>
          <div className="bg-muted/30 p-4 rounded-xl border border-dashed text-xs whitespace-pre-wrap">
            {location.notes}
          </div>
        </div>
      )}

      {/* Gallery & Plans Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ImageIcon size={16} /> Galería ({location.gallery?.length || 0})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {location.gallery?.map(img => (
              <div key={img.id} className="aspect-video rounded-lg overflow-hidden border bg-muted group relative">
                <img src={img.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-[10px] text-white font-bold truncate">{img.title}</span>
                </div>
              </div>
            ))}
            {(!location.gallery || location.gallery.length === 0) && (
              <div className="col-span-2 py-8 text-center border-2 border-dashed rounded-xl opacity-20 text-xs italic">Sin imágenes</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Map size={16} /> Planos y Mapas ({location.plans?.length || 0})
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {location.plans?.map(img => (
              <div key={img.id} className="aspect-square rounded-lg overflow-hidden border bg-muted group relative">
                <img src={img.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-[10px] text-white font-bold truncate">{img.title}</span>
                </div>
              </div>
            ))}
            {(!location.plans || location.plans.length === 0) && (
              <div className="col-span-2 py-8 text-center border-2 border-dashed rounded-xl opacity-20 text-xs italic">Sin planos</div>
            )}
          </div>
        </div>
      </div>

      {/* Connections Section */}
      <div className="space-y-4 pt-4 border-t pb-12">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <LinkIcon size={16} /> Rutas y Conexiones ({location.connections?.length || 0})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {location.connections?.map(conn => {
            const target = activeProject?.locations.find((l: Location) => l.id === conn.targetLocationId);
            return (
              <div key={conn.id} className="p-3 bg-card border rounded-xl flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{target?.name || 'Lugar desconocido'}</span>
                  <Badge variant="secondary" className="text-[9px]">{conn.distance}</Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Plane size={10} />
                  <span>Método: {conn.travelType}</span>
                </div>
              </div>
            );
          })}
          {(!location.connections || location.connections.length === 0) && (
            <div className="col-span-full py-8 text-center border-2 border-dashed rounded-xl opacity-20 text-xs italic">No hay rutas definidas</div>
          )}
        </div>
      </div>
    </div>
  );
};
