import { LoreItem } from '@/types/domain';
import { ArrowLeft, Edit } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { Button } from '@/components/ui/button';

interface LoreCardProps {
  loreItem: LoreItem;
  onBack: () => void;
}

export const LoreCard = ({ loreItem, onBack }: LoreCardProps) => {
  const { openModal } = useUIStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Volver a la lista
        </button>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => openModal('loreItem', loreItem)}>
          <Edit className="w-3.5 h-3.5" />
          Editar
        </Button>
      </div>

      <div className="bg-card/50 p-6 rounded-xl border border-border/50">
        <h2 className="text-3xl font-bold tracking-tight">{loreItem.title || loreItem.name}</h2>
        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20 mt-2">
          {loreItem.category}
        </span>
        {loreItem.summary && (
          <p className="mt-4 text-muted-foreground italic">
            {loreItem.summary}
          </p>
        )}
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none bg-card p-8 rounded-xl border shadow-sm">
        <div className="whitespace-pre-wrap leading-relaxed font-serif text-lg">
          {loreItem.content || 'Sin contenido detallado.'}
        </div>
      </div>
    </div>
  );
};
