import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { 
  Search, 
  Book, 
  User, 
  MapPin, 
  Zap, 
  Command, 
  ArrowRight,
  Maximize,
  FileDown,
  Sparkles
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent 
} from '@/components/ui/dialog';

export const CommandPalette = () => {
  const { t } = useTranslation();
  const { isCommandPaletteOpen, setCommandPaletteOpen, setActiveView, setActiveLoreTab, setCurrentEditingChapterId, openModal, toggleEditorZenMode } = useUIStore();
  const { activeProject } = useProjectStore();
  const [query, setInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Unified items list
  const items = useMemo(() => {
    if (!activeProject) return [];
    
    const all = [
      // Actions
      { id: 'act-ai', title: t('common.askAI', { query }), category: t('common.ai'), icon: Sparkles, action: () => {
         if (!query) return;
         setActiveView('aiAssistant');
         // We might want to pass the query to the AI store here
      } },
      { id: 'act-zen', title: 'Activar Modo Zen', category: 'Acciones', icon: Maximize, action: () => toggleEditorZenMode() },
      { id: 'act-new-chap', title: 'Nuevo Capítulo', category: 'Acciones', icon: Zap, action: () => openModal('newChapter') },
      { id: 'act-export', title: 'Exportar Proyecto (PDF)', category: 'Acciones', icon: FileDown, action: () => setActiveView('publishing') },
      
      // Chapters
      ...activeProject.chapters.map(c => ({
        id: `chap-${c.id}`,
        title: c.title,
        category: 'Capítulos',
        icon: Book,
        action: () => {
          setCurrentEditingChapterId(c.id);
          setActiveView('editor');
        }
      })),

      // Characters
      ...activeProject.characters.map(c => ({
        id: `char-${c.id}`,
        title: c.name,
        category: 'Personajes',
        icon: User,
        action: () => {
          setActiveLoreTab('characters');
          setActiveView('lore');
          // Note: Ideally jump to specific character card
        }
      })),

      // Locations
      ...activeProject.locations.map(l => ({
        id: `loc-${l.id}`,
        title: l.name,
        category: 'Ubicaciones',
        icon: MapPin,
        action: () => {
          setActiveLoreTab('locations');
          setActiveView('lore');
        }
      })),
    ];

    if (!query) return all;
    return all.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
  }, [activeProject, query, toggleEditorZenMode, openModal, setActiveView, setCurrentEditingChapterId, setActiveLoreTab]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCommandPaletteOpen) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          setCommandPaletteOpen(true);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].action();
          setCommandPaletteOpen(false);
          setInput('');
        }
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, items, selectedIndex, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <Dialog open={isCommandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none bg-transparent shadow-none top-[20%] translate-y-0">
        <div className="bg-card/80 backdrop-blur-2xl border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center px-4 border-b border-border/50 h-14">
            <Command className="w-5 h-5 text-primary mr-3" />
            <input 
              autoFocus
              placeholder="Buscar capítulos, personajes, acciones..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
              value={query}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex items-center gap-1 ml-2">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-medium text-muted-foreground">ESC</kbd>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
            {items.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <Search className="w-8 h-8 mx-auto opacity-20" />
                <p className="text-xs">{t('common.noResultsForQuery')} "{query}"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(
                  items.reduce((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {} as Record<string, typeof items>)
                ).map(([category, catItems]) => (
                  <div key={category}>
                    <h4 className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">{category}</h4>
                    <div className="space-y-1">
                      {catItems.map((item) => {
                        const globalIndex = items.indexOf(item);
                        const isSelected = globalIndex === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              item.action();
                              setCommandPaletteOpen(false);
                              setInput('');
                            }}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                              ${isSelected ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-1' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                            `}
                          >
                            <item.icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-primary'}`} />
                            <span className="flex-1 text-left font-medium">{item.title}</span>
                            {isSelected && <ArrowRight className="w-3.5 h-3.5 animate-in slide-in-from-left-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border/50 bg-muted/30 flex justify-between items-center px-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1 py-0.5 rounded border border-border bg-background text-[9px] font-bold">↑↓</kbd>
                <span className="text-[10px] text-muted-foreground">Navegar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="px-1 py-0.5 rounded border border-border bg-background text-[9px] font-bold">ENTER</kbd>
                <span className="text-[10px] text-muted-foreground">Seleccionar</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-primary/50 tracking-tighter">PLUMA AI OMNI-SEARCH</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
