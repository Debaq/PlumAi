import { useProjectStore } from '@/stores/useProjectStore';

export interface ContextInventory {
  project: {
    title: string;
  };
  availableCharacters: { name: string; role: string }[];
  availableLocations: { name: string; type: string }[];
  availableScenes: { name: string }[];
  availableLore: { title: string; category: string }[];
  availableTimeline: { title: string; date?: string }[];
  currentChapterInfo: { title: string; number: number; wordCount: number } | null;
  previousChaptersCount: number;
}

export interface ContextNeeds {
    characters: string[] | ['all'];
    locations: string[] | ['all'];
    scenes: string[] | ['all'];
    lore: string[] | ['all'];
    timeline: string[] | ['all'];
    currentChapter: boolean;
    previousChapters: number;
    reasoning: string;
}

export const AgenticService = {
  buildContextInventory(chapterId?: string): ContextInventory | null {
    const project = useProjectStore.getState().activeProject;
    if (!project) return null;

    const inventory: ContextInventory = {
        project: {
            title: project.title,
        },
        availableCharacters: project.characters.map(c => ({ name: c.name, role: c.role })),
        availableLocations: project.locations.map(l => ({ name: l.name, type: l.type })),
        availableScenes: project.chapters.flatMap(c => c.scenes).map(s => ({ name: s.title })),
        availableLore: project.loreItems.map(l => ({ title: l.name, category: l.category })),
        availableTimeline: project.timelineEvents.map(t => ({ title: t.title, date: t.absoluteDate })),
        currentChapterInfo: null,
        previousChaptersCount: 0
    };

    if (chapterId) {
        const index = project.chapters.findIndex(c => c.id === chapterId);
        const chapter = project.chapters[index];
        if (chapter) {
            inventory.currentChapterInfo = {
                title: chapter.title,
                number: index + 1,
                wordCount: chapter.wordCount
            };
            inventory.previousChaptersCount = index;
        }
    }

    return inventory;
  },

  buildContextAnalysisPrompt(mode: string, userInput: string, inventory: ContextInventory, selectedText?: string): string {
        let prompt = `# ANALISIS DE CONTEXTO NECESARIO

Eres un asistente que debe analizar una tarea de escritura y determinar qué contexto específico necesitas para completarla de manera óptima.

## TAREA DEL USUARIO
**Modo**: ${mode}
**Instrucción**: ${userInput}
`;

        if (selectedText) {
            prompt += `**Texto seleccionado**: ${selectedText.substring(0, 500)}${selectedText.length > 500 ? '...' : ''}\n`;
        }

        prompt += `\n## PROYECTO: ${inventory.project.title}

## CONTEXTO DISPONIBLE

### Personajes disponibles (${inventory.availableCharacters.length}):
${inventory.availableCharacters.map(c => `- ${c.name} (${c.role})`).join('\n')}

### Locaciones disponibles (${inventory.availableLocations.length}):
${inventory.availableLocations.map(l => `- ${l.name} (${l.type})`).join('\n')}

### Escenas disponibles (${inventory.availableScenes.length}):
${inventory.availableScenes.map(s => `- ${s.name}`).join('\n')}

### Lore disponible (${inventory.availableLore.length}):
${inventory.availableLore.map(l => `- ${l.title} (${l.category})`).join('\n')}

### Timeline disponible (${inventory.availableTimeline.length}):
${inventory.availableTimeline.map(t => `- ${t.title} (${t.date})`).join('\n')}
`;

        if (inventory.currentChapterInfo) {
            prompt += `\n### Capítulo actual:
- Número: ${inventory.currentChapterInfo.number}
- Título: ${inventory.currentChapterInfo.title}
- Palabras: ${inventory.currentChapterInfo.wordCount}

### Capítulos anteriores disponibles: ${inventory.previousChaptersCount}
`;
        }

        prompt += `\n---

## INSTRUCCIONES

Analiza la tarea y responde ÚNICAMENTE con un JSON que especifique qué contexto necesitas.

**Formato de respuesta (JSON estricto):**
\`\`\`json
{
  "contextNeeded": {
    "characters": ["nombre1", "nombre2"] o [] si no necesitas ninguno o ["all"] para todos,
    "locations": ["nombre1"] o [] o ["all"],
    "scenes": ["nombre1"] o [] o ["all"],
    "lore": ["título1", "título2"] o [] o ["all"],
    "timeline": ["título1"] o [] o ["all"],
    "currentChapter": true o false (si necesitas el contenido completo del capítulo actual),
    "previousChapters": 0-${inventory.previousChaptersCount} (cuántos capítulos anteriores necesitas),
    "reasoning": "breve explicación de por qué necesitas este contexto"
  }
}
\`\`\`

**IMPORTANTE**:
- Sé SELECTIVO: Solo pide lo que realmente necesitas para la tarea
- Si solo necesitas algunos personajes específicos mencionados en el texto, pide solo esos
- No pidas "all" a menos que genuinamente necesites toda esa categoría
- El objetivo es MINIMIZAR tokens mientras mantienes la calidad
- Responde SOLO con el JSON, sin texto adicional

Analiza y responde:`;

        return prompt;
  },

  buildSelectiveContext(contextNeeds: ContextNeeds, chapterId?: string): any {
    const project = useProjectStore.getState().activeProject;
    if (!project) return null;

    const context: any = {
        project: {
            title: project.title,
        }
    };

    const includes = (list: string[] | ['all'], name: string) => {
        if (!list) return false;
        if (list.length === 1 && list[0] === 'all') return true;
        return (list as string[]).includes(name);
    };

    // Characters
    if (contextNeeds.characters && contextNeeds.characters.length > 0) {
        context.characters = project.characters
            .filter(c => includes(contextNeeds.characters, c.name))
            .map(c => ({
                name: c.name,
                role: c.role,
                description: c.physicalDescription, // Using available fields
                personality: c.personality,
                background: c.history
            }));
    }

    // Locations
    if (contextNeeds.locations && contextNeeds.locations.length > 0) {
        context.locations = project.locations
            .filter(l => includes(contextNeeds.locations, l.name))
            .map(l => ({
                name: l.name,
                type: l.type,
                description: l.description
            }));
    }

    // Lore
    if (contextNeeds.lore && contextNeeds.lore.length > 0) {
        context.lore = project.loreItems
            .filter(l => includes(contextNeeds.lore, l.name))
            .map(l => ({
                title: l.name,
                content: l.content,
                category: l.category
            }));
    }

    // Timeline
    if (contextNeeds.timeline && contextNeeds.timeline.length > 0) {
        context.timeline = project.timelineEvents
            .filter(t => includes(contextNeeds.timeline, t.title))
            .map(t => ({
                title: t.title,
                date: t.absoluteDate,
                description: t.description
            }));
    }

    // Current Chapter
    if (contextNeeds.currentChapter && chapterId) {
        const chapter = project.chapters.find(c => c.id === chapterId);
        if (chapter) {
            context.currentChapter = {
                title: chapter.title,
                content: chapter.content,
                wordCount: chapter.wordCount
            };
        }
    }

    // Previous Chapters
    if (contextNeeds.previousChapters && contextNeeds.previousChapters > 0 && chapterId) {
        const index = project.chapters.findIndex(c => c.id === chapterId);
        if (index > 0) {
            context.previousChapters = project.chapters
                .slice(Math.max(0, index - contextNeeds.previousChapters), index)
                .map(c => ({
                    title: c.title,
                    summary: c.summary || c.content.substring(0, 500) + '...'
                }));
        }
    }

    return context;
  },

  buildFinalPrompt(mode: string, userInput: string, context: any, selectedText?: string): string {
      let prompt = `# PROYECTO: ${context.project.title}\n\n`;

      if (context.characters?.length) {
          prompt += `## PERSONAJES\n`;
          context.characters.forEach((char: any) => {
              prompt += `\n### ${char.name} (${char.role})\n`;
              if (char.description) prompt += `${char.description}\n`;
              if (char.personality) prompt += `**Personalidad**: ${char.personality}\n`;
          });
          prompt += '\n';
      }

      if (context.locations?.length) {
          prompt += `## LOCACIONES\n`;
          context.locations.forEach((loc: any) => {
              prompt += `- **${loc.name}** (${loc.type}): ${loc.description}\n`;
          });
          prompt += '\n';
      }

      if (context.lore?.length) {
          prompt += `## LORE\n`;
          context.lore.forEach((l: any) => {
              prompt += `- **${l.title}**: ${l.content}\n`;
          });
          prompt += '\n';
      }

      if (context.previousChapters?.length) {
           prompt += `## CAPÍTULOS ANTERIORES\n`;
           context.previousChapters.forEach((c: any) => {
               prompt += `**${c.title}**: ${c.summary}\n`;
           });
           prompt += '\n';
      }

      if (context.currentChapter) {
          prompt += `## CAPÍTULO ACTUAL: ${context.currentChapter.title}\n`;
          prompt += `${context.currentChapter.content}\n\n`;
      }

      if (selectedText) {
            prompt += `## TEXTO SELECCIONADO\n${selectedText}\n\n`;
      }

      prompt += `---\n\n## INSTRUCCIÓN\n${userInput}\n\n`;
      prompt += `**Modo**: ${mode}\n`;

      return prompt;
  }
};
