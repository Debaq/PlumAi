# Formato de Archivo .pluma

Documentación completa de la estructura de archivos `.pluma` para PlumaAI.

## Descripción General

Los archivos `.pluma` son archivos JSON que contienen toda la información de un proyecto de novela. Este formato permite exportar, importar y compartir proyectos completos de PlumaAI.

## Estructura Principal

```json
{
  "projectInfo": { ... },
  "forkInfo": { ... },
  "apiKeys": { ... },
  "characters": [ ... ],
  "locations": [ ... ],
  "chapters": [ ... ],
  "scenes": [ ... ],
  "timeline": [ ... ],
  "notes": [ ... ],
  "loreEntries": [ ... ]
}
```

---

## 1. projectInfo

Información general del proyecto.

### Propiedades

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | Identificador único del proyecto (UUID) |
| `title` | string | ✅ | Título de la novela |
| `author` | string | ❌ | Nombre del autor |
| `genre` | string | ❌ | Género literario |
| `synopsis` | string | ❌ | Sinopsis breve del proyecto |
| `targetWordCount` | number | ❌ | Meta de palabras total |
| `currentWordCount` | number | ❌ | Conteo actual de palabras |
| `status` | string | ✅ | Estado del proyecto (`draft`, `in_progress`, `completed`) |
| `created` | string | ✅ | Fecha de creación (ISO 8601) |
| `modified` | string | ✅ | Fecha de última modificación (ISO 8601) |
| `language` | string | ✅ | Código de idioma (ej: `es`, `en`) |
| `isPublicPC` | boolean | ✅ | Indica si se usa en PC público (afecta guardado automático) |

### Ejemplo

```json
{
  "projectInfo": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Mi Novela Épica",
    "author": "Juan Pérez",
    "genre": "Fantasía",
    "synopsis": "Una aventura épica en un mundo de magia",
    "targetWordCount": 80000,
    "currentWordCount": 15000,
    "status": "draft",
    "created": "2024-01-01T00:00:00.000Z",
    "modified": "2024-01-15T10:30:00.000Z",
    "language": "es",
    "isPublicPC": false
  }
}
```

---

## 2. forkInfo

Información sobre bifurcaciones del proyecto (para versiones alternativas).

### Propiedades

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `isFork` | boolean | ✅ | Indica si el proyecto es una bifurcación |
| `parentId` | string/null | ✅ | ID del proyecto padre (null si no es fork) |
| `forkName` | string | ❌ | Nombre de la bifurcación |
| `forkDescription` | string | ❌ | Descripción del propósito de la bifurcación |
| `forkDate` | string/null | ❌ | Fecha de creación de la bifurcación (ISO 8601) |

### Ejemplo

```json
{
  "forkInfo": {
    "isFork": false,
    "parentId": null,
    "forkName": "",
    "forkDescription": "",
    "forkDate": null
  }
}
```

---

## 3. apiKeys

Claves de API para servicios de IA (OpenAI, Anthropic, etc.).

### Estructura

```json
{
  "apiKeys": {
    "openai": "sk-...",
    "anthropic": "sk-ant-..."
  }
}
```

> ⚠️ **Nota de Seguridad**: Las API keys se almacenan en el archivo. Ten cuidado al compartir archivos .pluma.

---

## 4. characters

Array de personajes del proyecto.

### Propiedades de cada personaje

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | Identificador único (UUID) |
| `name` | string | ✅ | Nombre del personaje |
| `role` | string | ✅ | Rol (`protagonist`, `antagonist`, `supporting`, `secondary`) |
| `description` | string | ❌ | Descripción física/general |
| `personality` | string | ❌ | Rasgos de personalidad |
| `background` | string | ❌ | Historia de fondo |
| `relationships` | array | ✅ | Relaciones con otros personajes |
| `notes` | string | ❌ | Notas adicionales |
| `avatar` | string/null | ❌ | URL o datos del avatar |
| `vitalStatusHistory` | array | ✅ | Historial de estados vitales |
| `currentVitalStatus` | string | ✅ | Estado vital actual |
| `created` | string | ✅ | Fecha de creación (ISO 8601) |
| `modified` | string | ✅ | Fecha de modificación (ISO 8601) |

### Estructura de vitalStatusHistory

```json
{
  "status": "alive",
  "eventId": "event-id-or-null",
  "description": "Descripción del estado",
  "notes": "Notas adicionales",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Estados vitales válidos**: `alive`, `dead`, `killed`, `injured`, `missing`, `transformed`, `unknown`

### Estructura de relationships

```json
{
  "id": "relationship-uuid",
  "characterId": "target-character-uuid",
  "history": [
    {
      "eventId": "event-uuid-or-null",
      "type": "friend",
      "status": "active",
      "description": "Se conocen en la universidad",
      "notes": "Mejor amigo desde siempre",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "currentType": "friend",
  "currentStatus": "active",
  "currentDescription": "Mejor amigo",
  "created": "2024-01-01T00:00:00.000Z",
  "modified": "2024-01-01T00:00:00.000Z"
}
```

**Tipos de relación**: `family`, `friend`, `romantic`, `enemy`, `mentor`, `ally`, `rival`, `other`

**Estados de relación**: `active`, `ended`, `uncertain`, `complex`

### Ejemplo completo

```json
{
  "id": "char-001",
  "name": "Elena Martínez",
  "role": "protagonist",
  "description": "Mujer de 25 años, cabello negro, ojos verdes",
  "personality": "Valiente, curiosa, impulsiva",
  "background": "Creció en un orfanato sin conocer a sus padres",
  "relationships": [],
  "notes": "Protagonista principal",
  "avatar": null,
  "vitalStatusHistory": [
    {
      "status": "alive",
      "eventId": null,
      "description": "Inicio de la historia",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "currentVitalStatus": "alive",
  "created": "2024-01-01T00:00:00.000Z",
  "modified": "2024-01-01T00:00:00.000Z"
}
```

---

## 5. locations

Array de ubicaciones del mundo de la novela.

### Propiedades

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | Identificador único (UUID) |
| `name` | string | ✅ | Nombre de la ubicación |
| `description` | string | ❌ | Descripción del lugar |
| `type` | string | ❌ | Tipo (`settlement`, `landmark`, `region`, `building`, `natural`, `other`) |
| `notes` | string | ❌ | Notas adicionales |
| `linkedCharacters` | array | ✅ | IDs de personajes vinculados |
| `linkedEvents` | array | ✅ | IDs de eventos vinculados |
| `created` | string | ✅ | Fecha de creación (ISO 8601) |
| `modified` | string | ✅ | Fecha de modificación (ISO 8601) |

### Ejemplo

```json
{
  "id": "loc-001",
  "name": "Ciudad de Arcania",
  "description": "Capital mágica del reino",
  "type": "settlement",
  "notes": "Escenario principal de los capítulos 1-5",
  "linkedCharacters": ["char-001", "char-002"],
  "linkedEvents": ["event-001"],
  "created": "2024-01-01T00:00:00.000Z",
  "modified": "2024-01-01T00:00:00.000Z"
}
```

---

## 6. chapters

Array de capítulos de la novela.

### Propiedades

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | Identificador único (UUID) |
| `title` | string | ✅ | Título del capítulo |
| `number` | number | ✅ | Número del capítulo |
| `summary` | string | ❌ | Resumen del capítulo |
| `content` | string | ✅ | Contenido del capítulo (texto completo) |
| `wordCount` | number | ✅ | Conteo de palabras |
| `status` | string | ✅ | Estado (`draft`, `in_progress`, `completed`, `published`) |
| `created` | string | ✅ | Fecha de creación (ISO 8601) |
| `modified` | string | ✅ | Fecha de modificación (ISO 8601) |

### Ejemplo

```json
{
  "id": "chap-001",
  "title": "Capítulo 1: El Comienzo",
  "number": 1,
  "summary": "Elena descubre sus poderes",
  "content": "Elena despertó con el sonido de truenos...",
  "wordCount": 2500,
  "status": "completed",
  "created": "2024-01-01T00:00:00.000Z",
  "modified": "2024-01-05T00:00:00.000Z"
}
```

---

## 7. scenes

Array de escenas individuales (opcional, para planificación detallada).

### Propiedades

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | Identificador único (UUID) |
| `title` | string | ✅ | Título de la escena |
| `chapterId` | string | ❌ | ID del capítulo al que pertenece |
| `description` | string | ❌ | Descripción de la escena |
| `locationId` | string | ❌ | ID de la ubicación |
| `characters` | array | ✅ | IDs de personajes presentes |
| `notes` | string | ❌ | Notas adicionales |
| `created` | string | ✅ | Fecha de creación (ISO 8601) |
| `modified` | string | ✅ | Fecha de modificación (ISO 8601) |

### Ejemplo

```json
{
  "id": "scene-001",
  "title": "Encuentro en la taberna",
  "chapterId": "chap-001",
  "description": "Elena conoce a su mentor",
  "locationId": "loc-002",
  "characters": ["char-001", "char-003"],
  "notes": "Escena crucial para el desarrollo",
  "created": "2024-01-01T00:00:00.000Z",
  "modified": "2024-01-01T00:00:00.000Z"
}
```

---

## 8. timeline

Array de eventos en la línea temporal de la historia.

### Propiedades

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | Identificador único (UUID) |
| `position` | number | ✅ | Posición en la línea temporal |
| `event` | string | ✅ | Nombre del evento |
| `description` | string | ❌ | Descripción detallada |
| `dateMode` | string | ✅ | Modo de fecha (`absolute`, `relative`) |
| `date` | string | ❌ | Fecha absoluta (YYYY-MM-DD) o vacío |
| `era` | string | ❌ | Era o período (para fechas relativas) |
| `chapter` | string | ❌ | Capítulo relacionado |
| `linkedCharacters` | array | ✅ | IDs de personajes involucrados |
| `linkedLocations` | array | ✅ | IDs de ubicaciones relacionadas |
| `tags` | array | ✅ | Etiquetas del evento |
| `created` | string | ✅ | Fecha de creación (ISO 8601) |
| `modified` | string | ✅ | Fecha de modificación (ISO 8601) |

### Ejemplo

```json
{
  "id": "event-001",
  "position": 0,
  "event": "La Gran Guerra",
  "description": "Guerra que devastó el reino hace 100 años",
  "dateMode": "relative",
  "date": "",
  "era": "100 años antes del inicio",
  "chapter": "",
  "linkedCharacters": [],
  "linkedLocations": ["loc-001"],
  "tags": ["historia", "guerra"],
  "created": "2024-01-01T00:00:00.000Z",
  "modified": "2024-01-01T00:00:00.000Z"
}
```

---

## 9. notes

Array de notas generales del proyecto.

### Propiedades

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | Identificador único (UUID) |
| `title` | string | ✅ | Título de la nota |
| `content` | string | ✅ | Contenido de la nota |
| `tags` | array | ✅ | Etiquetas para organización |
| `created` | string | ✅ | Fecha de creación (ISO 8601) |
| `modified` | string | ✅ | Fecha de modificación (ISO 8601) |

### Ejemplo

```json
{
  "id": "note-001",
  "title": "Ideas para el final",
  "content": "Considerar dos finales alternativos...",
  "tags": ["plot", "endings"],
  "created": "2024-01-01T00:00:00.000Z",
  "modified": "2024-01-01T00:00:00.000Z"
}
```

---

## 10. loreEntries

Array de entradas de lore (mitología, magia, historia del mundo).

### Propiedades

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | ✅ | Identificador único (UUID) |
| `title` | string | ✅ | Título de la entrada |
| `category` | string | ✅ | Categoría (`magic`, `history`, `religion`, `culture`, `objects`, `creatures`, `organizations`, `other`) |
| `content` | string | ✅ | Contenido detallado |
| `tags` | array | ✅ | Etiquetas para búsqueda |
| `linkedCharacters` | array | ✅ | IDs de personajes relacionados |
| `linkedLocations` | array | ✅ | IDs de ubicaciones relacionadas |
| `linkedEvents` | array | ✅ | IDs de eventos relacionados |
| `created` | string | ✅ | Fecha de creación (ISO 8601) |
| `modified` | string | ✅ | Fecha de modificación (ISO 8601) |

### Ejemplo

```json
{
  "id": "lore-001",
  "title": "El Sistema de Magia",
  "category": "magic",
  "content": "La magia en este mundo funciona mediante...",
  "tags": ["magia", "reglas"],
  "linkedCharacters": ["char-001"],
  "linkedLocations": [],
  "linkedEvents": ["event-002"],
  "created": "2024-01-01T00:00:00.000Z",
  "modified": "2024-01-01T00:00:00.000Z"
}
```

---

## Migración de Versiones

PlumaAI incluye un sistema de migración automática para archivos de versiones antiguas. Al importar un archivo .pluma, se ejecuta `migrateProjectData()` que:

1. Verifica campos obligatorios
2. Agrega campos faltantes con valores por defecto
3. Actualiza estructuras antiguas al formato actual
4. Mantiene compatibilidad con versiones anteriores

---

## Validación

Para que un archivo .pluma sea válido:

1. **Debe ser JSON válido**
2. **Debe incluir** `projectInfo` con `id` único
3. **Todos los arrays** deben estar presentes (pueden estar vacíos)
4. **Los IDs** deben ser únicos dentro de cada tipo de elemento
5. **Las referencias** entre elementos deben ser válidas

---

## Ejemplo Completo Mínimo

```json
{
  "projectInfo": {
    "id": "project-001",
    "title": "Mi Proyecto",
    "author": "",
    "genre": "",
    "synopsis": "",
    "targetWordCount": 0,
    "currentWordCount": 0,
    "status": "draft",
    "created": "2024-01-01T00:00:00.000Z",
    "modified": "2024-01-01T00:00:00.000Z",
    "language": "es",
    "isPublicPC": false
  },
  "forkInfo": {
    "isFork": false,
    "parentId": null,
    "forkName": "",
    "forkDescription": "",
    "forkDate": null
  },
  "apiKeys": {},
  "characters": [],
  "locations": [],
  "chapters": [],
  "scenes": [],
  "timeline": [],
  "notes": [],
  "loreEntries": []
}
```

---

## Consideraciones de Seguridad

- ⚠️ **API Keys**: Los archivos .pluma pueden contener claves de API. No compartas estos archivos públicamente sin eliminar las claves primero.
- ⚠️ **IDs únicos**: Asegúrate de que los IDs sean únicos al combinar proyectos o crear forks.
- ✅ **Backup**: Haz copias de seguridad regulares de tus archivos .pluma.

---

## Herramientas

### Crear un archivo .pluma

1. **Desde PlumaAI**: Ir a Configuración → Exportar Proyecto
2. **Manualmente**: Crear un JSON siguiendo esta estructura

### Importar un archivo .pluma

1. **Desde PlumaAI**: Modal de Bienvenida → "Cargar Proyecto Existente"
2. **O**: Configuración → Importar Proyecto

---

## Recursos

- **Archivo de ejemplo**: Ver `demo/ejemplo.pluma` para un proyecto completo de referencia
- **Código de migración**: `js/services/storage-manager.js` → `migrateProjectData()`
- **Validación**: `js/services/storage-manager.js` → `importProject()`

---

Última actualización: 2024-11-17
Versión del formato: 2.0
