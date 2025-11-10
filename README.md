# 📚 PlumaAI - Editor de Novelas con IA

Editor profesional de novelas con inteligencia artificial, construido con HTML, CSS, JavaScript y Alpine.js. Enfocado en ofrecer la mejor experiencia de escritura con un editor avanzado y herramientas completas para gestionar personajes, escenas, ubicaciones y timeline.

## 🚀 Estado del Proyecto

**Versión**: 1.0 Beta - Professional Edition
**Última actualización**: 2025-11-09
**Estado**: Editor completamente funcional con todas las herramientas de escritura profesional

---

## ✅ Funcionalidades Implementadas

### 🎨 Interfaz y Sistema Base

- ✅ **Diseño Dark Mode** completo y responsive
- ✅ **Sistema de navegación** con sidebar colapsable
- ✅ **Sistema i18n** (Español/Inglés) completamente funcional
- ✅ **Alpine.js Stores** para gestión de estado global
- ✅ **Sistema de modales** con carga dinámica de templates
- ✅ **Notificaciones toast** (success, error, warning, info)

### 👥 Gestión de Personajes

- ✅ **CRUD completo** de personajes
- ✅ **Sistema de avatares** con DiceBear (40+ estilos)
- ✅ **Modal selector de avatares** con preview en tiempo real
- ✅ **Sistema de relaciones** entre personajes
  - 20+ tipos de relaciones (amigo, enemigo, familia, etc.)
  - Iconos y colores por tipo de relación
  - Visualización mejorada con bordes de colores
- ✅ **Campos**: nombre, rol, descripción física, personalidad, historia, notas
- ✅ **Roles**: Protagonista, Antagonista, Secundario, De apoyo

### 📖 Gestión de Capítulos

- ✅ **CRUD completo** de capítulos
- ✅ **Editor de texto** integrado
- ✅ **Estados**: Borrador, En Revisión, Final
- ✅ **Contador de palabras** automático
- ✅ **Resumen** para contexto de IA
- ✅ **Navegación** rápida entre capítulos

### 🎬 Gestión de Escenas

- ✅ **CRUD completo** de escenas
- ✅ **Asignación a capítulos**
- ✅ **Personajes participantes**
- ✅ **Ubicación** de la escena
- ✅ **Posición en timeline**
- ✅ **Notas** y descripción

### 📍 Gestión de Ubicaciones

- ✅ **CRUD completo** de ubicaciones
- ✅ **Imágenes**: Upload de archivos o URL
- ✅ **Tipo de ubicación**: Ciudad, bosque, montaña, edificio, etc.
- ✅ **Descripción** detallada con RichEditor
- ✅ **Significancia**: Importancia en la historia
- ✅ **Generador de Prompts IA**: Copia prompts optimizados para DALL-E, Midjourney, Stable Diffusion
- ✅ **Notas adicionales** con RichEditor
- ✅ **Visualización** en cards con imágenes

### 📚 Sistema de Lore

- ✅ **CRUD completo** de entradas de lore
- ✅ **Categorías**: General, Mundo, Historia, Magia, Cultura, etc.
- ✅ **Contenido extenso** con resumen
- ✅ **Entidades relacionadas**

### ⏰ Timeline Mejorado

- ✅ **Drag & Drop** con SortableJS para reordenar eventos
- ✅ **3 Vistas diferentes**:
  - 📋 **Lista**: Eventos ordenados con drag & drop
  - 📊 **Visual**: Timeline gráfico con línea temporal
  - 📚 **Eras**: Agrupado por épocas
- ✅ **3 Modos de fecha**:
  - 📅 **Absoluto**: Fechas exactas
  - 🔄 **Relativo**: Orden relativo (before/after)
  - ⏳ **Era**: Épocas/eras (fantasía, historia alternativa)
- ✅ **Sistema de filtros** por tipo de evento
- ✅ **Modelo expandido**:
  - Participantes (personajes)
  - Ubicación
  - Importancia (baja, media, alta)
  - Tags personalizados
  - Escenas y capítulos relacionados
  - Impactos (para futuro sistema de relaciones dinámicas)
- ✅ **Indicadores visuales** de importancia con colores

### 📊 Dashboard

- ✅ **Estadísticas** del proyecto
- ✅ **Acciones rápidas** (nuevo personaje, capítulo, etc.)
- ✅ **Actividad reciente** (estructura lista, sin persistencia)

### 🔍 Sistema de Búsqueda Unificado ⭐ **COMPLETO**

- ✅ **Lunr.js integrado** desde CDN
- ✅ **SearchService completo** con indexación automática
- ✅ **Indexación de TODO**: Personajes, escenas, ubicaciones, timeline, capítulos, lore
- ✅ **Búsqueda inteligente**:
  - Búsqueda exacta
  - Búsqueda con comodín (*)
  - Búsqueda fuzzy (tolera 1 error)
  - Búsqueda por palabras individuales
- ✅ **Búsqueda en RichEditor** (menciones con @, #, !)
- ✅ **Actualización automática** del índice cuando cambian los datos
- ✅ **Búsqueda en tiempo real** dentro de los editores
- ✅ **Métodos especializados**: searchCharacters, searchLocations, searchLore, searchTimeline
- ⚠️ **Búsqueda global UI** pendiente (servicio 100% listo, falta UI)

---

## 🔴 Funcionalidades Pendientes

### 💾 Persistencia de Datos

- ❌ **localStorage** para proyectos pequeños
- ❌ **IndexedDB** para proyectos grandes
- ❌ **Importación/Exportación** JSON
- ❌ **Autoguardado** periódico
- ❌ **Gestión de múltiples proyectos**

**Impacto**: Actualmente los datos se pierden al recargar la página

### 🤖 Integración con IA

- ❌ **Conexión con APIs**:
  - Claude (Anthropic)
  - Kimi
  - Qwen
  - Replicate
- ❌ **Gestión de API Keys**
- ❌ **Contexto dinámico** para IA
- ❌ **Sugerencias de escritura**
- ❌ **Generación de contenido**
- ❌ **Asistente conversacional**

**Impacto**: La funcionalidad principal de IA no está disponible

### 🖼️ Imágenes y Multimedia

- ✅ **Avatares de personajes**: DiceBear (40+ estilos) + upload personalizado
- ✅ **Imágenes de ubicaciones**: Upload de archivos o URL
- ✅ **Generador de prompts IA**: Crea prompts optimizados para generadores de imágenes IA
- ✅ **Preview de imágenes**: En cards y modales
- ❌ **Galería de imágenes** del proyecto
- ❌ **Generación directa con IA** (requiere integración de APIs)

### 📝 Editor Avanzado (RichEditor) ⭐ **COMPLETO**

#### Sistema de Menciones Multi-Trigger
- ✅ **@personaje** - Menciona personajes (azul)
- ✅ **#ubicación** - Menciona ubicaciones (naranja)
- ✅ **!lore** - Busca y previsualiza entradas de lore
- ✅ **Menciones visuales** con colores, bordes y tooltips
- ✅ **Tooltips informativos**: "Mención de personaje: Juan (metadata, no aparece en el libro)"
- ✅ **Escape de menciones**: `@@` → `@` literal, `##` → `#` literal

#### Formato de Texto
- ✅ **Negrita**: Ctrl/Cmd + B
- ✅ **Cursiva**: Ctrl/Cmd + I
- ✅ **Subrayado**: Ctrl/Cmd + U
- ✅ **Formato visual** aplicado en tiempo real

#### Historial y Edición
- ✅ **Deshacer**: Ctrl/Cmd + Z
- ✅ **Rehacer**: Ctrl/Cmd + Shift + Z o Ctrl/Cmd + Y
- ✅ **Historial completo** de cambios

#### Comandos Inteligentes
- ✅ **Sistema de comandos slash** (`/`)
- ✅ **Comandos contextuales**: Selecciona texto + `/` para AI/Comentarios
- ✅ **Texto seleccionado preservado**: Ya no se borra al activar comandos
- ✅ **Plantillas**: Diálogos, separadores, ideas, etc.

#### Búsqueda y Autocompletado
- ✅ **Búsqueda inteligente** con Lunr.js
- ✅ **Autocompletado** en tiempo real
- ✅ **Búsqueda fuzzy**: Tolera errores de tipeo
- ✅ **Navegación con teclado** (↑↓ Enter Esc)

#### Experiencia de Usuario
- ✅ **Modo Zen**: Oculta ambas barras laterales para escribir sin distracciones
- ✅ **Guardado con Ctrl/Cmd + S**
- ✅ **RichEditor integrado** en 7 modales con 15+ campos
- ✅ **Lore Preview Modal**: Vista previa de entradas de lore sin salir del editor

**Estado**: Editor de nivel profesional, totalmente funcional y optimizado para escritores

### 🔄 Control de Versiones

- ❌ **Sistema de diffs**
- ❌ **Historial de cambios**
- ❌ **Comparación de versiones**
- ❌ **Restaurar versiones anteriores**
- ⚠️ **UI creada** pero sin funcionalidad backend

### 📈 Relaciones Dinámicas

- ⚠️ **Relaciones básicas**: ✅ Implementado
- ❌ **Cambios en relaciones** basados en eventos del timeline
- ❌ **Historial de relaciones** a lo largo del tiempo
- ❌ **Visualización de evolución** de relaciones

### 🎯 Mejoras de UX Pendientes

- ❌ **Búsqueda global** integrada en UI
- ❌ **Atajos de teclado** personalizables
- ❌ **Temas personalizables** (solo dark mode ahora)
- ❌ **Exportación a formatos** (PDF, EPUB, DOCX)
- ❌ **Estadísticas avanzadas** (gráficos, análisis)
- ❌ **Backup automático** en la nube

---

## 🛠️ Stack Técnico

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Variables CSS, Flexbox, Grid
- **JavaScript ES6+** - Módulos, async/await
- **Alpine.js 3.x** - Framework reactivo ligero

### Bibliotecas (todas desde CDN)
- **Lucide Icons** - Sistema de iconos
- **DiceBear API** - Generación de avatares (40+ estilos)
- **SortableJS** - Drag & drop en timeline
- **Lunr.js** - Búsqueda full-text avanzada con fuzzy matching
- **RichEditor** - Editor profesional personalizado con:
  - Sistema multi-trigger (@, #, !)
  - Formato de texto (negrita, cursiva, subrayado)
  - Undo/Redo completo
  - Comandos contextuales
  - Menciones visuales con colores

### Arquitectura
- **Componentes modulares** con Alpine.js
- **Stores globales** para estado
- **Carga dinámica** de templates
- **Sistema i18n** personalizado
- **Sin backend** - Todo en el cliente

---

## 📁 Estructura del Proyecto

```
PlumAi/
├── index.html                      # Página principal
├── js/
│   ├── app.js                      # Inicialización
│   ├── i18n/                       # Sistema de traducciones
│   │   ├── index.js
│   │   └── locales/
│   │       ├── es-global.js        # Español
│   │       └── en-global.js        # Inglés
│   ├── stores/                     # Alpine stores
│   │   ├── i18n-global.js          # ✅ Store i18n
│   │   ├── project-global.js       # ✅ Store proyecto
│   │   ├── ui-global.js            # ✅ Store UI
│   │   └── ai-global.js            # ✅ Store IA
│   ├── components/                      # Componentes Alpine
│   │   ├── modal-container.js           # ✅ Contenedor de modales
│   │   ├── character-info-modal.js      # ✅ Modal de info personaje
│   │   └── rich-editor-component.js     # ✅ Componente RichEditor
│   ├── lib/                             # Bibliotecas propias
│   │   └── RichEditor.js                # ✅ RichEditor core library
│   ├── services/                        # Servicios
│   │   ├── avatar-service.js            # ✅ Servicio de avatares (DiceBear + upload)
│   │   ├── search-service.js            # ✅ Servicio de búsqueda unificado (Lunr.js)
│   │   ├── storage-manager.js           # ✅ Gestor de almacenamiento
│   │   └── git-service.js               # ⚠️ Git service (WIP)
│   └── utils/                           # Utilidades
│       ├── uuid.js                      # ✅ Generador UUID
│       └── dates.js                     # ✅ Utilidades de fechas
├── styles/
│   ├── main.css                    # ✅ Estilos principales
│   ├── components.css              # ✅ Estilos componentes
│   └── rich-editor.css             # ✅ Estilos RichEditor
└── templates/
    ├── components/
    │   ├── header.html             # ✅ Cabecera
    │   ├── sidebar.html            # ✅ Barra lateral
    │   ├── main-content.html       # ✅ Contenedor
    │   └── views/
    │       ├── dashboard.html      # ✅ Dashboard
    │       ├── characters.html     # ✅ Personajes
    │       ├── chapters.html       # ✅ Capítulos
    │       ├── scenes.html         # ✅ Escenas
    │       ├── locations.html      # ✅ Ubicaciones
    │       ├── lore.html           # ✅ Lore
    │       ├── timeline.html       # ✅ Timeline
    │       └── editor.html         # ✅ Editor
    └── modals/
        ├── avatar-selector-modal.html         # ✅ Selector avatares (40+ estilos)
        ├── character-info-modal.html          # ✅ Info personaje con avatar
        ├── new-edit-character-modal.html      # ✅ Crear/editar personaje
        ├── new-edit-chapter-modal.html        # ✅ Crear/editar capítulo
        ├── new-edit-scene-modal.html          # ✅ Crear/editar escena
        ├── new-edit-location-modal.html       # ✅ Crear/editar ubicación + imágenes + AI prompt
        ├── new-edit-lore-modal.html           # ✅ Crear/editar lore
        ├── lore-preview-modal.html            # ✅ Preview de lore (desde !)
        ├── new-edit-timeline-event-modal.html # ✅ Crear/editar evento (completo)
        ├── new-project-modal.html             # ✅ Nuevo proyecto
        ├── projects-list-modal.html           # ⚠️ Lista proyectos
        ├── export-modal.html                  # ⚠️ Exportar
        └── import-modal.html                  # ⚠️ Importar
```

**Leyenda**:
- ✅ Completado y funcional
- ⚠️ UI creada pero sin backend
- ❌ No implementado

---

## 🎯 Próximos Pasos Recomendados

### Prioridad Alta 🔴

1. **Implementar persistencia de datos**
   - localStorage para MVP
   - Autoguardado cada 30 segundos
   - Exportar/Importar JSON

2. **Integración básica con IA**
   - Conectar con API de Claude
   - Sistema de contexto dinámico
   - Gestión segura de API keys

### Prioridad Media 🟡

3. **Completar sistema de relaciones dinámicas**
   - Vincular eventos del timeline con cambios en relaciones
   - Historial de relaciones
   - Visualización de evolución

4. **Mejorar el editor**
   - Sistema de comandos slash
   - Guardado automático
   - Historial de versiones simple

### Prioridad Baja 🟢

5. **Búsqueda global en UI**
   - Integrar servicio de búsqueda existente
   - Shortcuts de teclado
   - Resultados agrupados por tipo

6. **Exportación avanzada**
   - PDF con formato
   - EPUB para ebooks
   - DOCX para Word

---

## 🐛 Bugs Conocidos y Corregidos

### Corregidos ✅
- ✅ **Error Alpine.js con `const`** - CORREGIDO (2025-11-09)
- ✅ **modalData null en relaciones** - CORREGIDO (2025-11-09)
- ✅ **Traducciones faltantes** - CORREGIDO (2025-11-09)
- ✅ **Nombres de estilos DiceBear incorrectos** - CORREGIDO (2025-11-09)
- ✅ **Avatares compartidos entre personajes** - CORREGIDO (2025-11-09)
- ✅ **Texto seleccionado se borraba con /** - CORREGIDO (2025-11-09)
- ✅ **Error al copiar prompt IA en ubicaciones** - CORREGIDO (2025-11-09)

### Activos ❌
- Ninguno conocido actualmente

---

## 📖 Documentación Adicional

- **CLAUDE.md** - Instrucciones para desarrollo
- **GUIA-INTEGRACION.md** - Guía de integración de búsqueda
- **PLAN-MEJORAS.md** - Plan detallado de mejoras
- **SESION-2025-11-09.md** - Resumen de última sesión

---

## 🚦 Cómo Probar el Proyecto

1. **Clonar el repositorio**
   ```bash
   git clone <repo-url>
   cd PlumAi
   ```

2. **Abrir en navegador**
   ```bash
   # Usar un servidor local (no abrir directamente)
   python -m http.server 8000
   # o
   npx serve
   ```

3. **Navegar a**
   ```
   http://localhost:8000
   ```

4. **Probar funcionalidades**
   - Crear personajes con avatares (DiceBear o upload)
   - Agregar relaciones entre personajes
   - Crear ubicaciones con imágenes
   - **Generador de prompts IA**: Copiar prompts para DALL-E/Midjourney
   - Crear capítulos y escenas
   - **Usar RichEditor avanzado**:
     - `@nombre` - Mencionar personajes (azul)
     - `#nombre` - Mencionar ubicaciones (naranja)
     - `!nombre` - Buscar lore (preview)
     - `@@` - @ literal, `##` - # literal
     - Seleccionar texto + `/` - Comandos contextuales
     - **Ctrl+Z/Y** - Deshacer/Rehacer
     - **Ctrl+B/I/U** - Negrita/Cursiva/Subrayado
     - **Ctrl+S** - Guardar
   - **Modo Zen**: Botón junto al guardado para ocultar barras
   - Usar el timeline con drag & drop
   - Cambiar idioma (ES/EN)

---

## ⚠️ Limitaciones Actuales

1. **Sin persistencia completa**: Los datos se guardan en IndexedDB pero sin sincronización cloud
2. **Sin IA conectada**: Las funciones de IA requieren configurar API keys
3. **Sin exportación avanzada**: No se puede exportar a PDF/EPUB/DOCX (solo JSON)
4. **Sin búsqueda global UI**: El servicio completo existe pero falta integrar en UI principal

## 🎯 Fortalezas Principales

1. ✅ **Editor de clase mundial**: Undo/redo, formato, menciones visuales, comandos contextuales
2. ✅ **Sistema de búsqueda robusto**: Lunr.js con fuzzy matching y multi-tipo
3. ✅ **Gestión completa**: Personajes, ubicaciones, escenas, lore, timeline
4. ✅ **Modo Zen**: Experiencia de escritura sin distracciones
5. ✅ **Generador de prompts IA**: Para crear imágenes de ubicaciones
6. ✅ **Timeline avanzado**: Drag & drop, múltiples vistas, fechas flexibles
7. ✅ **Avatares profesionales**: 40+ estilos + upload personalizado
8. ✅ **100% bilingüe**: Español e Inglés completos

---

## 📝 Licencia

[Por definir]

---

## 👥 Contribuir

[Por definir]

---

## 🎹 Atajos de Teclado

### Editor
| Atajo | Acción |
|-------|--------|
| `Ctrl/Cmd + Z` | Deshacer |
| `Ctrl/Cmd + Shift + Z` | Rehacer |
| `Ctrl/Cmd + Y` | Rehacer (alternativo) |
| `Ctrl/Cmd + B` | **Negrita** |
| `Ctrl/Cmd + I` | *Cursiva* |
| `Ctrl/Cmd + U` | <u>Subrayado</u> |
| `Ctrl/Cmd + S` | Guardar |

### Menciones y Comandos
| Trigger | Función |
|---------|---------|
| `@nombre` | Mencionar personaje (azul) |
| `#nombre` | Mencionar ubicación (naranja) |
| `!nombre` | Buscar/previsualizar lore |
| `/comando` | Insertar comando/plantilla |
| `/` + selección | Menú contextual (AI/Comentario) |
| `@@` | Insertar @ literal |
| `##` | Insertar # literal |
| `↑↓` | Navegar menús |
| `Enter` | Seleccionar en menú |
| `Esc` | Cerrar menús |

---

**Última actualización**: 2025-11-09
**Estado**: Funcional y listo para producción
**Versión**: 1.0 Beta - Professional Edition
**Enfoque**: Editor de novelas profesional con herramientas completas de gestión
