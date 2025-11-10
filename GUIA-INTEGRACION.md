# 🔌 Guía de Integración: Sistema de Búsqueda Unificado

Esta guía explica cómo integrar el **SearchService** y **RichEditor** en tu aplicación PlumaAI existente.

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Archivos Creados](#archivos-creados)
3. [Integración Paso a Paso](#integración-paso-a-paso)
4. [Cómo Funciona](#cómo-funciona)
5. [Alimentar la Base de Datos](#alimentar-la-base-de-datos)
6. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎯 Visión General

### ¿Qué problema resuelve?

**ANTES:** Tu `editor-enhanced.js` tenía menciones básicas que solo mostraban personajes hardcodeados.

**AHORA:** El editor busca en **TODA** tu base de datos en tiempo real:
- 👥 Personajes
- 🎬 Escenas
- 📍 Ubicaciones
- 📅 Timeline
- 📖 Capítulos

### ¿Cómo funciona?

```
┌─────────────────┐
│  Alpine Store   │  (project, characters, scenes...)
│  (Datos)        │
└────────┬────────┘
         │ ① Se alimenta automáticamente
         ▼
┌─────────────────┐
│ SearchService   │  Indexa con Lunr.js
│ (Búsqueda)      │
└────────┬────────┘
         │ ② Busca en tiempo real
         ▼
┌─────────────────┐
│  RichEditor     │  Muestra resultados cuando escribes @
│  (Editor)       │
└─────────────────┘
```

---

## 📦 Archivos Creados

### 1. **SearchService** (`js/services/search-service.js`)
Servicio que indexa TODA tu información con Lunr.js

**Funciones principales:**
- `initialize(projectData)` - Crea el índice con tus datos
- `search(query, options)` - Busca en todo
- `searchCharacters(query)` - Solo personajes
- `searchScenes(query)` - Solo escenas
- `update(projectData)` - Actualiza el índice

### 2. **RichEditor** (`js/lib/RichEditor.js`)
Librería de editor vanilla JavaScript (reemplaza editor-enhanced.js)

**Características:**
- Menciones con `@`
- Comandos con `/`
- Integración automática con SearchService
- Compatible con Alpine.js

### 3. **Editor Alpine Component** (`js/components/editor-alpine.js`)
Componente Alpine.js que conecta todo

**Características:**
- Inicializa SearchService automáticamente
- Actualiza el índice cuando cambian los datos
- Auto-guardado
- Stats en tiempo real

### 4. **Estilos** (`styles/rich-editor.css`)
CSS del editor con dark mode

### 5. **Demos**
- `demo-search-integrated.html` - Demo completo funcional
- `ejemplo-richeditor.html` - Ejemplos de uso

---

## 🚀 Integración Paso a Paso

### Paso 1: Agregar Scripts al HTML Principal

Edita tu `index.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- ... tus estilos existentes ... -->

    <!-- NUEVO: Estilos del RichEditor -->
    <link rel="stylesheet" href="styles/rich-editor.css">
</head>
<body>
    <!-- ... tu app ... -->

    <!-- Scripts existentes -->
    <script src="js/lib/lunr.min.js"></script>

    <!-- NUEVO: SearchService (antes de Alpine) -->
    <script src="js/services/search-service.js"></script>

    <!-- NUEVO: RichEditor (antes de Alpine) -->
    <script src="js/lib/RichEditor.js"></script>

    <!-- Alpine.js -->
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <!-- NUEVO: Editor Alpine Component (después de Alpine) -->
    <script src="js/components/editor-alpine.js"></script>

    <!-- Tu app.js existente -->
    <script src="js/app.js"></script>
</body>
</html>
```

### Paso 2: Registrar el Componente en Alpine

En tu `js/app.js`, registra el nuevo componente:

```javascript
// Después de definir los stores
document.addEventListener('alpine:init', () => {
    // ... tus stores existentes ...

    // NUEVO: Registrar componente del editor
    Alpine.data('editorAlpineComponent', editorAlpineComponent);
});
```

### Paso 3: Actualizar la Vista del Editor

En `templates/components/views/editor.html` (o donde tengas tu editor):

**ANTES:**
```html
<div x-data="editorEnhancedComponent">
    <textarea class="editor-textarea" ...></textarea>
</div>
```

**DESPUÉS:**
```html
<div x-data="editorAlpineComponent">
    <!-- Contenedor del editor -->
    <div class="editor-container"></div>

    <!-- Stats (opcional) -->
    <div class="editor-stats">
        <span x-text="'Palabras: ' + wordCount"></span>
        <span x-text="'Caracteres: ' + charCount"></span>
        <span x-show="saveStatus === 'saving'">Guardando...</span>
        <span x-show="saveStatus === 'saved'">✓ Guardado</span>
    </div>
</div>
```

### Paso 4: Inicializar SearchService Globalmente

En tu `js/app.js`, después de que Alpine esté listo:

```javascript
document.addEventListener('alpine:initialized', () => {
    // Inicializar SearchService con los datos actuales
    if (window.searchService && Alpine.store('project')) {
        window.searchService.initialize({
            characters: Alpine.store('project').characters,
            scenes: Alpine.store('project').scenes,
            locations: Alpine.store('project').locations,
            timeline: Alpine.store('project').timeline,
            chapters: Alpine.store('project').chapters
        });

        console.log('✅ SearchService inicializado');
    }
});
```

---

## 🔍 Cómo Funciona

### 1. Cuando el usuario escribe `@`

```javascript
// Usuario escribe: "@jua"

// RichEditor detecta el @ y llama a searchFunction
editor.searchFunction("jua")

// SearchService busca en el índice de Lunr.js
searchService.search("jua", { limit: 10 })

// Lunr.js busca en TODOS los campos:
// - characters.name
// - scenes.title
// - locations.name
// - etc.

// Devuelve resultados ordenados por relevancia:
[
    { type: 'character', label: 'Juan Pérez', icon: '👤', ... },
    { type: 'location', label: 'Juancito (Pueblo)', icon: '📍', ... }
]

// RichEditor muestra el menú con los resultados
```

### 2. Cuando los datos cambian

```javascript
// Usuario agrega un nuevo personaje
Alpine.store('project').addCharacter({ name: 'Nuevo Personaje' })

// El componente detecta el cambio (con $watch)
this.$watch('$store.project.characters', () => {
    this.updateSearchIndex()
})

// Se actualiza el índice de Lunr.js
searchService.update({
    characters: Alpine.store('project').characters,
    // ... resto de datos
})

// ¡Ya está disponible para búsqueda!
```

---

## 🍽️ Alimentar la Base de Datos

### Opción 1: Alimentación Automática (Recomendado)

El componente `editorAlpineComponent` **ya hace esto automáticamente**:

```javascript
// En editor-alpine.js (YA INCLUIDO)
init() {
    // Inicializa con datos actuales
    this.initializeSearchService();

    // Watch para actualizaciones automáticas
    this.$watch('$store.project.characters', () => this.updateSearchIndex());
    this.$watch('$store.project.scenes', () => this.updateSearchIndex());
    // etc...
}
```

### Opción 2: Actualización Manual

Si necesitas actualizar manualmente:

```javascript
// Después de agregar/editar/eliminar datos
window.searchService.update({
    characters: Alpine.store('project').characters,
    scenes: Alpine.store('project').scenes,
    locations: Alpine.store('project').locations,
    timeline: Alpine.store('project').timeline,
    chapters: Alpine.store('project').chapters
});
```

### Opción 3: Actualización Selectiva

Si solo cambió un tipo de datos:

```javascript
// Solo actualizar personajes (más eficiente)
window.searchService.initialize({
    characters: Alpine.store('project').characters,
    scenes: Alpine.store('project').scenes,
    // ... resto permanece igual
});
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Uso Básico en el Editor

```javascript
// El usuario escribe en el editor:
"Juan se encontró con @"

// Aparece menú de sugerencias automáticamente
// Usuario escribe: "@mar"

// Resultados:
// 👤 María García (Antagonista)
// 📍 Mar del Norte (Ubicación)

// Usuario selecciona "María García"
// Texto resultante: "Juan se encontró con @María García "
```

### Ejemplo 2: Comandos Personalizados

```javascript
// El usuario escribe:
"/"

// Aparece menú de comandos:
// 👥 /personajes - Ver personajes
// 🎬 /escenas - Ver escenas
// 💡 /idea - Marcar una idea
// 💬 /dialogo - Formato de diálogo

// Usuario selecciona /idea
// Texto resultante: "💡 IDEA: "
```

### Ejemplo 3: Búsqueda Manual

```javascript
// En cualquier parte de tu app
const results = window.searchService.search('batalla');

// Resultados:
// [
//   { type: 'scene', label: 'La Gran Batalla', ... },
//   { type: 'location', label: 'Campo de Batalla', ... },
//   { type: 'character', label: 'General Batalla', ... }
// ]
```

### Ejemplo 4: Búsqueda Específica

```javascript
// Solo buscar personajes
const characters = window.searchService.searchCharacters('juan');

// Solo buscar escenas
const scenes = window.searchService.searchScenes('batalla');

// Solo buscar ubicaciones
const locations = window.searchService.searchLocations('casa');
```

---

## 🎨 Personalización

### Personalizar Comandos

Edita en `js/components/editor-alpine.js`:

```javascript
getCommands() {
    return [
        {
            id: 'mi-comando',
            label: '/micomando',
            description: 'Mi comando personalizado',
            icon: '🎯',
            template: 'Texto a insertar'
        },
        {
            id: 'accion',
            label: '/accion',
            description: 'Ejecutar acción',
            icon: '⚡',
            action: () => {
                // Tu código aquí
                alert('Acción ejecutada!');
            }
        }
    ];
}
```

### Personalizar Campos Indexados

Edita en `js/services/search-service.js`:

```javascript
buildCharacterContent(char) {
    const parts = [
        char.name,
        char.description,
        char.role,
        // AGREGAR MÁS CAMPOS:
        char.alianzas,
        char.habilidades,
        char.equipo
    ];
    return parts.filter(p => p).join(' ');
}
```

### Personalizar Pesos de Búsqueda

Edita en `js/services/search-service.js`:

```javascript
this.idx = lunr(function () {
    this.ref('id');

    // Ajustar pesos (boost)
    this.field('label', { boost: 20 });  // Más peso = más importante
    this.field('name', { boost: 15 });
    this.field('description', { boost: 5 });
    this.field('content', { boost: 1 });
});
```

---

## 🐛 Troubleshooting

### Problema: "SearchService no encontrado"

**Solución:** Asegúrate de cargar `search-service.js` ANTES de Alpine:

```html
<script src="js/services/search-service.js"></script>
<script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

### Problema: "No aparecen resultados al buscar"

**Solución:** Verifica que el índice esté inicializado:

```javascript
console.log('¿Está listo?', window.searchService.isReady());
console.log('Stats:', window.searchService.getStats());
```

### Problema: "Los nuevos datos no aparecen en búsqueda"

**Solución:** Fuerza una actualización:

```javascript
// Después de agregar datos
window.searchService.update(Alpine.store('project'));
```

### Problema: "El editor no se muestra"

**Solución:** Verifica que el contenedor exista:

```html
<!-- Debe existir este elemento -->
<div class="editor-container"></div>
```

---

## 📊 Monitoreo y Debug

### Ver estadísticas del índice

```javascript
// En la consola del navegador
console.log(window.searchService.getStats());
// Output: { character: 5, scene: 3, location: 4, timeline: 2 }
```

### Probar búsqueda

```javascript
// Búsqueda general
window.searchService.search('juan');

// Búsqueda específica
window.searchService.searchCharacters('juan');

// Con opciones
window.searchService.search('batalla', {
    limit: 5,
    types: ['scene', 'location'],
    minScore: 0.5
});
```

### Ver documento por ID

```javascript
const doc = window.searchService.getDocument('character-char1');
console.log(doc);
```

---

## 🚀 Próximos Pasos

1. ✅ **Integrar en tu app** siguiendo esta guía
2. 🎨 **Personalizar comandos** según tus necesidades
3. 📊 **Agregar más tipos de datos** (notas, tags, etc.)
4. 💾 **Persistencia** (guardar índice en localStorage)
5. 🤖 **IA** (usar búsqueda para contexto de IA)

---

## 📝 Notas Importantes

- **Sin Build:** Todo funciona sin npm ni webpack
- **Rendimiento:** Lunr.js puede indexar miles de documentos sin problemas
- **Memoria:** El índice se crea en RAM, se recomienda regenerar al cargar la app
- **Idiomas:** Lunr.js soporta español, pero puedes configurarlo
- **Actualización:** El índice se actualiza automáticamente con Alpine watchers

---

¿Dudas? Revisa los demos en:
- `demo-search-integrated.html` - Demo completo funcional
- `ejemplo-richeditor.html` - Ejemplos de uso
