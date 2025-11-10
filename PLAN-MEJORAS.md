# 🚀 Plan de Mejoras - PlumaAI

**Fecha:** 2025-11-09
**Prioridad:** Alta

---

## 🎯 Problemas Identificados

### 1. ❌ Sistema de Relaciones
- No se pueden seleccionar personajes correctamente
- UI poco intuitiva y sosa
- **Falta temporal:** Las relaciones no cambian en el tiempo
- No hay conexión con eventos del timeline

### 2. ❌ Timeline/Eventos
- Solo soporta fechas exactas
- No es funcional para historias sin fechas
- Falta drag & drop para reorganizar
- No hay visualización gráfica
- Falta concepto de "antes/después"

### 3. ❌ Imágenes
- Personajes no pueden tener avatares
- Ubicaciones no tienen imágenes
- No hay galería de avatares genéricos
- No hay integración con generación de imágenes IA

---

## 🔧 Soluciones Propuestas

### 📍 FASE 1: Sistema de Relaciones Dinámicas

#### Estructura de Datos Nueva

```javascript
// Relación entre personajes (con historia temporal)
{
  id: 'rel-uuid',
  fromCharacterId: 'char1',
  toCharacterId: 'char2',
  type: 'friend',  // tipo actual
  description: 'Se conocieron en la universidad',

  // NUEVO: Historia temporal
  history: [
    {
      eventId: 'event-uuid',  // Vinculado a timeline
      type: 'enemy',
      date: '2020-03',
      description: 'Rivalidad por el trabajo'
    },
    {
      eventId: 'event-uuid2',
      type: 'friend',
      date: '2022-08',
      description: 'Reconciliación después del accidente'
    }
  ],

  strength: 'strong',  // strong | moderate | weak
  isSymmetric: true,
  created: '...',
  modified: '...'
}
```

#### UI Mejorada

**Modal de Relaciones:**
- Vista de red interactiva (D3.js o vis-network)
- Timeline visual de cómo cambió la relación
- Etiquetas de intensidad/tipo con colores
- Búsqueda rápida de personajes
- Agregar relación desde diagrama

**Diagrama de Relaciones:**
```
     [Juan] ━━━━ Enemigo ━━━━> [María]
       │                         │
    Amigo                     Mentor
       │                         │
       v                         v
    [Pedro] <━━ Colaborador ━━ [Ana]
```

#### Implementación:
- [ ] Actualizar estructura en `project-global.js`
- [ ] Crear modal mejorado con búsqueda
- [ ] Implementar diagrama interactivo (vis-network)
- [ ] Sistema de historial de relaciones
- [ ] Vincular con eventos del timeline

---

### 📅 FASE 2: Timeline Mejorado

#### Modos de Timeline

**Modo 1: Fechas Absolutas** (actual)
```
[2020-01-15] Evento A
[2020-03-22] Evento B
[2021-07-10] Evento C
```

**Modo 2: Orden Relativo** (nuevo)
```
1. ┌─────────────┐
   │  Evento A   │
   └─────────────┘
        │
2. ┌─────────────┐
   │  Evento B   │ (Después de A)
   └─────────────┘
        │
3. ┌─────────────┐
   │  Evento C   │ (Mucho después)
   └─────────────┘
```

**Modo 3: Eras/Épocas** (para fantasía/ciencia ficción)
```
Era del Caos
├─ Batalla de las Tres Torres
├─ Caída del Rey
└─ Fundación de la Nueva Orden

Era de la Paz
├─ Primer Concilio
└─ El Gran Tratado
```

#### Estructura de Datos

```javascript
{
  id: 'event-uuid',
  event: 'Batalla de las Tres Torres',
  description: '...',

  // FLEXIBLE: Puede tener fecha O posición relativa
  date: '2020-03-15',  // null si es relativa
  order: 1,            // Orden manual

  // NUEVO: Relaciones entre eventos
  before: ['event-uuid2'],  // Eventos que pasan después
  after: ['event-uuid3'],   // Eventos que pasaron antes

  // NUEVO: Agrupación
  era: 'Era del Caos',
  chapter: 'cap-uuid',  // Vinculado a capítulo

  // NUEVO: Impacto en relaciones
  affects: [
    {
      type: 'relationship',
      relationshipId: 'rel-uuid',
      change: 'enemy -> friend'
    },
    {
      type: 'character',
      characterId: 'char-uuid',
      change: 'Pierde un brazo'
    }
  ],

  // Metadata
  tags: ['batalla', 'importante'],
  participants: ['char1', 'char2'],
  location: 'loc-uuid',
  importance: 'high',  // high | medium | low

  created: '...',
  modified: '...'
}
```

#### UI del Timeline

**Vista 1: Lista** (actual, mejorada)
- Drag & drop para reordenar
- Colores por importancia
- Tags visuales
- Expandir/colapsar detalles

**Vista 2: Timeline Visual** (nueva)
```
═════════════════════════════════════════════════
    │             │             │
  2020          2021          2022
    │             │             │
    ●─────────────●─────────────●
  Evento A    Evento B      Evento C
```

**Vista 3: Red de Eventos** (nueva)
- Nodos = Eventos
- Líneas = Relaciones "antes/después"
- Colores = Importancia
- Agrupación por eras

#### Implementación:
- [ ] Actualizar estructura en `project-global.js`
- [ ] Modo de ordenamiento (fecha vs orden manual)
- [ ] Drag & drop (SortableJS)
- [ ] Timeline visual (vis-timeline o D3.js)
- [ ] Eras/épocas
- [ ] Sistema de impactos en relaciones/personajes
- [ ] Filtros por tags, personajes, ubicaciones

---

### 🖼️ FASE 3: Sistema de Imágenes

#### Galería de Avatares Genéricos

**Librerías de avatares:**
- **DiceBear** (https://dicebear.com/) - Avatares SVG generados
- **boring-avatars** (https://boringavatars.com/) - Avatares geométricos
- **Avataaars** - Estilo ilustración
- **Personas by Draftbit** - Avatares ilustrados

**Tipos de avatares:**
```javascript
avatarStyles: [
  'adventurer',      // Estilo aventurero
  'avataaars',       // Estilo clásico
  'bottts',          // Robots
  'pixel-art',       // Pixel art
  'initials',        // Solo iniciales
  'identicon',       // Patrón geométrico
  'human',           // Humano realista
  'fantasy'          // Fantasy (elfos, enanos, etc)
]
```

#### Subida de Imágenes

**Opciones:**
1. **Base64** (simple, sin servidor)
   - Guardar en localStorage/IndexedDB
   - Limitación: ~5MB por imagen

2. **File System Access API** (Chrome)
   - Guardar en sistema de archivos local
   - Sin límites de tamaño

3. **IndexedDB** (recomendado)
   - Blob storage
   - Sin límites prácticos

**Estructura:**
```javascript
{
  id: 'img-uuid',
  type: 'character' | 'location' | 'item',
  entityId: 'char-uuid',
  source: 'upload' | 'generated' | 'url',

  // Si es upload
  blob: Blob,
  base64: '...',

  // Si es generado
  style: 'adventurer',
  seed: 'character-name',

  // Si es URL
  url: 'https://...',

  metadata: {
    filename: '...',
    size: 12345,
    type: 'image/png',
    width: 512,
    height: 512
  },

  created: '...'
}
```

#### Mapas y Terrenos

**Librerías:**
- **Leaflet.js** - Mapas interactivos
- **Dungeon Scrawl** - Generador de mazmorras
- **Azgaar's Fantasy Map Generator** - Mapas de fantasía
- **Medieval Fantasy City Generator** - Ciudades

**Integración:**
```javascript
// Ubicación con mapa
{
  id: 'loc-uuid',
  name: 'Ciudad de Arinthar',
  type: 'city',
  description: '...',

  // NUEVO: Mapa
  map: {
    type: 'upload' | 'generated',
    imageId: 'img-uuid',

    // Si es mapa interactivo
    markers: [
      {
        id: 'marker-uuid',
        type: 'poi',  // point of interest
        name: 'Castillo Real',
        lat: 51.5,
        lng: -0.1,
        description: '...',
        icon: 'castle'
      }
    ],

    bounds: {
      north: 52,
      south: 51,
      east: 0,
      west: -1
    }
  },

  // Coordenadas en el mundo
  worldCoordinates: { x: 100, y: 200 },

  image: 'img-uuid'  // Avatar de la ubicación
}
```

#### Implementación:
- [ ] Sistema de almacenamiento de imágenes (IndexedDB)
- [ ] Integración DiceBear para avatares
- [ ] Modal de selección de avatar
- [ ] Subida de imágenes locales
- [ ] Visor de imágenes
- [ ] Sistema de mapas con Leaflet.js
- [ ] Editor de POIs en mapas
- [ ] Galería de terrenos/mapas generados

---

### 🤖 FASE 4: Integración con APIs de Imágenes

#### APIs a Integrar

**Generación de Imágenes:**
- **DALL-E 3** (OpenAI)
- **Stable Diffusion** (Replicate/Hugging Face)
- **Midjourney** (via API no oficial)
- **Leonardo.ai**

**Uso:**
```javascript
// Generar avatar de personaje
async generateCharacterAvatar(character) {
  const prompt = `
    Fantasy character portrait of ${character.name}.
    ${character.description}
    ${character.personality}
    Style: digital art, detailed, professional
  `;

  const image = await aiService.generateImage({
    provider: 'stable-diffusion',
    prompt: prompt,
    style: 'fantasy-portrait',
    aspectRatio: '1:1'
  });

  return saveImage(image, character.id);
}

// Generar mapa de ubicación
async generateLocationMap(location) {
  const prompt = `
    Top-down fantasy map of ${location.name}.
    ${location.description}
    Style: hand-drawn, medieval, parchment
  `;

  const map = await aiService.generateImage({
    provider: 'stable-diffusion',
    prompt: prompt,
    style: 'fantasy-map',
    aspectRatio: '16:9'
  });

  return saveImage(map, location.id);
}
```

#### Implementación:
- [ ] Servicio de generación de imágenes
- [ ] Integración con Replicate API
- [ ] Prompts optimizados para personajes/mapas
- [ ] Cola de generación (puede tardar)
- [ ] Cache de imágenes generadas
- [ ] UI para regenerar/editar prompts

---

## 📊 Prioridades de Implementación

### 🔴 Urgente (Esta sesión)
1. ✅ Arreglar selector de relaciones (bug crítico)
2. ✅ Mejorar UI de relaciones (más visual)
3. ✅ Sistema básico de avatares (DiceBear)

### 🟡 Importante (Próxima sesión)
4. Timeline con drag & drop
5. Modo de ordenamiento relativo
6. Subida de imágenes locales
7. Relaciones dinámicas con historial

### 🟢 Deseable (Futuro)
8. Timeline visual interactivo
9. Diagrama de red de relaciones
10. Integración con APIs de imágenes
11. Mapas interactivos con Leaflet

---

## 🛠️ Librerías a Agregar

```html
<!-- Visualización de redes -->
<script src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>

<!-- Timeline visual -->
<script src="https://unpkg.com/vis-timeline/standalone/umd/vis-timeline-graph2d.min.js"></script>

<!-- Drag & drop -->
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>

<!-- Avatares generados -->
<!-- API de DiceBear: https://api.dicebear.com/7.x/{style}/svg?seed={name} -->

<!-- Mapas (si se usa) -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
```

---

## ✅ Checklist de Implementación

### Relaciones
- [ ] Arreglar bug de selección
- [ ] Modal mejorado con búsqueda
- [ ] Vista de lista de relaciones
- [ ] Diagrama de red (vis-network)
- [ ] Historial temporal
- [ ] Vinculación con eventos

### Timeline
- [ ] Drag & drop para reordenar
- [ ] Modo fecha vs orden relativo
- [ ] Eras/épocas
- [ ] Timeline visual (vis-timeline)
- [ ] Impactos en personajes/relaciones
- [ ] Filtros y búsqueda

### Imágenes
- [ ] Servicio de storage (IndexedDB)
- [ ] Integración DiceBear
- [ ] Selector de avatar
- [ ] Subida de archivos
- [ ] Visor de imágenes
- [ ] Galería de avatares
- [ ] Mapas con Leaflet
- [ ] Generación con IA (futuro)

---

**Siguiente paso:** Empezar con arreglar el bug de relaciones y mejorar la UI 🚀
