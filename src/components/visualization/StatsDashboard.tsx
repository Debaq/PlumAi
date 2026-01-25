import { useProjectStore } from '@/stores/useProjectStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { 
  Flame, 
  Trophy, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Users, 
  MapPin, 
  PenTool 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const StatsDashboard = () => {
  const { activeProject } = useProjectStore();
  const { dailyWordGoal } = useSettingsStore();

  if (!activeProject) return <div className="p-8 text-center opacity-50 italic">Carga un proyecto para ver estadísticas.</div>;

  const totalWords = activeProject.chapters.reduce((acc, chap) => acc + (chap.wordCount || 0), 0);
  const characterCount = activeProject.characters.length;
  const locationCount = activeProject.locations.length;
  const chapterCount = activeProject.chapters.length;

  // Streak logic (hardcoded for now, ideally persistent in store)
  const writingStreak = 5; 

  const chartData = activeProject.chapters.map(chap => ({
    name: chap.title.substring(0, 15) + (chap.title.length > 15 ? '...' : ''),
    words: chap.wordCount || 0,
  }));

  const StatsCard = ({ icon: Icon, label, value, color, secondary }: any) => (
    <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-110 transition-transform duration-500 ${color}`} />
      <div className="flex items-center gap-4 relative z-10">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black">{value}</h3>
            {secondary && <span className="text-xs text-muted-foreground">{secondary}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-24">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm">Resumen analítico de "{activeProject.title}"</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="h-8 rounded-xl gap-2 bg-primary/5 text-primary border-primary/20">
            <Flame className="w-3.5 h-3.5 fill-primary" />
            Racha de {writingStreak} días
          </Badge>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard icon={PenTool} label="Palabras Totales" value={totalWords.toLocaleString()} color="bg-primary" />
        <StatsCard icon={BookOpen} label="Capítulos" value={chapterCount} color="bg-blue-500" />
        <StatsCard icon={Users} label="Personajes" value={characterCount} color="bg-purple-500" />
        <StatsCard icon={MapPin} label="Ubicaciones" value={locationCount} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black flex items-center gap-2">
                <TrendingUp className="text-primary w-5 h-5" />
                Volumen por Capítulo
              </h3>
              <p className="text-xs text-muted-foreground">Distribución de longitud del manuscrito</p>
            </div>
          </div>
          
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1}/>
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="words" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                >
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Motivation Side Panel */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-[#7c3aed] text-white p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy size={120} strokeWidth={1} />
            </div>
            
            <div className="space-y-1 relative z-10">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Target className="w-5 h-5" />
                Meta Diaria
              </h3>
              <p className="text-white/70 text-xs font-medium uppercase tracking-tighter">Mantén el ritmo de escritura</p>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end">
                <div className="text-4xl font-black tabular-nums">
                  {Math.min(totalWords % dailyWordGoal, dailyWordGoal)}
                  <span className="text-sm opacity-60 font-medium ml-2">/ {dailyWordGoal}</span>
                </div>
                <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">
                  {Math.round((Math.min(totalWords % dailyWordGoal, dailyWordGoal) / dailyWordGoal) * 100)}%
                </div>
              </div>
              
              <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-white transition-all duration-1000"
                  style={{ width: `${(Math.min(totalWords % dailyWordGoal, dailyWordGoal) / dailyWordGoal) * 100}%` }}
                />
              </div>
              
              <p className="text-[10px] leading-relaxed text-white/60">
                Basado en tu última sesión. Escribe {dailyWordGoal - (totalWords % dailyWordGoal)} palabras más para alcanzar tu objetivo hoy.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border/50 p-6 rounded-3xl space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Flame className="w-3 h-3 text-orange-500" /> Logros Recientes
            </h4>
            <div className="space-y-2">
              <AchievementItem label="Primeras 1,000 palabras" date="Ayer" checked />
              <AchievementItem label="Arquitecto de Mundos (5 Lore)" date="Hoy" checked />
              <AchievementItem label="Maestro de Capítulos" date="Próximamente" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const AchievementItem = ({ label, date, checked }: any) => (
  <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-transparent hover:border-border/50 transition-all">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${checked ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-muted-foreground/30'}`} />
      <span className={`text-xs font-bold ${checked ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
    </div>
    <span className="text-[9px] font-medium text-muted-foreground/60">{date}</span>
  </div>
);