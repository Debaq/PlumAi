import { useEffect, useRef } from 'react';
import { useVersionControlStore } from '@/stores/useVersionControlStore';
import { useProjectStore } from '@/stores/useProjectStore';

export function useAutoSnapshot(delay = 30000) {
  const { activeProject } = useProjectStore();
  const { createCommit } = useVersionControlStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProjectRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeProject) return;

    // We stringify to check for changes efficiently (simple approach)
    // In a real app, we might want to check only content changes.
    const projectStr = JSON.stringify({
        chapters: activeProject.chapters.map(c => ({ id: c.id, content: c.content })),
        characters: activeProject.characters,
        locations: activeProject.locations,
        loreItems: activeProject.loreItems,
        timelineEvents: activeProject.timelineEvents
    });

    if (lastSavedProjectRef.current === null) {
        lastSavedProjectRef.current = projectStr;
        return;
    }

    if (projectStr === lastSavedProjectRef.current) {
        return;
    }

    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
        const timestamp = new Date().toLocaleTimeString();
        createCommit(activeProject, `Snapshot automático - ${timestamp}`, 'Sistema');
        lastSavedProjectRef.current = projectStr;
    }, delay);

    return () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
  }, [activeProject, createCommit, delay]);
}
