# Sistema de Traducciones Modular

Este proyecto utiliza un sistema de traducciones modular que divide las traducciones en archivos más pequeños y manejables.

## Estructura

```
js/i18n/
├── README.md (este archivo)
├── locales/
│   ├── es/                    # Traducciones en Español
│   │   ├── common.js          # Textos comunes (botones, labels, etc.)
│   │   ├── header.js          # Header de la aplicación
│   │   ├── sidebar.js         # Menú lateral
│   │   ├── dashboard.js       # Panel principal
│   │   ├── characters.js      # Gestión de personajes
│   │   ├── scenes.js          # Gestión de escenas
│   │   ├── locations.js       # Gestión de ubicaciones
│   │   ├── chapters.js        # Gestión de capítulos
│   │   ├── timeline.js        # Línea temporal
│   │   ├── lore.js            # Elementos de lore
│   │   ├── ai.js              # Asistente de IA
│   │   ├── notes.js           # Notas
│   │   ├── editor.js          # Editor de texto
│   │   ├── publishing.js      # Publicación de libros
│   │   ├── modals.js          # Diálogos modales
│   │   ├── status.js          # Barra de estado
│   │   ├── notifications.js   # Notificaciones
│   │   ├── stats.js           # Estadísticas
│   │   ├── validation.js      # Mensajes de validación
│   │   ├── relationships.js   # Relaciones entre personajes
│   │   ├── vitalStatus.js     # Estado vital de personajes
│   │   ├── versionControl.js  # Control de versiones
│   │   ├── project.js         # Gestión de proyectos
│   │   ├── loading.js         # Mensajes de carga
│   │   └── avatars.js         # Selección de avatares
│   │
│   ├── en/                    # Traducciones en Inglés
│   │   └── [mismos archivos que es/]
│   │
│   ├── es-global.js           # ⚠️ DEPRECADO - No usar
│   └── en-global.js           # ⚠️ DEPRECADO - No usar
│
└── (sistema de carga automático en /js/stores/i18n-global.js)
```

## Ventajas del Sistema Modular

### 1. **Mantenibilidad**
- Archivos más pequeños y focalizados (20-300 líneas vs 1300+ líneas)
- Más fácil encontrar y editar traducciones específicas
- Menor riesgo de conflictos en Git cuando varios desarrolladores trabajan en traducciones

### 2. **Organización**
- Traducciones agrupadas por funcionalidad
- Estructura clara y predecible
- Fácil de navegar y entender

### 3. **Performance**
- Carga bajo demanda (lazy loading)
- Solo se cargan los módulos necesarios
- Mejor tiempo de carga inicial

### 4. **Escalabilidad**
- Fácil agregar nuevos idiomas
- Fácil agregar nuevas secciones
- Estructura clara para onboarding de nuevos traductores

## Cómo Funciona

### Carga Automática

El sistema carga automáticamente todos los módulos al iniciar la aplicación:

```javascript
// En js/stores/i18n-global.js
await i18nStore.init();  // Detecta idioma y carga módulos
```

### Agregar un Nuevo Módulo

1. Crea el archivo en ambos idiomas:
   ```
   js/i18n/locales/es/nuevo-modulo.js
   js/i18n/locales/en/nuevo-modulo.js
   ```

2. Formato del archivo:
   ```javascript
   // Traducciones de [Nombre] - Español
   export default {
       key1: 'Valor 1',
       key2: 'Valor 2',
       nested: {
           key3: 'Valor 3'
       }
   };
   ```

3. Agrega el módulo a la lista en `js/stores/i18n-global.js`:
   ```javascript
   translationModules: [
       'common',
       'header',
       // ... otros módulos
       'nuevo-modulo'  // ← Agregar aquí
   ]
   ```

### Uso en la Aplicación

```javascript
// Acceder a una traducción
$store.i18n.t('common.save')  // → "Guardar"
$store.i18n.t('characters.title')  // → "Personajes"

// Con parámetros
$store.i18n.t('chapters.stats.words', { count: 1500 })  // → "1500 palabras"
```

## Agregar un Nuevo Idioma

1. Crea una nueva carpeta:
   ```
   js/i18n/locales/fr/  (por ejemplo, para francés)
   ```

2. Copia todos los archivos de `es/` o `en/`

3. Traduce el contenido de cada archivo

4. Agrega el idioma a `js/stores/i18n-global.js`:
   ```javascript
   availableLocales: [
       { code: 'es', name: 'Español', flag: '🇪🇸' },
       { code: 'en', name: 'English', flag: '🇬🇧' },
       { code: 'fr', name: 'Français', flag: '🇫🇷' }  // ← Nuevo
   ]
   ```

## Migración desde el Sistema Antiguo

Los archivos antiguos (`es-global.js` y `en-global.js`) han sido divididos en módulos más pequeños.

**No uses** los archivos antiguos. El sistema ahora carga automáticamente los módulos desde las carpetas `es/` y `en/`.

## Debugging

Para ver qué módulos se están cargando, abre la consola del navegador (F12):

```
🌍 Iniciando sistema de i18n modular...
📍 Idioma seleccionado: es
📦 Cargando traducciones modulares para es...
  ├─ Cargando common...
  ✅ common cargado
  ├─ Cargando header...
  ✅ header cargado
  ...
✅ Traducciones cargadas: 25 módulos
```

## Contribuir

Al contribuir traducciones:

1. Edita solo el módulo relevante (no toques otros archivos innecesariamente)
2. Mantén la estructura de objetos anidados
3. Usa la misma sintaxis de parámetros: `{nombre}`
4. Prueba en ambos idiomas antes de hacer commit

## Notas Técnicas

- Los módulos se cargan con ES6 `import()` dinámico
- El sistema es compatible con Alpine.js
- Los módulos usan `export default` para exportar las traducciones
- La carga es asíncrona pero bloqueante (espera a que todos los módulos carguen)
