import { useProjectStore } from '@/stores/useProjectStore';
import { useUIStore } from '@/stores/useUIStore';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  MapPin, 
  UserPlus, 
  MapPinPlus, 
  BookPlus,
  Trash2,
  Clock,
  Film,
  PlusSquare
} from 'lucide-react';

export const Dashboard = () => {
  const { activeProject } = useProjectStore();
  const { setActiveLoreTab, openModal } = useUIStore();

  if (!activeProject) return null;

  const stats = [
    { 
      label: 'Lore', 
      value: activeProject.loreItems.length, 
      icon: BookOpen, 
      color: 'text-blue-500',
      tab: 'summary' as const 
    },
    { 
      label: 'Characters', 
      value: activeProject.characters.length, 
      icon: Users, 
      color: 'text-purple-500',
      tab: 'characters' as const
    },
    { 
      label: 'Scenes', 
      value: activeProject.scenes?.length || 0, 
      icon: Film, 
      color: 'text-indigo-500',
      tab: 'scenes' as const
    },
    { 
      label: 'Locations', 
      value: activeProject.locations.length, 
      icon: MapPin, 
      color: 'text-green-500',
      tab: 'locations' as const
    },
    { 
      label: 'Events', 
      value: activeProject.timelineEvents.length, 
      icon: Calendar, 
      color: 'text-orange-500',
      tab: 'events' as const
    },
    { 
      label: 'World Map', 
      value: activeProject.locations.reduce((acc, loc) => acc + (loc.connections?.length || 0), 0) + ' paths', 
      icon: MapPinPlus, 
      color: 'text-pink-500',
      tab: 'map' as const 
    },
  ];

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 flex-1 overflow-y-auto">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            onClick={() => setActiveLoreTab(stat.tab)}
            className="bg-card border border-border p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-accent/50 transition-colors"
          >
            <div className={`p-2 rounded-md bg-accent ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <button 
            onClick={() => openModal('editCharacter')}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-left"
          >
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <UserPlus size={18} />
            </div>
            <span className="font-medium text-sm">New Character</span>
          </button>
          <button 
            onClick={() => openModal('newScene')}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-left"
          >
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <PlusSquare size={18} />
            </div>
            <span className="font-medium text-sm">New Scene</span>
          </button>
          <button 
            onClick={() => openModal('editLocation')}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-left"
          >
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <MapPinPlus size={18} />
            </div>
            <span className="font-medium text-sm">New Location</span>
          </button>
          <button 
            onClick={() => openModal('loreItem')}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-left"
          >
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <BookPlus size={18} />
            </div>
            <span className="font-medium text-sm">New Lore Entry</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Lore */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Lore</h2>
            <button 
              onClick={() => setActiveLoreTab('summary')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All
            </button>
          </div>

          {activeProject.loreItems.length === 0 ? (
            <div className="bg-card border border-border border-dashed p-8 rounded-lg text-center text-muted-foreground">
              <BookOpen size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">No lore entries yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeProject.loreItems.slice(0, 4).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => openModal('loreItem', item)}
                  className="bg-card border border-border p-4 rounded-lg hover:border-primary/50 transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm truncate">{item.title}</h3>
                    <button className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {item.summary || 'No summary available.'}
                  </p>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-accent px-2 py-0.5 rounded-full text-muted-foreground font-medium uppercase tracking-tighter">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Events</h2>
            <button 
              onClick={() => setActiveLoreTab('events')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View All
            </button>
          </div>

          {activeProject.timelineEvents.length === 0 ? (
            <div className="bg-card border border-border border-dashed p-8 rounded-lg text-center text-muted-foreground">
              <Clock size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">No events recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeProject.timelineEvents.slice(0, 3).map(event => (
                <div 
                  key={event.id} 
                  onClick={() => openModal('timelineEvent', event)}
                  className="bg-card border border-border p-4 rounded-lg flex gap-4 items-start hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary uppercase">
                      {event.date || 'Relative'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{event.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};