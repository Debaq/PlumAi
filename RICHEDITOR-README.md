# 🪶 RichEditor - Librería de Editor de Texto Enriquecido

Librería vanilla JavaScript para editor de texto con **menciones (@)**, **comandos (/)** y **búsqueda con Lunr.js**.

## ✨ Características

- ✅ **Vanilla JavaScript** - Sin dependencias externas (excepto Lunr.js opcional)
- ✅ **Menciones (@)** - Autocompletado de menciones con búsqueda
- ✅ **Comandos (/)** - Sistema de comandos tipo Notion/Slack
- ✅ **Integración Lunr.js** - Búsqueda avanzada en documentos
- ✅ **Compatible Alpine.js** - Totalmente reactivo
- ✅ **Sin Build** - Funciona directo en el navegador
- ✅ **Ligero** - ~8KB sin minificar

## 📦 Instalación

### 1. Incluir archivos

```html
<!-- CSS -->
<link rel="stylesheet" href="styles/rich-editor.css">

<!-- JavaScript -->
<script src="js/lib/RichEditor.js"></script>

<!-- Opcional: Lunr.js para búsqueda avanzada -->
<script src="js/lib/lunr.min.js"></script>
```

### 2. Crear contenedor

```html
<div id="mi-editor"></div>
```

### 3. Inicializar

```javascript
const editor = new RichEditor({
    element: document.getElementById('mi-editor'),
    placeholder: 'Escribe aquí...',
    mentionData: [
        { id: '1', label: 'Juan', description: 'Protagonista' }
    ]
});
```

## 🚀 Uso Básico

### Ejemplo Simple

```javascript
const editor = new RichEditor({
    element: document.getElementById('editor'),
    placeholder: 'Escribe tu historia...',

    // Datos para menciones
    mentionData: [
        {
            id: 'char1',
            label: 'Juan Pérez',
            name: 'Juan Pérez',
            description: 'Protagonista de la historia'
        },
        {
            id: 'char2',
            label: 'María García',
            name: 'María García',
            description: 'Antagonista principal'
        }
    ],

    // Callback cuando cambia el contenido
    onContentChange: (content) => {
        console.log('Nuevo contenido:', content);
    }
});
```

### Con Comandos Personalizados

```javascript
const editor = new RichEditor({
    element: document.getElementById('editor'),

    commandData: [
        {
            id: 'custom-command',
            label: '/mi-comando',
            description: 'Mi comando personalizado',
            icon: '🎯',
            template: 'Texto a insertar'  // Opción 1: Insertar texto
        },
        {
            id: 'action-command',
            label: '/accion',
            description: 'Ejecutar una acción',
            icon: '⚡',
            action: () => {  // Opción 2: Ejecutar función
                alert('Comando ejecutado!');
            }
        }
    ]
});
```

## 🔍 Integración con Lunr.js

Para búsqueda avanzada en menciones:

```javascript
// 1. Crear datos
const documents = [
    { id: 'doc1', label: 'Documento A', content: 'Contenido del documento...' },
    { id: 'doc2', label: 'Documento B', content: 'Más contenido...' }
];

// 2. Crear índice Lunr.js
const documentsMap = {};
documents.forEach(doc => {
    documentsMap[doc.id] = doc;
});

const idx = lunr(function () {
    this.ref('id');
    this.field('label', { boost: 10 });
    this.field('content', { boost: 1 });

    documents.forEach(doc => {
        this.add(doc);
    });
});

// 3. Función de búsqueda
function searchWithLunr(query) {
    if (!query) return documents.slice(0, 5);

    try {
        let results = idx.search(query);

        // Fallback: búsqueda con comodín
        if (results.length === 0) {
            results = idx.search(query + '*');
        }

        return results.map(result => documentsMap[result.ref]);
    } catch (e) {
        return [];
    }
}

// 4. Usar en el editor
const editor = new RichEditor({
    element: document.getElementById('editor'),
    searchFunction: searchWithLunr,
    mentionData: documents
});
```

## 🎨 Integración con Alpine.js

### Ejemplo Completo

```html
<div x-data="editorComponent">
    <div id="editor"></div>

    <div class="stats">
        <span x-text="'Palabras: ' + wordCount"></span>
        <button @click="save">Guardar</button>
    </div>

    <div x-show="content" x-text="content"></div>
</div>

<script>
document.addEventListener('alpine:init', () => {
    Alpine.data('editorComponent', () => ({
        content: '',
        wordCount: 0,
        editor: null,

        init() {
            this.editor = new RichEditor({
                element: document.getElementById('editor'),
                placeholder: 'Escribe aquí...',
                initialContent: 'Contenido inicial',

                // Callback reactivo
                onContentChange: (content) => {
                    this.content = content;
                    this.wordCount = this.countWords(content);
                }
            });
        },

        countWords(text) {
            return text.trim() ? text.trim().split(/\s+/).length : 0;
        },

        save() {
            // Guardar contenido
            console.log('Guardando:', this.content);

            // Ejemplo: Enviar al store
            this.$store.project.updateChapter(this.chapterId, {
                content: this.content
            });
        },

        destroy() {
            if (this.editor) {
                this.editor.destroy();
            }
        }
    }));
});
</script>
```

## 📚 API Reference

### Constructor Options

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `element` | HTMLElement | `null` | **Requerido.** Elemento contenedor del editor |
| `placeholder` | String | `'Escribe aquí...'` | Texto placeholder |
| `readOnly` | Boolean | `false` | Editor de solo lectura |
| `initialContent` | String | `''` | Contenido inicial |
| `mentionData` | Array | `[]` | Datos para menciones |
| `commandData` | Array | `[]` | Comandos personalizados |
| `searchFunction` | Function | `null` | Función de búsqueda (Lunr.js) |
| `onContentChange` | Function | `null` | Callback al cambiar contenido |
| `onSave` | Function | `null` | Callback al guardar |

### Métodos Públicos

#### `getContent()`
Obtener contenido como texto plano.

```javascript
const content = editor.getContent();
console.log(content); // "Texto del editor"
```

#### `getHTML()`
Obtener contenido como HTML.

```javascript
const html = editor.getHTML();
console.log(html); // "<div>Texto del editor</div>"
```

#### `setContent(content)`
Establecer contenido (texto plano).

```javascript
editor.setContent('Nuevo contenido');
```

#### `setHTML(html)`
Establecer contenido (HTML).

```javascript
editor.setHTML('<p>Contenido <strong>HTML</strong></p>');
```

#### `focus()`
Enfocar el editor.

```javascript
editor.focus();
```

#### `setMentionData(data)`
Actualizar datos de menciones.

```javascript
editor.setMentionData([
    { id: '1', label: 'Nuevo personaje', description: 'Descripción' }
]);
```

#### `setCommandData(data)`
Actualizar comandos.

```javascript
editor.setCommandData([
    { id: 'cmd', label: '/comando', description: 'Desc', template: 'Texto' }
]);
```

#### `destroy()`
Destruir el editor y limpiar recursos.

```javascript
editor.destroy();
```

## 🎯 Formato de Datos

### MentionData

```javascript
{
    id: 'unique-id',           // Requerido: ID único
    label: 'Texto visible',    // Requerido: Lo que se muestra
    name: 'Nombre completo',   // Opcional: Nombre alternativo
    description: 'Descripción',// Opcional: Descripción en menú
    content: 'Contenido...'    // Opcional: Para búsqueda
}
```

### CommandData

```javascript
{
    id: 'unique-id',              // Requerido: ID único
    label: '/comando',            // Requerido: Comando con /
    description: 'Descripción',   // Requerido: Descripción
    icon: '🎯',                   // Opcional: Emoji o icono
    template: 'Texto a insertar', // Opción 1: Insertar texto
    action: () => { ... }         // Opción 2: Ejecutar función
}
```

## 🎨 Personalización de Estilos

El editor usa CSS variables para fácil personalización:

```css
:root {
    --bg-primary: #1a1a1a;
    --bg-secondary: #252525;
    --bg-tertiary: #2f2f2f;
    --text-primary: #e0e0e0;
    --text-secondary: #a0a0a0;
    --text-tertiary: #666;
    --accent: #4a90e2;
    --border: #3a3a3a;
    --font-mono: 'Consolas', 'Monaco', monospace;
}
```

### Clases CSS Disponibles

- `.rich-editor-content` - Contenedor del editor
- `.rich-editor-menu` - Menú flotante
- `.rich-editor-menu-item` - Item del menú
- `.rich-editor-menu-item.selected` - Item seleccionado
- `.menu-item-label` - Label del item
- `.menu-item-desc` - Descripción del item

## 🔧 Casos de Uso

### 1. Editor de Novelas (como PlumaAI)

```javascript
const editor = new RichEditor({
    element: document.getElementById('chapter-editor'),
    mentionData: $store.project.characters,
    commandData: [
        {
            id: 'scene',
            label: '/escena',
            description: 'Nueva escena',
            icon: '🎬',
            action: () => {
                $store.ui.openModal('newScene');
            }
        }
    ],
    onContentChange: (content) => {
        $store.project.updateChapter(currentChapterId, { content });
    }
});
```

### 2. Editor de Documentos con Búsqueda

```javascript
const editor = new RichEditor({
    element: document.getElementById('doc-editor'),
    searchFunction: searchWithLunr,
    mentionData: allDocuments,
    onContentChange: autosaveDocument
});
```

### 3. Editor de Comentarios

```javascript
const editor = new RichEditor({
    element: document.getElementById('comment-box'),
    placeholder: 'Escribe un comentario... Menciona con @',
    mentionData: teamMembers,
    commandData: [
        {
            id: 'emoji',
            label: '/emoji',
            description: 'Insertar emoji',
            action: openEmojiPicker
        }
    ]
});
```

## 🐛 Troubleshooting

### Las menciones no aparecen

- Verifica que `mentionData` tenga objetos con `label` o `name`
- Revisa que el CSS esté correctamente cargado
- Comprueba la consola para errores

### Los comandos no funcionan

- Asegúrate de que cada comando tenga `template` O `action`
- Verifica que el `id` de cada comando sea único
- Revisa que el editor tenga foco

### Lunr.js no encuentra resultados

- Verifica que el índice esté creado correctamente
- Usa `query + '*'` para búsquedas con comodín
- Revisa el `documentsMap` para acceso rápido

### El editor no responde

- Verifica que el `element` exista en el DOM
- Comprueba que `contenteditable` esté habilitado
- Revisa que no haya errores de JavaScript

## 📝 Notas

- El editor usa `contenteditable` puro, no TipTap/ProseMirror
- Compatible con todos los navegadores modernos (Chrome, Firefox, Safari, Edge)
- No requiere build tools ni npm
- Totalmente compatible con Alpine.js
- Lunr.js es opcional pero recomendado para búsqueda avanzada

## 📄 Licencia

MIT - Úsalo libremente en tus proyectos

## 🤝 Contribuciones

¡Contribuciones bienvenidas! Abre un issue o PR.

---

**Desarrollado para PlumaAI** 🪶
