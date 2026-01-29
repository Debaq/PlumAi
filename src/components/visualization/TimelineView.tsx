import { useState } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, User, MapPin, Tag, GitGraph, Rows } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const TimelineView = () => {
  const { t } = useTranslation();
  const { activeProject } = useProjectStore();
  const { openModal } = useUIStore();
  const [viewMode, setViewMode] = useState<'list' | 'parallel'>('list');

  if (!activeProject) return <div>{t('project.noProjectLoaded')}.</div>;

  const events = activeProject.timelineEvents || [];

  // Sort globally
  const sortedEvents = [...events].sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return dateA.localeCompare(dateB);
  });

  const getParticipantNames = (ids: string[]) => {
    return ids.map(id => activeProject.characters.find(c => c.id === id)?.name || id).join(', ');
  };

  const getLocationName = (id?: string) => {
    if (!id || id === 'none') return null;
    return activeProject.locations.find(l => l.id === id)?.name || id;
  };

  const getSceneImage = (sceneId?: string) => {
    if (!sceneId) return null;
    const scene = activeProject.scenes.find(s => s.id === sceneId);
    return scene?.image;
  };

  const renderParallelView = () => {
    // 1. Get characters involved in at least one event
    const involvedCharacterIds = new Set<string>();
    sortedEvents.forEach(e => e.participants?.forEach(p => involvedCharacterIds.add(p)));
    
    const characters = activeProject.characters.filter(c => involvedCharacterIds.has(c.id));
    if (characters.length === 0 && sortedEvents.length > 0) {
        return <div className="p-8 text-center text-muted-foreground">{t('timeline.noAssignedCharacters')}</div>;
    }

    // 2. Map global index to each event for alignment
    const eventIndexMap = new Map(sortedEvents.map((e, i) => [e.id, i]));

    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 w-full whitespace-nowrap rounded-md border overflow-auto">
          <div className="flex flex-col pb-4 min-w-max">
             {/* Header Row (Dates/Titles) - Optional, mainly for reference */}
             <div className="flex h-8 items-end border-b sticky top-0 bg-background z-10 px-4">
               <div className="w-32 shrink-0"></div>
               <div className="flex relative" style={{ width: sortedEvents.length * 200 }}>
                  {sortedEvents.map((e, i) => (
                    <div key={e.id} className="absolute text-[10px] text-muted-foreground w-40 truncate border-l pl-1" style={{ left: i * 200 }}>
                        {e.date || `${t('timeline.eventDefaultName')} ${i+1}`}
                    </div>
                  ))}
               </div>
             </div>

             {/* Character Rows */}
             {characters.map((char) => (
               <div key={char.id} className="flex h-24 items-center border-b hover:bg-muted/10 transition-colors relative group">
                  {/* Row Header */}
                  <div className="w-32 shrink-0 flex items-center gap-2 px-4 sticky left-0 bg-background border-r z-20 h-full shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary shrink-0">
                         {char.name.substring(0,2).toUpperCase()}
                     </div>
                     <span className="text-xs font-bold truncate">{char.name}</span>
                  </div>

                  {/* Events Track */}
                  <div className="relative h-full flex items-center" style={{ width: sortedEvents.length * 200 }}>
                     {/* Horizontal Guide Line */}
                     <div className="absolute left-0 right-0 h-0.5 bg-border/50 top-1/2 -translate-y-1/2 w-full" />
                     
                     {sortedEvents.filter(e => e.participants?.includes(char.id)).map(e => {
                        const index = eventIndexMap.get(e.id) || 0;
                        const leftPos = index * 200;
                        
                        return (
                          <div 
                             key={e.id}
                             onClick={() => openModal('timelineEvent', e)}
                             className="absolute top-1/2 -translate-y-1/2 cursor-pointer hover:z-30 transition-all hover:scale-110"
                             style={{ left: leftPos + 20 }} // +20 padding
                          >
                             <div className={`
                                w-4 h-4 rounded-full border-2 border-background shadow-sm ring-2 ring-transparent group-hover:ring-primary/20
                                ${e.importance === 'high' ? 'bg-orange-500' : 'bg-primary'}
                             `} />
                             <div className="absolute top-6 left-0 w-32 -ml-14 text-center opacity-0 group-hover/track:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] p-2 rounded border shadow-lg z-50 pointer-events-none">
                                <p className="font-bold truncate">{e.title}</p>
                                <p className="opacity-70 truncate">{e.date}</p>
                             </div>
                          </div>
                        );
                     })}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 flex-1 flex flex-col max-w-6xl mx-auto overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-primary" />
            {t('timeline.title')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('timeline.subtitle')}</p>
        </div>
        <div className="flex gap-2">
            <div className="flex items-center bg-muted p-1 rounded-lg border">
                <button 
                   onClick={() => setViewMode('list')}
                   className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                   title={t('timeline.viewVerticalList')}
                >
                    <Rows size={14} />
                </button>
                <button 
                   onClick={() => setViewMode('parallel')}
                   className={`p-1.5 rounded-md transition-all ${viewMode === 'parallel' ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                   title={t('timeline.viewParallel')}
                >
                    <GitGraph size={14} />
                </button>
            </div>
            <Button onClick={() => openModal('timelineEvent')} className="gap-2">
              <Plus size={16} />
              {t('timeline.new')}
            </Button>
        </div>
      </div>

      {viewMode === 'parallel' ? renderParallelView() : (
        <div className="relative border-l-2 border-primary/20 ml-4 space-y-8 pb-20 overflow-y-auto">
          {sortedEvents.map((event) => (
            <div key={event.id} className="relative pl-8 animate-in fade-in slide-in-from-left-2 duration-300">
              {/* Timeline dot */}
              <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-4 border-background shadow-sm ${
                event.importance === 'high' ? 'bg-orange-500' : 
                event.importance === 'low' ? 'bg-slate-400' : 'bg-primary'
              }`} />
              
              <div 
                onClick={() => openModal('timelineEvent', event)}
                className="group bg-card border border-border rounded-xl p-5 shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {event.date && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                          {event.date}
                        </span>
                      )}
                      {event.era && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">
                          {event.era}
                        </span>
                      )}
                      <Badge variant="outline" className="text-[9px] uppercase tracking-tighter opacity-70">
                        {event.dateMode}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                      {event.title || event.event}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      {event.participants && event.participants.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          <User size={12} className="text-primary" />
                          <span>{getParticipantNames(event.participants)}</span>
                        </div>
                      )}
                      {getLocationName(event.locationId) && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                          <MapPin size={12} className="text-primary" />
                          <span>{getLocationName(event.locationId)}</span>
                        </div>
                      )}
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {event.tags.map(tag => (
                          <div key={tag} className="flex items-center gap-1 text-[9px] uppercase font-bold text-muted-foreground/60">
                            <Tag size={10} />
                            {tag}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Scene Image */}
                  {getSceneImage(event.sceneId) && (
                    <div className="shrink-0 w-full md:w-48 aspect-video rounded-lg overflow-hidden border border-border shadow-sm bg-muted self-start">
                      <img 
                        src={getSceneImage(event.sceneId)} 
                        alt="Scene" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    </div>
                  )}

                  <div className="shrink-0 flex md:flex-col gap-2 items-end">
                     {event.importance === 'high' && <Badge className="bg-orange-500 text-[9px]">{t('timeline.crucial')}</Badge>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {sortedEvents.length === 0 && (
            <div className="ml-8 py-12 text-center border-2 border-dashed border-border rounded-xl">
              <Calendar size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground">{t('timeline.emptyStateTitle')}</p>
              <Button variant="link" onClick={() => openModal('timelineEvent')}>{t('timeline.createFirstEvent')}</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
