import { useState } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { Character, VitalStatusEntry } from '@/types/domain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Heart, 
  Plus, 
  History
} from 'lucide-react';

interface VitalStatusManagerProps {
  character: Character;
}

export const VITAL_STATUSES: Record<string, { label: string; color: string; group: string }> = {
  alive: { label: 'Vivo', color: '#10b981', group: 'Activo' },
  healthy: { label: 'Sano', color: '#059669', group: 'Activo' },
  injured: { label: 'Herido', color: '#f59e0b', group: 'Activo' },
  sick: { label: 'Enfermo', color: '#d97706', group: 'Activo' },
  imprisoned: { label: 'Prisionero', color: '#4b5563', group: 'Activo' },
  dead: { label: 'Muerto', color: '#ef4444', group: 'Muerte' },
  killed: { label: 'Asesinado', color: '#b91c1c', group: 'Muerte' },
  missing: { label: 'Desaparecido', color: '#8b5cf6', group: 'Desaparición' },
  unknown: { label: 'Desconocido', color: '#6b7280', group: 'Misterio' },
};

export const VitalStatusManager = ({ character }: VitalStatusManagerProps) => {
  const { updateCharacterVitalStatus } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newStatus, setNewStatus] = useState('alive');
  const [description, setDescription] = useState('');

  const handleUpdate = () => {
    updateCharacterVitalStatus(character.id, newStatus, description);
    setIsAdding(false);
    setDescription('');
  };

  const currentStatusInfo = VITAL_STATUSES[character.currentVitalStatus] || VITAL_STATUSES.unknown;

  return (
    <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
        <h3 className="font-semibold flex items-center gap-2 text-sm">
          <Heart className="w-4 h-4 text-primary" />
          Estado Vital
        </h3>
        <div 
          className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
          style={{ 
            backgroundColor: `${currentStatusInfo.color}15`, 
            color: currentStatusInfo.color,
            borderColor: `${currentStatusInfo.color}30`
          }}
        >
          {currentStatusInfo.label}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {!isAdding ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2 text-xs h-8" 
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-3 h-3" />
            Cambiar Estado
          </Button>
        ) : (
          <div className="space-y-3 p-3 border rounded-lg bg-accent/5 animate-in slide-in-from-top-2">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-muted-foreground">Nuevo Estado</Label>
              <select 
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 text-sm bg-background border rounded-md outline-none focus:ring-1 focus:ring-primary"
              >
                {Object.entries(VITAL_STATUSES).map(([id, info]) => (
                  <option key={id} value={id}>{info.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-muted-foreground">¿Qué sucedió?</Label>
              <Input 
                placeholder="Ej: Herido en la batalla de..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm h-8"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 text-xs h-8" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
              <Button size="sm" className="flex-1 text-xs h-8" onClick={handleUpdate}>
                Guardar
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <History className="w-3 h-3" />
            Historial
          </h4>
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {(character.vitalStatusHistory || []).slice().reverse().map((entry: VitalStatusEntry) => {
              const info = VITAL_STATUSES[entry.status] || VITAL_STATUSES.unknown;
              return (
                <div key={entry.id} className="relative pl-4 border-l-2 py-1" style={{ borderColor: `${info.color}40` }}>
                  <div 
                    className="absolute -left-[5px] top-2 w-2 h-2 rounded-full" 
                    style={{ backgroundColor: info.color }}
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold" style={{ color: info.color }}>{info.label}</span>
                      <span className="text-[9px] text-muted-foreground">{new Date(entry.timestamp).toLocaleDateString()}</span>
                    </div>
                    {entry.description && (
                      <p className="text-xs text-muted-foreground leading-tight italic">
                        "{entry.description}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
