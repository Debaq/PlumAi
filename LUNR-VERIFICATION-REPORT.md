# 🔍 Reporte de Verificación de Indexación Lunr.js

**Fecha:** 2025-11-14
**Proyecto:** PlumaAI
**Componente:** SearchService + Lunr.js

---

## 📋 Resumen Ejecutivo

Este documento describe el sistema de indexación con Lunr.js implementado en PlumaAI y proporciona herramientas para verificar su correcto funcionamiento.

### Estado Actual

✅ **SearchService implementado** (`js/services/search-service.js`)
✅ **Lunr.js incluido** (`js/lib/lunr.min.js`)
✅ **Integración con Alpine.js** (inicialización automática)
✅ **Múltiples tipos de búsqueda** (personajes, escenas, ubicaciones, timeline, lore)

---

## 🎯 ¿Qué se está indexando?

El SearchService indexa los siguientes tipos de documentos:

### 1. **Personajes** (`characters`)
- **Campos indexados:** name, description, role, backstory, personality, appearance, goals, fears, notes
- **Peso en búsqueda:** Alto (boost: 10 en nombre)
- **Icono:** 👤

### 2. **Escenas** (`scenes`)
- **Campos indexados:** title, description, location, notes
- **Peso en búsqueda:** Alto (boost: 10 en título)
- **Icono:** 🎬

### 3. **Ubicaciones** (`locations`)
- **Campos indexados:** name, description, type, significance, notes
- **Peso en búsqueda:** Alto (boost: 10 en nombre)
- **Icono:** 📍

### 4. **Timeline** (`timeline`)
- **Campos indexados:** event, date, description, notes
- **Peso en búsqueda:** Alto (boost: 8 en evento)
- **Icono:** 📅

### 5. **Capítulos** (`chapters`)
- **Campos indexados:** title, summary
- **Peso en búsqueda:** Alto (boost: 10 en título)
- **Icono:** 📖
- **Nota:** NO se indexa el contenido completo para evitar resultados demasiado largos

### 6. **Lore Entries** (`loreEntries`)
- **Campos indexados:** title, summary, category, content
- **Peso en búsqueda:** Alto (boost: 10 en título)
- **Icono:** 📚

---

## 🔧 Configuración del Índice

### Estrategias de Búsqueda

El SearchService utiliza **4 estrategias** en cascada para encontrar resultados:

1. **Búsqueda exacta** - Coincidencia literal
2. **Búsqueda con wildcard** (`query + '*'`) - Coincidencia parcial
3. **Búsqueda fuzzy** (`query + '~1'`) - Tolera 1 error tipográfico
4. **Búsqueda por palabras** - Divide la query y busca con OR

### Pesos de los Campos (Boost)

```javascript
label:       boost: 10  // Nombres y títulos principales
name:        boost: 10
title:       boost: 10
event:       boost: 8   // Eventos de timeline
description: boost: 5   // Descripciones
content:     boost: 1   // Contenido completo
```

---

## 🧪 Herramientas de Verificación

### Opción 1: Test HTML Completo

**Archivo:** `test-lunr-indexing.html`

**Características:**
- ✅ Interfaz visual completa
- ✅ 7 categorías de tests
- ✅ Datos de prueba incluidos
- ✅ Resultados detallados con colores
- ✅ Estadísticas y métricas de rendimiento
- ✅ Ejemplos de resultados de búsqueda

**Cómo usar:**
1. Abre `test-lunr-indexing.html` en tu navegador
2. Presiona el botón "▶️ Ejecutar Todas las Pruebas"
3. Revisa los resultados en cada sección
4. Verifica el resumen final

**Tests incluidos:**
1. Verificación de librería Lunr.js
2. Verificación de SearchService
3. Inicialización con datos de prueba
4. Verificación de índice Lunr
5. Pruebas de búsqueda básicas
6. Búsquedas avanzadas (wildcard, fuzzy, por tipo)
7. Pruebas de rendimiento

### Opción 2: Script de Consola

**Archivo:** `verify-lunr-console.js`

**Características:**
- ✅ Ejecución rápida en consola del navegador
- ✅ Verifica el estado real de tu aplicación
- ✅ Salida formateada con colores
- ✅ Comandos útiles para debugging
- ✅ No requiere datos de prueba (usa tus datos reales)

**Cómo usar:**
1. Abre `index.html` en tu navegador (tu aplicación real)
2. Abre la consola de desarrollador (F12)
3. Copia y pega todo el contenido de `verify-lunr-console.js`
4. Presiona Enter
5. Revisa los resultados en la consola

**Ventajas:**
- Verifica con tus datos reales
- Más rápido que el test HTML
- Ideal para debugging durante desarrollo
- Proporciona comandos útiles para probar manualmente

---

## 📊 Interpretación de Resultados

### ✅ Todo Correcto (≥80% tests pasados)

**Indicadores:**
- Lunr.js cargado correctamente
- SearchService inicializado
- Índice creado con documentos
- Búsquedas retornan resultados
- Rendimiento < 10ms por búsqueda

**Acción:** ✅ Sistema listo para producción

### ⚠️ Problemas Menores (50-79% tests pasados)

**Posibles causas:**
- Algunos métodos de búsqueda específica fallan
- Rendimiento lento (>10ms)
- Pocos documentos indexados

**Acción:** 🔍 Revisar configuración y optimizar

### ❌ Problemas Críticos (<50% tests pasados)

**Posibles causas:**
- Lunr.js no cargado
- SearchService no disponible
- Índice no inicializado
- Errores de JavaScript

**Acción:** 🛠️ NO usar en producción, revisar errores en consola

---

## 🐛 Troubleshooting

### Problema: "Lunr.js no encontrado"

**Solución:**
```html
<!-- Verificar que esté incluido en index.html -->
<script src="js/lib/lunr.min.js"></script>
```

### Problema: "SearchService no disponible"

**Solución:**
```html
<!-- Verificar orden de carga en index.html -->
<script src="js/lib/lunr.min.js"></script>
<script src="js/services/search-service.js"></script>
```

### Problema: "SearchService no inicializado"

**Causa:** Alpine.js aún no está listo

**Solución:**
```javascript
// Verificar que se ejecute después de Alpine
document.addEventListener('alpine:initialized', () => {
    window.searchService.initialize({
        characters: Alpine.store('project').characters,
        scenes: Alpine.store('project').scenes,
        // ...
    });
});
```

**Verificación manual:**
```javascript
// En consola
window.searchService.isReady() // Debe retornar true
```

### Problema: "No hay resultados de búsqueda"

**Posibles causas:**
1. No hay datos en el proyecto
2. El índice no se actualizó después de agregar datos
3. La query no coincide con ningún documento

**Solución:**
```javascript
// 1. Verificar datos
Alpine.store('project').characters // Debe tener elementos

// 2. Reinicializar índice
window.searchService.initialize(Alpine.store('project'))

// 3. Verificar estadísticas
window.searchService.getStats() // Ver qué hay indexado
```

### Problema: "Búsquedas lentas"

**Solución:**
1. **Reducir boost en campos de contenido largo**
   ```javascript
   // En search-service.js
   this.field('content', { boost: 0.5 }); // Reducir de 1 a 0.5
   ```

2. **No indexar capítulos completos**
   ```javascript
   // Ya está implementado, no indexa chapter.content
   ```

3. **Limitar número de resultados**
   ```javascript
   searchService.search('query', { limit: 10 })
   ```

---

## 🔍 Comandos Útiles para Testing Manual

### En la consola del navegador:

```javascript
// Verificar si SearchService está listo
window.searchService.isReady()

// Ver estadísticas de indexación
window.searchService.getStats()

// Búsqueda general
window.searchService.search('juan')

// Búsqueda específica por tipo
window.searchService.searchCharacters('maría')
window.searchService.searchScenes('batalla')
window.searchService.searchLocations('casa')
window.searchService.searchTimeline('evento')
window.searchService.searchLore('historia')

// Búsqueda con opciones
window.searchService.search('juan', {
    limit: 5,
    types: ['character'],
    minScore: 0.5
})

// Obtener documento específico
window.searchService.getDocument('character-1')

// Ver todos los documentos indexados
Object.values(window.searchService.documentsMap)

// Reinicializar índice
window.searchService.initialize(Alpine.store('project'))

// Verificar estructura del índice
window.searchService.idx.fields

// Ver número de documentos
Object.keys(window.searchService.documentsMap).length
```

---

## 📈 Métricas de Rendimiento Esperadas

| Métrica | Valor Óptimo | Valor Aceptable | Crítico |
|---------|-------------|-----------------|---------|
| Tiempo de búsqueda | < 5ms | < 10ms | > 20ms |
| Tiempo de inicialización | < 50ms | < 100ms | > 200ms |
| Documentos indexados | 100+ | 10+ | < 5 |
| Memoria (documentos) | < 100KB | < 500KB | > 1MB |

---

## 🔄 Actualización del Índice

El índice se actualiza automáticamente en estos momentos:

1. **Al cargar la aplicación** (evento `alpine:initialized`)
2. **Manualmente** llamando a `searchService.initialize()`

### Para actualizar después de cambios:

```javascript
// Opción 1: Actualizar con datos actuales
window.searchService.update(Alpine.store('project'))

// Opción 2: Reinicializar completamente
window.searchService.initialize({
    characters: Alpine.store('project').characters,
    scenes: Alpine.store('project').scenes,
    locations: Alpine.store('project').locations,
    timeline: Alpine.store('project').timeline,
    chapters: Alpine.store('project').chapters,
    loreEntries: Alpine.store('project').loreEntries
})
```

---

## ✅ Checklist de Verificación Rápida

Antes de considerar que la indexación está funcionando correctamente:

- [ ] Lunr.js cargado (`typeof lunr !== 'undefined'`)
- [ ] SearchService disponible (`typeof window.searchService !== 'undefined'`)
- [ ] SearchService inicializado (`window.searchService.isReady() === true`)
- [ ] Índice creado (`window.searchService.idx !== null`)
- [ ] Documentos indexados (`Object.keys(window.searchService.documentsMap).length > 0`)
- [ ] Búsqueda funciona (`window.searchService.search('test')` no lanza error)
- [ ] Búsquedas específicas funcionan (`searchCharacters`, `searchScenes`, etc.)
- [ ] Rendimiento aceptable (< 10ms por búsqueda)

---

## 📚 Referencias

- **Documentación Lunr.js:** https://lunrjs.com/
- **Archivo principal:** `js/services/search-service.js`
- **Librería:** `js/lib/lunr.min.js`
- **Inicialización:** `js/app.js` (líneas 973-984)
- **Uso en componentes:**
  - `js/components/rich-editor-component.js` (líneas 156, 179, 202)
  - `js/components/editor-alpine.js` (líneas 104, 119, 134)

---

## 🎯 Próximos Pasos

### Mejoras Potenciales

1. **Persistencia del índice**
   - Guardar el índice en localStorage para carga más rápida
   - Solo reinicializar cuando hay cambios

2. **Búsqueda en tiempo real**
   - Debounce en input de búsqueda
   - Actualización incremental del índice

3. **Highlighting de resultados**
   - Resaltar términos de búsqueda en resultados
   - Usar `matchData` de Lunr.js

4. **Búsqueda avanzada**
   - Operadores booleanos (AND, OR, NOT)
   - Búsqueda por rangos de fechas (timeline)
   - Filtros combinados

5. **Analytics**
   - Tracking de búsquedas más comunes
   - Sugerencias basadas en historial

---

## 📝 Notas Finales

- El SearchService está **desacoplado** de Alpine.js, puede usarse independientemente
- Los datos se indexan **en memoria**, no se persisten
- La búsqueda es **case-insensitive** por defecto en Lunr.js
- El sistema soporta **español e inglés** automáticamente
- No hay límite de documentos, pero más de 10,000 puede afectar rendimiento

---

**Última actualización:** 2025-11-14
**Versión:** 1.0
