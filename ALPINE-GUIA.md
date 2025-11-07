# Guía de Alpine.js - Lecciones Aprendidas

Esta guía documenta los problemas encontrados y sus soluciones al desarrollar PlumaAI con Alpine.js 3.x.

---

## 📋 Tabla de Contenidos

1. [Problema Principal: CSS vs x-show](#problema-principal-css-vs-x-show)
2. [Inicialización y Orden de Carga](#inicialización-y-orden-de-carga)
3. [Reactividad de Stores](#reactividad-de-stores)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Checklist de Debug](#checklist-de-debug)
6. [Patrones Comunes](#patrones-comunes)

---

## 🚨 Problema Principal: CSS vs x-show

### ❌ El Problema

```css
/* ¡NUNCA HAGAS ESTO! */
.view {
    display: none;
}

.view.active {
    display: block;
}
```

**¿Por qué falla?**
- Alpine.js `x-show` funciona modificando `display` inline
- CSS con `display: none` tiene mayor especificidad que el inline de Alpine
- Resultado: `x-show` cambia el valor pero el CSS lo sobrescribe

### ✅ Solución

```css
/* Dejar que Alpine controle la visibilidad */
.view {
    /* Sin display: none */
}
```

O usar clases condicionales:

```html
<!-- Opción 1: Solo x-show -->
<div x-show="condition" class="view">...</div>

<!-- Opción 2: Combinar x-show con :class si necesitas estilos específicos -->
<div x-show="condition" :class="{'active': condition}" class="view">...</div>
```

**Lección clave:** Si usas `x-show`, **nunca** pongas `display: none` en el CSS de esa clase.

---

## 🔄 Inicialización y Orden de Carga

### ❌ Problema: ES6 Modules vs Alpine.js

```html
<!-- ¡NO FUNCIONA! -->
<script type="module">
    import myStore from './store.js';
    Alpine.store('myStore', myStore);
</script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

**¿Por qué falla?**
- Los módulos ES6 son asíncronos
- Alpine se carga con `defer` y procesa el DOM antes de que los módulos terminen
- Resultado: Stores no están registrados cuando Alpine los necesita

### ✅ Solución: Scripts Globales + alpine:init

```html
<!-- 1. Cargar stores como scripts globales (sin módulos) -->
<script src="js/stores/ui-global.js"></script>
<script src="js/stores/project-global.js"></script>

<!-- 2. Registrar stores en alpine:init -->
<script>
    document.addEventListener('alpine:init', () => {
        // Hacer reactivos con Alpine.reactive()
        const reactiveUi = Alpine.reactive(window.uiStore);
        const reactiveProject = Alpine.reactive(window.projectStore);

        // Registrar stores
        Alpine.store('ui', reactiveUi);
        Alpine.store('project', reactiveProject);

        // Inicializar stores si tienen método init()
        Alpine.store('ui').init();
        Alpine.store('project').init();
    });
</script>

<!-- 3. Cargar Alpine al final -->
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

**Store global (sin export):**

```javascript
// js/stores/ui-global.js
window.uiStore = {
    currentView: 'dashboard',

    setView(view) {
        this.currentView = view;
    },

    init() {
        console.log('UI Store initialized');
    }
};
```

---

## ⚡ Reactividad de Stores

### ❌ Problema: Métodos en x-show no son reactivos

```html
<!-- ¡NO REACTIVO! -->
<div x-show="$store.ui.isCurrentView('dashboard')">...</div>
```

```javascript
// Store
window.uiStore = {
    currentView: 'dashboard',

    // Este método NO dispara reactividad cuando se usa en x-show
    isCurrentView(view) {
        return this.currentView === view;
    }
};
```

**¿Por qué falla?**
- Alpine rastrea **propiedades**, no **métodos**
- Cuando `currentView` cambia, Alpine no sabe que debe re-evaluar `isCurrentView()`

### ✅ Solución: Acceso directo a propiedades

```html
<!-- ¡REACTIVO! -->
<div x-show="$store.ui.currentView === 'dashboard'">...</div>
```

**Regla de oro:** En directivas reactivas (`x-show`, `x-if`, `:class`, etc.), accede **directamente a las propiedades**, no uses métodos.

### Cuándo usar métodos

```html
<!-- ✅ OK: Métodos en @click -->
<button @click="$store.ui.setView('dashboard')">Dashboard</button>

<!-- ✅ OK: Métodos en x-text (se evalúa una vez) -->
<span x-text="$store.project.getStats().totalWords"></span>

<!-- ❌ MAL: Métodos en x-show (no es reactivo) -->
<div x-show="$store.project.hasCharacters()">...</div>

<!-- ✅ BIEN: Propiedad en x-show (reactivo) -->
<div x-show="$store.project.characters.length > 0">...</div>
```

---

## 🎯 Mejores Prácticas

### 1. Estructura de Stores

```javascript
window.myStore = {
    // ✅ Propiedades primitivas (reactivas)
    count: 0,
    currentView: 'home',
    isLoading: false,

    // ✅ Objetos anidados (reactivos con Alpine.reactive)
    user: {
        name: '',
        email: ''
    },

    // ✅ Arrays (reactivos)
    items: [],

    // ✅ Métodos para cambiar estado (usar en @click)
    increment() {
        this.count++;
    },

    setView(view) {
        this.currentView = view;
    },

    // ✅ Getters computados (usar con cuidado en directivas reactivas)
    get doubleCount() {
        return this.count * 2;
    },

    // ✅ Método init() se ejecuta automáticamente
    init() {
        // Cargar datos iniciales
        const saved = localStorage.getItem('myStore');
        if (saved) {
            Object.assign(this, JSON.parse(saved));
        }
    }
};
```

### 2. Registrar Stores

```javascript
document.addEventListener('alpine:init', () => {
    // Hacer el objeto profundamente reactivo
    const reactive = Alpine.reactive(window.myStore);

    // Registrar con Alpine
    Alpine.store('myStore', reactive);

    // Inicializar
    if (Alpine.store('myStore').init) {
        Alpine.store('myStore').init();
    }
});
```

### 3. Usar Stores en HTML

```html
<!-- ✅ Acceso a propiedades -->
<div x-show="$store.ui.currentView === 'home'">Home</div>
<span x-text="$store.user.name"></span>

<!-- ✅ Llamar métodos en eventos -->
<button @click="$store.ui.setView('profile')">Profile</button>

<!-- ✅ Binding de clases -->
<div :class="{ 'active': $store.ui.currentView === 'home' }">...</div>

<!-- ✅ Loops con arrays -->
<template x-for="item in $store.items" :key="item.id">
    <div x-text="item.name"></div>
</template>
```

### 4. Debugging con $watch

```javascript
Alpine.data('app', () => ({
    init() {
        // Observar cambios en el store
        this.$watch('$store.ui.currentView', (value) => {
            console.log('Vista cambió a:', value);
        });

        // Observar propiedades anidadas
        this.$watch('$store.user.name', (value) => {
            console.log('Nombre cambió a:', value);
        });
    }
}));
```

---

## 🔍 Checklist de Debug

Cuando algo no funciona con Alpine.js, verifica en este orden:

### 1. ¿Los stores están cargados?

```javascript
// En consola del navegador:
console.log(Alpine.store('ui'));
// Debe mostrar un Proxy con tus datos
```

### 2. ¿El CSS está interfiriendo con x-show?

```javascript
// Inspecciona el elemento en DevTools
// Busca reglas CSS con display: none
// Verifica el estilo inline que Alpine añade
```

### 3. ¿Estás usando métodos en lugar de propiedades?

```html
<!-- ❌ No reactivo -->
<div x-show="$store.ui.isActive()">

<!-- ✅ Reactivo -->
<div x-show="$store.ui.active">
```

### 4. ¿Los stores se registraron antes de Alpine?

```javascript
// Debe aparecer ANTES de cualquier error de Alpine
console.log('🚀 Stores registrados');
```

### 5. ¿Alpine está procesando el elemento?

```javascript
// En consola, selecciona un elemento y verifica:
$0.__x  // Debe existir si Alpine lo procesó
```

### 6. ¿Hay errores en consola?

```javascript
// Busca errores como:
// "Alpine Expression Error: xxx is not defined"
// "Cannot read property 'xxx' of undefined"
```

---

## 📚 Patrones Comunes

### Patrón: Sistema de Vistas

```javascript
// Store
window.uiStore = {
    currentView: 'dashboard',
    views: ['dashboard', 'characters', 'chapters'],

    setView(view) {
        if (this.views.includes(view)) {
            this.currentView = view;
        }
    }
};
```

```html
<!-- HTML -->
<nav>
    <a href="#"
       @click.prevent="$store.ui.setView('dashboard')"
       :class="{ 'active': $store.ui.currentView === 'dashboard' }">
        Dashboard
    </a>
    <a href="#"
       @click.prevent="$store.ui.setView('characters')"
       :class="{ 'active': $store.ui.currentView === 'characters' }">
        Characters
    </a>
</nav>

<main>
    <div x-show="$store.ui.currentView === 'dashboard'" class="view">
        <h1>Dashboard</h1>
    </div>

    <div x-show="$store.ui.currentView === 'characters'" class="view">
        <h1>Characters</h1>
    </div>
</main>
```

### Patrón: Sistema de Modales con Plantillas Dinámicas

Para implementar un sistema de modales con plantillas cargadas dinámicamente, se puede usar un enfoque centralizado que combina estados booleanos individuales con un estado activo global:

```javascript
// Store
window.uiStore = {
    // Estados individuales para cada modal
    showWelcomeModal: false,
    showNewProjectModal: false,
    showEditCharacterModal: false,
    showEditChapterModal: false,
    
    // Estado global para modales con IDs específicos
    activeModal: null,
    modalData: null, // Datos temporales para modales

    // Función para abrir modales específicos
    openModal(modalId, data = null) {
        // Cerrar todos los modales primero
        Object.keys(this).forEach(key => {
            if (key.startsWith('show') && key.endsWith('Modal')) {
                this[key] = false;
            }
        });
        
        // Establecer los datos del modal
        this.modalData = data;

        // Abrir el modal específico
        if (modalId === 'welcome') {
            this.showWelcomeModal = true;
        } else if (modalId === 'newProject') {
            this.showNewProjectModal = true;
        } else if (modalId === 'editCharacter') {
            this.showEditCharacterModal = true;
        } else if (modalId === 'editChapter') {
            this.showEditChapterModal = true;
        } else {
            this.activeModal = modalId;
        }
    },

    // Función para cerrar modales
    closeModal() {
        // Cerrar modales individuales
        this.showWelcomeModal = false;
        this.showNewProjectModal = false;
        this.showEditCharacterModal = false;
        this.showEditChapterModal = false;
        
        // Cerrar modal activo
        this.activeModal = null;
        this.modalData = null;
    }
};
```

```html
<!-- HTML -->
<button @click="$store.ui.openModal('welcome')">Welcome Modal</button>
<button @click="$store.ui.openModal('editCharacter', { id: 1, name: 'John' })">Edit Character</button>

<!-- Ejemplo de modal con x-show condicional -->
<div x-show="$store.ui.showWelcomeModal"
     @click.self="$store.ui.closeModal()"
     class="modal-backdrop"
     x-transition>
    <div class="modal-content">
        <div class="modal-header">
            <h2>Welcome</h2>
            <button @click="$store.ui.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <p>Welcome to the application!</p>
        </div>
    </div>
</div>
```

### Patrón: Carga Dinámica de Plantillas con Alpine.js

Para cargar plantillas HTML externas dinámicamente y que Alpine procese correctamente los nuevos elementos, es crucial llamar a `Alpine.initTree()` en los elementos recién insertados:

```javascript
// Componente para cargar plantillas dinámicamente
window.dynamicTemplateComponent = function(templatePath) {
    return {
        async init() {
            try {
                const response = await fetch(templatePath);
                const html = await response.text();
                
                // Insertar el contenido HTML en el elemento actual
                this.$el.innerHTML = html;
                
                // MUY IMPORTANTE: Inicializar Alpine en los nuevos elementos
                // Esto asegura que las directivas (x-data, x-show, @click, etc.) funcionen
                if (window.Alpine) {
                    window.Alpine.initTree(this.$el);
                }
            } catch (error) {
                console.error('Error loading template:', error);
            }
        }
    };
};
```

```html
<!-- Uso del componente dinámico -->
<div x-data="dynamicTemplateComponent('templates/modal-content.html')"></div>
```

### Patrón: Carga de Múltiples Plantillas en Contenedores Específicos

Cuando necesitas cargar múltiples plantillas en diferentes contenedores, es importante procesar cada uno individualmente:

```javascript
window.modalContainerComponent = function() {
    return {
        async init() {
            // Crear la estructura de contenedores
            this.$el.innerHTML = `
                <div id="modal-1-container"></div>
                <div id="modal-2-container"></div>
                <div id="modal-3-container"></div>
            `;
            
            // Cargar plantillas individuales
            await this.loadTemplate('modal-1-container', 'templates/modal1.html');
            await this.loadTemplate('modal-2-container', 'templates/modal2.html');
            await this.loadTemplate('modal-3-container', 'templates/modal3.html');
        },
        
        async loadTemplate(containerId, templatePath) {
            try {
                const response = await fetch(templatePath);
                const html = await response.text();
                
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = html;
                    
                    // Inicializar Alpine en este contenedor específico
                    if (window.Alpine) {
                        window.Alpine.initTree(container);
                    }
                }
            } catch (error) {
                console.error(`Error loading template ${templatePath}:`, error);
            }
        }
    };
};
```

### Problemas Comunes y Soluciones

#### ❌ Problema: Directivas Alpine no funcionan en contenido dinámico

**Síntoma:** `x-show`, `@click`, `x-data`, etc. no responden en elementos cargados dinámicamente.

**Causa:** Alpine solo inicializa elementos que estaban presentes en el DOM cuando se inició.

**Solución:** Usar `Alpine.initTree(elemento)` para inicializar Alpine en nuevos elementos.

#### ❌ Problema: Múltiples inicializaciones

**Síntoma:** Componentes que se inicializan varias veces causando problemas de rendimiento.

**Causa:** Reemplazar elementos con `outerHTML` puede causar nuevas inicializaciones.

**Solución:** Usar `innerHTML` y `initTree()` en lugar de `outerHTML`, evitando reemplazar el elemento que contiene el componente Alpine.

#### ✅ Buenas Prácticas

1. **Usar `initTree()`** después de insertar contenido dinámico
2. **Evitar `outerHTML`** en elementos que contienen componentes Alpine
3. **Esperar a que el DOM se actualice** antes de inicializar Alpine en nuevos elementos
4. **Usar `$nextTick()` o `setTimeout()`** para asegurar que el DOM esté completamente actualizado
5. **Manejar adecuadamente los recursos** (event listeners, timeouts) para evitar fugas de memoria

### Patrón: CRUD Operations

```javascript
// Store
window.projectStore = {
    items: [],

    addItem(item) {
        this.items.push({
            id: crypto.randomUUID(),
            ...item,
            created: new Date().toISOString()
        });
    },

    updateItem(id, updates) {
        const index = this.items.findIndex(i => i.id === id);
        if (index !== -1) {
            this.items[index] = {
                ...this.items[index],
                ...updates,
                modified: new Date().toISOString()
            };
        }
    },

    deleteItem(id) {
        this.items = this.items.filter(i => i.id !== id);
    },

    getItem(id) {
        return this.items.find(i => i.id === id);
    }
};
```

```html
<!-- HTML -->
<div x-show="$store.project.items.length === 0" class="empty-state">
    <p>No items yet</p>
</div>

<div x-show="$store.project.items.length > 0">
    <template x-for="item in $store.project.items" :key="item.id">
        <div class="item-card">
            <h3 x-text="item.name"></h3>
            <button @click="$store.ui.openModal('editItem', item)">Edit</button>
            <button @click="if(confirm('Delete?')) $store.project.deleteItem(item.id)">Delete</button>
        </div>
    </template>
</div>
```

### Patrón: Toast Notifications

```javascript
// Store
window.uiStore = {
    toasts: [],

    showToast(type, title, message, duration = 5000) {
        const id = crypto.randomUUID();
        const toast = { id, type, title, message };

        this.toasts.push(toast);

        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(id);
            }, duration);
        }

        return id;
    },

    removeToast(id) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    },

    success(title, message) {
        return this.showToast('success', title, message);
    },

    error(title, message) {
        return this.showToast('error', title, message);
    }
};
```

```html
<!-- HTML -->
<div class="toast-container">
    <template x-for="toast in $store.ui.toasts" :key="toast.id">
        <div class="toast" :class="toast.type">
            <div class="toast-title" x-text="toast.title"></div>
            <div class="toast-message" x-text="toast.message"></div>
            <button @click="$store.ui.removeToast(toast.id)">×</button>
        </div>
    </template>
</div>

<!-- Uso -->
<button @click="$store.ui.success('Success!', 'Item saved')">Save</button>
<button @click="$store.ui.error('Error!', 'Something went wrong')">Error</button>
```

---

## 🚀 Optimizaciones

### 1. Lazy Loading de Vistas

```html
<!-- Solo renderizar vista activa con x-if (elimina del DOM) -->
<template x-if="$store.ui.currentView === 'dashboard'">
    <div class="view">
        <!-- Contenido pesado aquí -->
    </div>
</template>

<!-- x-show mantiene en DOM pero oculto (más rápido para cambios) -->
<div x-show="$store.ui.currentView === 'profile'" class="view">
    <!-- Contenido ligero aquí -->
</div>
```

### 2. Evitar Re-renders Innecesarios

```javascript
// ❌ Esto causa re-render cada vez
<div x-text="$store.project.items.map(i => i.name).join(', ')">

// ✅ Mejor: usar un getter en el store
window.projectStore = {
    items: [],

    get itemNames() {
        return this.items.map(i => i.name).join(', ');
    }
};

<div x-text="$store.project.itemNames">
```

### 3. Debounce en Inputs

```html
<input
    type="text"
    x-model="search"
    @input.debounce.500ms="performSearch()">
```

---

## 📖 Referencias

- [Alpine.js Docs](https://alpinejs.dev)
- [Alpine.store() Docs](https://alpinejs.dev/globals/alpine-store)
- [x-show Docs](https://alpinejs.dev/directives/show)
- [x-data Docs](https://alpinejs.dev/directives/data)

---

## 💡 Resumen de Reglas de Oro

1. **NUNCA** uses `display: none` en CSS para elementos con `x-show`
2. **SIEMPRE** accede a propiedades directamente en directivas reactivas (`x-show`, `x-if`, `:class`)
3. **USA** métodos solo en eventos (`@click`, `@submit`) o en `x-text` no reactivo
4. **REGISTRA** stores en `alpine:init` ANTES de que Alpine procese el DOM
5. **USA** scripts globales en lugar de ES6 modules para stores cuando uses Alpine desde CDN
6. **HAZ** los stores reactivos con `Alpine.reactive()` antes de registrarlos
7. **AÑADE** `$watch` para debuggear cambios en el store
8. **VERIFICA** en consola que los stores son `Proxy` objects

---

**Última actualización:** 2025-11-05
**Versión:** 1.0
**Proyecto:** PlumaAI
