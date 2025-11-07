# PlumaAI - Editor de Novelas con IA

Editor de novelas con inteligencia artificial, construido con HTML, CSS, JavaScript y Alpine.js.

## Estructura del Proyecto

- `index.html`: Página principal
- `js/`: Scripts de la aplicación
- `styles/`: Archivos CSS
- `templates/`: Plantillas HTML organizadas en subdirectorios
  - `templates/components/`: Componentes principales
    - `header.html`: Cabecera de la aplicación
    - `sidebar.html`: Barra lateral
    - `main-content.html`: Estructura contenedora de vistas
  - `templates/components/views/`: Vistas individuales
    - `dashboard.html`: Vista de panel principal
    - `characters.html`: Vista de personajes
    - `chapters.html`: Vista de capítulos
    - `scenes.html`: Vista de escenas
    - `locations.html`: Vista de ubicaciones
    - `lore.html`: Vista de lore
    - `timeline.html`: Vista de línea de tiempo
    - `editor.html`: Vista de editor de texto
    - `ai-assistant.html`: Vista de asistente IA
  - `templates/modals/`: Plantillas de modales
    - `welcome-modal.html`: Modal de bienvenida
    - `character-info-modal.html`: Modal de información de personaje
    - `new-project-modal.html`: Modal de nuevo proyecto
    - `new-edit-character-modal.html`: Modal de nuevo/editar personaje
    - `new-edit-chapter-modal.html`: Modal de nuevo/editar capítulo
    - `new-edit-scene-modal.html`: Modal de nuevo/editar escena
    - `new-edit-location-modal.html`: Modal de nuevo/editar ubicación
    - `new-edit-lore-modal.html`: Modal de nuevo/editar lore
    - `new-edit-timeline-event-modal.html`: Modal de nuevo/editar evento de línea de tiempo
    - `projects-list-modal.html`: Modal de lista de proyectos
    - `export-modal.html`: Modal de exportación
    - `import-modal.html`: Modal de importación
  - `templates/containers/`: Contenedores especiales
    - `modal-container.html`: Contenedor para modales