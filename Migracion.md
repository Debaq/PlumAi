# Plan de Migración: PlumAi (Modern Stack)

Este documento detalla la estrategia de migración desde la arquitectura basada en Vanilla JS/Alpine.js hacia un entorno moderno basado en **Next.js**, **TypeScript** y **Tiptap**.

## Fase 0: Limpieza y Configuración
- [x] Crear carpeta `/legacy` y mover todos los archivos actuales a ella (excepto configuraciones de entorno y git).
- [x] Inicializar proyecto Next.js 14+ (App Router) en la raíz.
- [x] Configurar TypeScript, Tailwind CSS y shadcn/ui.
- [x] Crear `BACKLOG.md` para seguimiento de tareas granulares.
- [x] Configurar ESLint y Prettier para asegurar calidad de código desde el inicio.

## Fase 1: Base de Datos y Estado (Local-First)
- [x] **Data Schema:** Definir interfaces TS para:
    - `Project`, `Chapter`, `Scene`, `Character`, `Location`, `LoreItem`, `Relationship`.
- [x] **Dexie.js:** Configurar las tablas de IndexedDB para persistencia local.
- [x] **Zustand Stores:**
    - `useProjectStore`: Manejo del proyecto cargado.
    - `useUIStore`: Estados de modales, sidebars y temas.
- [x] **I18n:** Migrar diccionarios de `js/i18n/locales` a un formato estructurado para `next-intl`.

## Fase 2: El Editor de Texto (Motor Principal)
- [x] Configurar **Tiptap** como componente central de edición.
- [x] **Extensiones:**
    - Portar `mention.js` para autocompletado de personajes/lore.
    - Portar `commandMenu.js` (Slash commands).
- [x] **Track Changes:** Implementar sistema de sugerencias y control de cambios basado en marcas de ProseMirror.
- [x] **Autoguardado:** Lógica de sincronización periódica con Dexie.js.

## Fase 3: Módulos de Escritura y Mundo
- [ ] **Sidebar de Navegación:** Gestión de estructura de capítulos y escenas.
- [ ] **Fichas de Entidades:** Vistas para creación y edición de Personajes, Lugares y Lore.
- [ ] **Relaciones:** Sistema interactivo para definir vínculos entre entidades (basado en el documento de relaciones bidireccionales).
- [ ] **Media Manager:** Gestión de imágenes de perfil y referencias visuales.

## Fase 4: Visualización Avanzada
- [ ] **Relations Diagram:** Reimplementar el grafo de relaciones usando **React Flow**.
- [ ] **Interactive Timeline:** Vista cronológica de eventos de la historia.
- [ ] **Dashboard de Estadísticas:** Analítica de progreso (conteo de palabras, densidad de personajes, etc.).

## Fase 5: AI Assistant (Agentic Service)
- [ ] Integrar **Vercel AI SDK**.
- [ ] Portar el `AgenticContextService` para enviar contexto relevante a la IA (RAG local).
- [ ] Implementar chat flotante y comandos de IA integrados en el editor (mejorar estilo, resumir, expandir).

## Fase 6: Exportación y Finalización
- [ ] **Publishing Engine:** Generación de archivos exportables (PDF, DOCX, EPUB).
- [ ] **Importador Legacy:** Herramienta para convertir archivos `.pluma` antiguos al nuevo esquema.
- [ ] **Optimización:** Code-splitting y auditoría de rendimiento (Lighthouse).

---

## Sistema de Avance
- **Estado Actual:** Fase 1 (Completada).
- **Última actualización:** 22 de enero de 2026.
- **Prioridad Inmediata:** Estabilizar el esquema de datos y el editor Tiptap.
