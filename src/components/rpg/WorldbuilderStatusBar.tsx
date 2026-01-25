import { useProjectStore } from '@/stores/useProjectStore';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export const WorldbuilderStatusBar = () => {
  const { activeProject } = useProjectStore();
  
  const totalWords = activeProject?.chapters.reduce((acc, ch) => acc + (ch.wordCount || 0), 0) || 0;
  
  // Simple Level System: 1 Level per 1000 words
  const level = Math.floor(totalWords / 1000) + 1;
  const currentLevelProgress = totalWords % 1000;
  const nextLevelThreshold = 1000;
  const progressPercent = (currentLevelProgress / nextLevelThreshold) * 100;

  return (
    <div className="flex items-center gap-4 px-2 border-l border-border ml-2 h-full">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 transition-colors border-primary/20">
          <Sparkles className="w-3 h-3 mr-1 text-primary" />
          <span className="font-bold text-primary">Lvl {level}</span>
        </Badge>
        
        <div className="flex flex-col w-[100px] gap-0.5">
            <div className="flex justify-between text-[8px] text-muted-foreground leading-none">
                <span>XP</span>
                <span>{currentLevelProgress} / {nextLevelThreshold}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
      </div>
    </div>
  );
};
