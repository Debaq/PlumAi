import { useProjectStore } from '@/stores/useProjectStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export interface ContextInventory {
  project: {
    title: string;
    genre?: string;
  };
  availableCharacters: { name: string; role: string; summary: string }[];
  availableLocations: { name: string; type: string; summary: string }[];
  availableScenes: { name: string; summary: string }[];
  availableLore: { title: string; category: string; summary: string }[];
  availableTimeline: { title: string; date?: string }[];
  currentChapterInfo: { title: string; number: number; wordCount: number; summary: string } | null;
  chapterList: { title: string; number: number; summary: string }[];
}

export interface ContextNeeds {
    characters: string[]; // List of Names
    locations: string[];
    scenes: string[];
    lore: string[];
    timeline: string[];
    chaptersToRead: string[]; // List of Chapter Titles to read fully
    reasoning: string;
}

export const AgenticService = {
  buildContextInventory(chapterId?: string): ContextInventory | null {
      // ... existing implementation ...
      const project = useProjectStore.getState().activeProject;
      if (!project) return null;
  
      const truncate = (str?: string, len: number = 50) => {
          if (!str) return 'Sin descripción';
          return str.length > len ? str.substring(0, len) + '...' : str;
      };
  
      const inventory: ContextInventory = {
          project: {
              title: project.title,
              genre: project.genre
          },
          availableCharacters: project.characters.map(c => ({ 
              name: c.name, 
              role: c.role,
              summary: truncate(c.physicalDescription || c.personality, 80)
          })),
          availableLocations: project.locations.map(l => ({ 
              name: l.name, 
              type: l.type,
              summary: truncate(l.description, 80)
          })),
          availableScenes: (project.scenes || []).map(s => ({
              name: s.title,
              summary: truncate(s.description || s.notes, 60)
          })),
          availableLore: project.loreItems.map(l => ({ 
              title: l.title, 
              category: l.category,
              summary: truncate(l.summary || l.content, 80)
          })),
          availableTimeline: project.timelineEvents.map(t => ({ title: t.title, date: t.date })),
          chapterList: project.chapters.map((c, idx) => ({
              title: c.title,
              number: idx + 1,
              summary: truncate(c.summary || c.content, 100)
          })),
          currentChapterInfo: null
      };
  
      if (chapterId) {
          const index = project.chapters.findIndex(c => c.id === chapterId);
          const chapter = project.chapters[index];
          if (chapter) {
              inventory.currentChapterInfo = {
                  title: chapter.title,
                  number: index + 1,
                  wordCount: chapter.wordCount || 0,
                  summary: truncate(chapter.summary, 150)
              };
          }
      }
  
      return inventory;
  },

  buildContextAnalysisPrompt(_mode: string, userInput: string, inventory: ContextInventory, selectedText?: string): string {
        const config = useSettingsStore.getState().ragConfiguration.analysis;
        let promptTemplate = config.systemPrompt;

        // Build the Index String
        let indexString = `Resumen de "${inventory.project.title}":\n`;
        
        indexString += `\n### 1. Personajes\n${inventory.availableCharacters.map(c => `- [${c.name}] (${c.role}): ${c.summary}`).join('\n')}`;
        indexString += `\n\n### 2. Capítulos\n${inventory.chapterList.map(c => `- [${c.title}] (Cap ${c.number}): ${c.summary}`).join('\n')}`;
        indexString += `\n\n### 3. Lore\n${inventory.availableLore.map(l => `- [${l.title}] (${l.category}): ${l.summary}`).join('\n')}`;
        indexString += `\n${inventory.availableLocations.map(l => `- [${l.name}] (Lugar): ${l.summary}`).join('\n')}`;
        indexString += `\n\n### 4. Cronología\n${inventory.availableTimeline.map(t => `- [${t.title}] (${t.date})`).join('\n')}`;

        if (selectedText) {
            indexString += `\n\n### CONTEXTO SELECCIONADO\n"${selectedText.substring(0, 300)}..."`;
        }

        return promptTemplate
            .replace('{{PROJECT_INDEX}}', indexString)
            .replace('{{USER_INPUT}}', userInput);
  },

  buildSelectiveContext(contextNeeds: ContextNeeds, chapterId?: string): any {
    // ... same implementation as before ...
    const project = useProjectStore.getState().activeProject;
    if (!project) return null;

    const context: any = {
        project: {
            title: project.title,
            isRpgModeEnabled: project.isRpgModeEnabled,
            rpgSystem: project.rpgSystem
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
                description: c.physicalDescription, 
                personality: c.personality,
                background: c.history,
                currentVitalStatus: c.currentVitalStatus,
                vitalStatusHistory: c.vitalStatusHistory,
                attributes: c.attributes 
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
            .filter(l => includes(contextNeeds.lore, l.title))
            .map(l => ({
                title: l.title,
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
                date: t.date,
                description: t.description
            }));
    }

    // Specific Chapters Reading
    if (contextNeeds.chaptersToRead && contextNeeds.chaptersToRead.length > 0) {
        context.readChapters = project.chapters
            .filter(c => includes(contextNeeds.chaptersToRead, c.title))
            .map(c => ({
                title: c.title,
                content: c.content,
                summary: c.summary
            }));
    }

    // Current Chapter
    if (chapterId) {
        const chapter = project.chapters.find(c => c.id === chapterId);
        if (chapter) {
            context.currentChapter = {
                title: chapter.title,
                content: chapter.content,
                wordCount: chapter.wordCount
            };
        }
    }

    return context;
  },

  buildFinalPrompt(mode: string, userInput: string, context: any, selectedText?: string): string {
      const config = useSettingsStore.getState().ragConfiguration.writing;
      let promptTemplate = config.systemPrompt;

      let contextBlocks = '';

      if (context.characters?.length) {
          contextBlocks += `## PERSONAJES\n`;
          context.characters.forEach((char: any) => {
              contextBlocks += `\n### ${char.name} (${char.role})\n`;
              if (char.description) contextBlocks += `${char.description}\n`;
              if (char.personality) contextBlocks += `**Personalidad**: ${char.personality}\n`;
              if (char.attributes && Object.keys(char.attributes).length > 0) {
                  contextBlocks += `**Stats**: ${JSON.stringify(char.attributes)}\n`;
              }
          });
          contextBlocks += '\n';
      }

      if (context.locations?.length) {
          contextBlocks += `## LOCACIONES\n`;
          context.locations.forEach((loc: any) => {
              contextBlocks += `- **${loc.name}** (${loc.type}): ${loc.description}\n`;
          });
          contextBlocks += '\n';
      }

      if (context.lore?.length) {
          contextBlocks += `## LORE\n`;
          context.lore.forEach((l: any) => {
              contextBlocks += `- **${l.title}**: ${l.content}\n`;
          });
          contextBlocks += '\n';
      }

      if (context.readChapters?.length) {
           contextBlocks += `## CAPÍTULOS CONSULTADOS\n`;
           context.readChapters.forEach((c: any) => {
               contextBlocks += `### ${c.title}\n${c.content}\n---\n`;
           });
           contextBlocks += '\n';
      }

      if (context.currentChapter) {
          contextBlocks += `## CAPÍTULO ACTUAL: ${context.currentChapter.title}\n`;
          contextBlocks += `${context.currentChapter.content}\n\n`;
      }
      
      if (selectedText) {
            contextBlocks += `## TEXTO SELECCIONADO\n"${selectedText}"\n\n`;
      }

      let rpgInstructions = '';
      if (context.project.isRpgModeEnabled) {
          rpgInstructions += `[MODO WORLDBUILDER ACTIVO: Actúa como Narrador/Arquitecto de Mundos. Usa stats de personajes y del mundo (${context.project.rpgSystem || 'Generico'}). Prioriza la coherencia, conflictos y tiradas.]`;
      }

      return promptTemplate
          .replace('{{PROJECT_TITLE}}', context.project.title)
          .replace('{{CONTEXT_BLOCKS}}', contextBlocks)
          .replace('{{USER_INPUT}}', userInput)
          .replace('{{MODE}}', mode)
          .replace('{{RPG_INSTRUCTIONS}}', rpgInstructions);
  },
  
  // ... consistency check ...
  buildConsistencyCheckPrompt(context: any): string {
    // Keep this hardcoded or move to config later if needed
    let prompt = `# INSPECTOR DE CONSISTENCIA NARRATIVA
    // ... existing prompt code ...
    Eres un editor literario experto cuya tarea es encontrar contradicciones, errores de lógica o inconsistencias entre el capítulo actual y el Lore/Personajes del proyecto.

## PROYECTO: ${context.project.title}

## DATOS DEL MUNDO (LORE Y REGLAS)
${context.lore?.map((l: any) => `- **${l.title}**: ${l.content}`).join('\n') || 'No hay lore específico cargado.'}

## ESTADO DE PERSONAJES
${context.characters?.map((c: any) => `- **${c.name}**: Estado Vital Actual: ${c.currentVitalStatus}. Relaciones y trasfondo: ${c.background || 'N/A'}`).join('\n') || 'No hay personajes específicos cargados.'}

## CAPÍTULO A ANALIZAR: ${context.currentChapter?.title || 'Sin título'}
${context.currentChapter?.content || 'Contenido vacío.'}

---

## INSTRUCCIONES DE ANÁLISIS

Busca específicamente:
1. **Contradicciones de Estado**: Personajes que actúan estando muertos, heridos que actúan como sanos, o personajes en dos lugares a la vez.
2. **Violación de Reglas del Mundo**: Magia o tecnología que funciona de forma distinta a lo descrito en el Lore.
3. **Inconsistencias de Carácter**: Cambios bruscos de personalidad o motivaciones sin justificación narrativa.
4. **Errores de Continuidad**: Objetos perdidos que reaparecen, o eventos del pasado que se describen de forma distinta.

**Formato de respuesta (JSON estricto):**
Responde ÚNICAMENTE con un array de objetos con este formato:
\`\`\`json
[
  {
    "type": "error" | "warning" | "suggestion",
    "issue": "Breve descripción del problema",
    "explanation": "Explicación detallada de por qué es una inconsistencia citando la parte del lore o personaje",
    "severity": "high" | "medium" | "low"
  }
]
\`\`\`

Si no encuentras ninguna inconsistencia, responde con un array vacío: \`[]\`

Responde SOLO el JSON:`;

    return prompt;
  },

  buildCharacterChatPrompt(userInput: string, character: any, projectTitle: string): string {
    const config = useSettingsStore.getState().ragConfiguration.chat;
    let promptTemplate = config.systemPrompt;

    return promptTemplate
        .replace('{{CHAR_NAME}}', character.name)
        .replace(/{{CHAR_NAME}}/g, character.name) // Replace all occurrences
        .replace('{{CHAR_ROLE}}', character.role)
        .replace('{{CHAR_PERSONALITY}}', character.personality || 'N/A')
        .replace('{{CHAR_STATUS}}', character.currentVitalStatus)
        .replace('{{PROJECT_TITLE}}', projectTitle)
        .replace('{{USER_INPUT}}', userInput);
  },

  buildBlurbPrompt(project: any): string {
    // ... existing implementation ...
    const chaptersSummary = project.chapters.map((c: any) => `- ${c.title}: ${c.summary || c.content.substring(0, 200)}...`).join('\n');
    const charactersInfo = project.characters.map((c: any) => `- ${c.name} (${c.role}): ${c.personality}`).join('\n');

    return `# GENERADOR DE BLURB (CONTRAPORTADA)

Eres un experto en marketing editorial. Tu tarea es escribir una sinopsis comercial atractiva (blurb) para la siguiente novela.

## DATOS DEL LIBRO
**Título**: ${project.title}
**Género**: ${project.genre || 'Ficción'}
**Autor**: ${project.author || 'Anónimo'}

## RESUMEN DE CAPÍTULOS
${chaptersSummary}

## PERSONAJES PRINCIPALES
${charactersInfo}

## INSTRUCCIONES
1. Escribe un texto de aproximadamente 200-250 palabras.
2. Debe ser intrigante, emocional y con un fuerte gancho comercial.
3. No reveles el final (evita spoilers).
4. Usa un tono adecuado para el género ${project.genre}.
5. Termina con una frase poderosa que deje al lector con ganas de más.

Responde solo con el texto del blurb:`;
  }
};
