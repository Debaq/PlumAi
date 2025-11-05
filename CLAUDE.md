# Instrucciones para Claude - Proyecto PlumaAI

## Contexto del Proyecto

PlumaAI es un **editor de novelas con inteligencia artificial** que permite a los escritores crear, organizar y escribir sus historias con la ayuda de diferentes modelos de IA (Claude, Kimi, Replicate, Qwen).

**Stack Técnico:**
- **Frontend**: HTML5, CSS3, JavaScript ES6+ Modules
- **Framework**: Alpine.js 3.x (reactivo, ligero)
- **Estilo**: Dark mode minimalista y moderno
- **Multiidioma**: Sistema i18n propio (ES/EN)
- **Storage**: IndexedDB + localStorage
- **Sin backend**: Todo funciona en el cliente

## Principios Importantes

### 1. Internacionalización (i18n)

**⚠️ NUNCA HARDCODEAR TEXTOS ⚠️**

Todos los textos visibles deben usar el sistema de traducción:

```javascript
// ❌ MAL
x-text="'Dashboard'"
<button>Save</button>

// ✅ BIEN
x-text="$store.i18n.t('dashboard.title')"
<button x-text="$store.i18n.t('common.save')"></button>

// Con parámetros
x-text="$store.i18n.t('chapters.stats.words', {count: chapter.wordCount})"
```

**Agregar nuevos textos:**
1. Agregar la key en `js/i18n/locales/es.js`
2. Agregar la traducción en `js/i18n/locales/en.js`
3. Usar con `$store.i18n.t('section.key')`

### 2. Estilo y Diseño

**Colores (CSS Variables):**
- `--bg-primary`: #1a1a1a (fondo principal)
- `--bg-secondary`: #252525 (panels)
- `--bg-tertiary`: #2f2f2f (hover states)
- `--text-primary`: #e0e0e0 (texto principal)
- `--text-secondary`: #a0a0a0 (texto secundario)
- `--accent`: #4a90e2 (color de acento)
- `--success`: #4caf50
- `--warning`: #ff9800
- `--error`: #f44336

**Usar clases existentes:**
- `.btn-primary`, `.btn-secondary`, `.btn-icon`
- `.card`, `.stat-card`, `.character-card`, `.scene-card`
- `.modal`, `.modal-content`, `.modal-header`
- `.form-group`, `.form-divider`

**No crear CSS inline ni estilos nuevos sin necesidad**

### 3. Alpine.js - Arquitectura

**Stores Globales:**
- `$store.i18n` - Traducciones
- `$store.ui` - Estado de UI (modales, vistas, loading)
- `$store.project` - Datos del proyecto (personajes, capítulos, escenas)
- `$store.ai` - Estado de IA (keys, contexto, historial)

**Componentes:**
Los componentes Alpine se definen como funciones que retornan objetos:

```javascript
// js/components/example.js
export default function exampleComponent() {
    return {
        // Estado local
        count: 0,

        // Métodos
        increment() {
            this.count++;
        },

        // Lifecycle
        init() {
            console.log('Component initialized');
        }
    }
}
```

**Usar en HTML:**
```html
<div x-data="exampleComponent">
    <span x-text="count"></span>
    <button @click="increment" x-text="$store.i18n.t('common.increment')"></button>
</div>
```

### 4. Gestión de Estado

**Para datos del proyecto:**
```javascript
// Usar el store project
$store.project.addCharacter({
    name: 'Juan',
    role: 'protagonist'
});

$store.project.updateChapter(id, { title: 'Nuevo título' });
```

**Para UI:**
```javascript
// Abrir modal
$store.ui.openModal('newCharacter', { characterId: '123' });

// Cerrar modal
$store.ui.closeModal('newCharacter');

// Mostrar notificación
$store.ui.success('Título', 'Mensaje de éxito');
$store.ui.error('Error', 'Mensaje de error');
```

### 5. Estructura de Archivos

```
js/
├── app.js                    # Inicialización principal
├── i18n/                     # Sistema de traducciones
│   ├── index.js
│   └── locales/
│       ├── es.js             # Español
│       └── en.js             # Inglés
├── stores/                   # Alpine stores (estado global)
│   ├── i18n.js               # ✓ Completado
│   ├── project.js            # TODO
│   ├── ui.js                 # TODO
│   └── ai.js                 # TODO
├── components/               # Alpine components
│   ├── header.js             # TODO
│   ├── sidebar.js            # TODO
│   ├── statusBar.js          # TODO
│   ├── toast.js              # TODO
│   ├── modals.js             # TODO
│   ├── dashboard.js          # TODO
│   ├── characters.js         # TODO
│   ├── scenes.js             # TODO
│   ├── chapters.js           # TODO
│   └── timeline.js           # TODO
├── services/                 # Lógica de negocio
│   ├── storage.js            # TODO - IndexedDB/localStorage
│   ├── ai-service.js         # TODO - Integración APIs IA
│   ├── export-service.js     # TODO - Export/Import JSON
│   └── diff-service.js       # TODO - Control de versiones
└── utils/                    # Utilidades
    ├── uuid.js               # TODO
    └── dates.js              # TODO
```

## Flujo de Trabajo para Desarrollo

### Crear un nuevo componente:

1. **Crear archivo en `js/components/`**
```javascript
// js/components/myComponent.js
export default function myComponent() {
    return {
        // Estado local del componente
        localData: [],

        // Inicialización
        init() {
            // Acceder a stores globales
            this.loadData();
        },

        // Métodos
        async loadData() {
            this.localData = $store.project.characters;
        },

        handleAction() {
            // Usar traducciones
            const message = this.$store.i18n.t('notifications.success.saved');
            this.$store.ui.success('Success', message);
        }
    }
}
```

2. **Registrar en `app.js`**
```javascript
import myComponent from './components/myComponent.js';
Alpine.data('myComponent', myComponent);
```

3. **Usar en HTML**
```html
<div x-data="myComponent">
    <!-- Contenido del componente -->
</div>
```

### Agregar traducciones:

1. **En `js/i18n/locales/es.js`:**
```javascript
mySection: {
    title: 'Mi Sección',
    actions: {
        save: 'Guardar',
        delete: 'Eliminar'
    }
}
```

2. **En `js/i18n/locales/en.js`:**
```javascript
mySection: {
    title: 'My Section',
    actions: {
        save: 'Save',
        delete: 'Delete'
    }
}
```

3. **Usar:**
```html
<h1 x-text="$store.i18n.t('mySection.title')"></h1>
<button x-text="$store.i18n.t('mySection.actions.save')"></button>
```

## Convenciones de Código

### Nomenclatura:
- **Componentes**: camelCase - `headerComponent`, `sidebarComponent`
- **Stores**: camelCase - `i18n`, `project`, `ui`, `ai`
- **Archivos**: kebab-case - `sidebar-component.js`, `ai-service.js`
- **CSS Classes**: kebab-case - `.stat-card`, `.character-header`
- **Keys i18n**: camelCase/dot notation - `dashboard.stats.words`

### Comentarios:
```javascript
// Comentarios en español para explicar lógica compleja
// Mantener el código limpio y legible

/**
 * Función que procesa los personajes
 * @param {Array} characters - Lista de personajes
 * @returns {Array} Personajes procesados
 */
```

### Manejo de Errores:
```javascript
try {
    // Código que puede fallar
    await $store.project.saveProject();
    $store.ui.success(
        $store.i18n.t('notifications.success.projectSaved'),
        ''
    );
} catch (error) {
    console.error('Error saving project:', error);
    $store.ui.error(
        $store.i18n.t('notifications.error.saveProject'),
        error.message
    );
}
```

## Patrones Comunes

### Modal Pattern:
```javascript
// Abrir modal para crear
openCreateModal() {
    this.$store.ui.openModal('newCharacter');
},

// Abrir modal para editar
openEditModal(id) {
    const character = this.$store.project.getCharacter(id);
    this.$store.ui.openModal('editCharacter', character);
},

// Guardar desde modal
async saveCharacter(formData) {
    try {
        if (this.$store.ui.modalData?.id) {
            // Editar existente
            this.$store.project.updateCharacter(
                this.$store.ui.modalData.id,
                formData
            );
        } else {
            // Crear nuevo
            this.$store.project.addCharacter(formData);
        }

        this.$store.ui.closeModal();
        this.$store.ui.success(
            this.$store.i18n.t('notifications.success.characterSaved'),
            ''
        );
    } catch (error) {
        this.$store.ui.error('Error', error.message);
    }
}
```

### Lista con Empty State:
```html
<div x-show="$store.project.characters.length === 0" class="empty-state">
    <p x-text="$store.i18n.t('characters.empty')"></p>
    <span class="hint" x-text="$store.i18n.t('characters.emptyHint')"></span>
</div>

<div x-show="$store.project.characters.length > 0" class="content-grid">
    <template x-for="character in $store.project.characters" :key="character.id">
        <div class="character-card" @click="openEditModal(character.id)">
            <!-- Contenido del card -->
        </div>
    </template>
</div>
```

## Estado Actual del Proyecto

**✅ Completado:**
- HTML estructura base
- CSS dark mode completo y responsive
- Sistema i18n completo (ES/EN)
- Estructura de directorios
- **Stores Alpine.js**: i18n, project, ui, ai (funcionando)
- **Componentes**: editor-enhanced.js con sistema de comandos
- **Utilidades**: uuid, dates (básicos)
- **Editor Avanzado**:
  - Sistema de comandos slash (`/`) con menú interactivo
  - Sistema de menciones (`@`) para personajes
  - Modal de información de personaje
  - Sistema de comentarios flotantes
  - Guardado automático
  - Contador de palabras en tiempo real
  - Panel lateral contextual con personajes e IA
  - Navegación con teclado (↑↓ Enter Esc)
- **Vistas**: Dashboard, Personajes, Capítulos, Escenas, Ubicaciones, Timeline, Editor
- **CRUD completo**: Personajes, Capítulos, Escenas, Ubicaciones, Timeline

**🔴 Pendiente/Incompleto:**
- [ ] **Bug crítico**: Enter no funciona correctamente en comandos slash
- [ ] **Persistencia**: No se guarda en localStorage/IndexedDB
- [ ] **Múltiples proyectos**: Solo soporta un proyecto a la vez
- [ ] **Exportar/Importar**: Funcionalidad no implementada
- [ ] **Integración IA**: No hay conexión real con APIs (Claude, Kimi, etc.)
- [ ] **Control de versiones**: Sistema de diffs no implementado
- [ ] **Servicios pendientes**:
  - [ ] storage.js (localStorage + IndexedDB)
  - [ ] ai-service.js (integración APIs)
  - [ ] export-service.js (JSON export/import)
  - [ ] diff-service.js (control de versiones)
- [ ] **Editor mejorado**:
  - [ ] Ordenamiento por relevancia de personajes (en escena > capítulo > todos)
  - [ ] Selector de escenas en comandos
  - [ ] Selector de ubicaciones en comandos
  - [ ] Snippets personalizados
  - [ ] Historial de comentarios
  - [ ] Modo sin distracciones (fullscreen)
  - [ ] Atajos de teclado personalizables

## Referencias Importantes

- **Plan completo**: Ver `plan-editor-novelas-ia.md`
- **Guía Alpine.js**: Ver `ALPINE-GUIA.md` - ⭐ **Lecciones aprendidas y mejores prácticas**
- **Alpine.js docs**: https://alpinejs.dev
- **Traducciones**: `js/i18n/locales/`
- **Estilos**: `styles/main.css` y `styles/components.css`

## Notas Finales

- **Prioridad**: Funcionalidad sobre complejidad
- **UX**: Siempre pensar en la experiencia del usuario
- **Performance**: Lazy loading cuando sea necesario
- **Accesibilidad**: Usar etiquetas semánticas y aria-labels
- **Seguridad**: Las API keys nunca deben salir del cliente
- **Testing**: Probar en diferentes navegadores (Chrome, Firefox, Safari)

---

**Última actualización:** 2025-11-05
**Versión:** 1.0
