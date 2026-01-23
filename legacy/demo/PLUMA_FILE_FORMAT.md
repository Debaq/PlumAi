# Formato de Archivo .pluma

Documentación completa de la estructura de archivos `.pluma` para PlumaAI.

## Descripción General

Los archivos `.pluma` son archivos **ZIP comprimidos** que contienen toda la información de un proyecto de novela, incluyendo datos JSON, imágenes, avatares y otros recursos. Este formato permite exportar, importar y compartir proyectos completos de PlumaAI.

> **Nota**: Versiones anteriores usaban JSON puro. PlumaAI mantiene **retrocompatibilidad** con archivos JSON legacy.

## Estructura del Archivo ZIP

Un archivo `.pluma` es un archivo ZIP con la siguiente estructura:

```
archivo.pluma (ZIP)
├── project.json          # Datos del proyecto (ver estructura abajo)
├── metadata.json         # Metadata del archivo
└── assets/               # Carpeta de recursos (opcional)
    ├── avatars/          # Avatares de personajes
    │   ├── char-001.png
    │   ├── char-002.jpg
    │   └── ...
    ├── covers/           # Portadas de libro
    │   └── cover.png
    └── images/           # Otras imágenes
        └── *.png/jpg
```

### metadata.json

Archivo de metadata que describe el contenido del .pluma:

```json
{
  "version": "2.0",
  "format": "pluma-zip",
  "created": "2024-11-17T00:00:00.000Z",
  "encrypted": false,
  "encryptedFull": false,
  "hasAssets": true
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `version` | string | Versión del formato |
| `format` | string | Tipo de formato (`pluma-zip` o `pluma-json`) |
| `created` | string | Fecha de creación del archivo |
| `encrypted` | boolean | Indica si hay datos encriptados |
| `encryptedFull` | boolean | Indica si TODO el proyecto está encriptado |
| `hasAssets` | boolean | Indica si incluye carpeta de assets |

### assets/

Carpeta que contiene todos los recursos binarios del proyecto:

- **avatars/**: Avatares de personajes (PNG, JPG)
  - Nombrados con el ID del personaje: `{characterId}.png`

- **covers/**: Portadas del libro
  - `cover.png` - Portada principal

- **images/**: Otras imágenes personalizadas

## Estructura de project.json

El archivo `project.json` dentro del ZIP contiene los datos del proyecto en formato JSON:

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

### Estructura Sin Encriptar

```json
{
  "apiKeys": {
    "openai": "sk-...",
    "anthropic": "sk-ant-..."
  }
}
```

### Estructura Encriptada

Cuando las API keys están encriptadas con contraseña:

```json
{
  "apiKeys": {
    "_encrypted": true,
    "_data": "base64-encrypted-data..."
  }
}
```

> ⚠️ **Nota de Seguridad**: Las API keys se almacenan en el archivo. **Se recomienda encarecidamente usar encriptación** al exportar proyectos. Ten cuidado al compartir archivos .pluma sin encriptar.

> 🔒 **Encriptación Recomendada**: PlumaAI puede encriptar automáticamente las API keys usando AES-256-GCM con una contraseña. Ver sección "Encriptación" más abajo.

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

## Encriptación

PlumaAI soporta encriptación de archivos .pluma para proteger datos sensibles.

### Métodos de Encriptación

#### 1. Encriptación de API Keys (Recomendado)

Solo las claves de API se encriptan, el resto del proyecto permanece legible.

**Ventajas:**
- ✅ Protege datos sensibles (API keys)
- ✅ El proyecto sigue siendo legible en formato JSON
- ✅ Fácil de compartir sin exponer credenciales
- ✅ Menor overhead

**Estructura:**
```json
{
  "projectInfo": { ... },
  "apiKeys": {
    "_encrypted": true,
    "_data": "base64-encrypted-data..."
  },
  "characters": [ ... ],
  ...
}
```

#### 2. Encriptación Completa del Proyecto

Todo el contenido del proyecto se encripta.

**Ventajas:**
- ✅ Máxima privacidad
- ✅ Protege todo el contenido de la novela
- ✅ Ideal para proyectos confidenciales

**Desventajas:**
- ⚠️ No se puede leer sin la contraseña
- ⚠️ No se puede previsualizar el contenido

**Estructura:**
```json
{
  "_encrypted": true,
  "_version": "2.0",
  "_data": "base64-encrypted-data...",
  "projectInfo": {
    "id": "project-uuid",
    "title": "Título visible",
    "author": "Autor visible"
  }
}
```

> **Nota**: Cuando el proyecto completo está encriptado, solo se mantienen visibles `id`, `title` y `author` de `projectInfo` para identificación.

### Algoritmo de Encriptación

PlumaAI utiliza **AES-256-GCM** (Advanced Encryption Standard con Galois/Counter Mode):

- **Algoritmo**: AES-GCM
- **Tamaño de clave**: 256 bits
- **Derivación de clave**: PBKDF2 con SHA-256
- **Iteraciones PBKDF2**: 100,000
- **Salt**: 16 bytes aleatorios por encriptación
- **IV (Vector de Inicialización)**: 12 bytes aleatorios
- **Autenticación**: Incluida en GCM (protege contra modificaciones)

### Formato de Datos Encriptados

Los datos encriptados en base64 contienen:

```
[Salt (16 bytes)][IV (12 bytes)][Datos Encriptados][Auth Tag (incluido en GCM)]
```

### Proceso de Encriptación

1. Usuario proporciona contraseña
2. Se genera salt aleatorio de 16 bytes
3. Se deriva clave usando PBKDF2 (100,000 iteraciones)
4. Se genera IV aleatorio de 12 bytes
5. Se encripta usando AES-256-GCM
6. Se combina salt + IV + datos encriptados
7. Se convierte a base64

### Proceso de Desencriptación

1. Usuario proporciona contraseña
2. Se decodifica base64
3. Se extrae salt, IV y datos encriptados
4. Se deriva clave usando PBKDF2 con el salt
5. Se desencripta usando AES-256-GCM con el IV
6. Se verifica autenticación (automático en GCM)
7. Se retorna datos desencriptados

### Seguridad

✅ **Fortalezas:**
- AES-256 es estándar de la industria
- PBKDF2 con 100,000 iteraciones protege contra ataques de fuerza bruta
- GCM proporciona encriptación autenticada (detecta modificaciones)
- Salt e IV aleatorios previenen ataques de análisis
- Implementación usando Web Crypto API (nativa del navegador)

⚠️ **Consideraciones:**
- La seguridad depende de la fortaleza de la contraseña
- **Usa contraseñas fuertes**: mínimo 12 caracteres, mezcla de letras, números y símbolos
- Si olvidas la contraseña, **no hay forma de recuperar los datos**
- Las contraseñas NO se almacenan en disco (solo en memoria durante la sesión si se selecciona "recordar")

### Uso

**Al Exportar:**
1. Ir a Configuración → Exportar Proyecto
2. Seleccionar "Encriptar API keys" o "Encriptar proyecto completo"
3. Ingresar contraseña segura
4. Confirmar contraseña
5. Descargar archivo .pluma encriptado

**Al Importar:**
1. Seleccionar archivo .pluma encriptado
2. Si detecta encriptación, solicita contraseña automáticamente
3. Ingresar contraseña
4. Opcionalmente marcar "Recordar en esta sesión"
5. Proyecto se desencripta y carga

### Compatibilidad

- ✅ Archivos sin encriptar se pueden leer normalmente
- ✅ Archivos con API keys encriptadas funcionan con todas las versiones 2.0+
- ✅ Archivos completamente encriptados requieren PlumaAI 2.0+
- ✅ Sistema de migración automática mantiene compatibilidad

---

## Consideraciones de Seguridad

- 🔒 **Encriptación Recomendada**: **Siempre usa encriptación** al exportar proyectos que contengan API keys. Ver sección "Encriptación" arriba.
- ⚠️ **API Keys**: Los archivos .pluma sin encriptar pueden contener claves de API. **NO compartas estos archivos públicamente** sin encriptarlos o eliminar las claves primero.
- 🔑 **Contraseñas Fuertes**: Si usas encriptación, usa contraseñas de al menos 12 caracteres con mezcla de letras, números y símbolos.
- 💾 **Pérdida de Contraseña**: Si olvidas la contraseña de un proyecto encriptado, **no hay forma de recuperar los datos**. Guarda tus contraseñas de forma segura.
- ⚠️ **IDs únicos**: Asegúrate de que los IDs sean únicos al combinar proyectos o crear forks.
- ✅ **Backup**: Haz copias de seguridad regulares de tus archivos .pluma.
- 🌐 **Compartir Proyectos**: Al compartir proyectos con API keys, usa siempre encriptación o elimina las keys manualmente antes de compartir.

---

## Retrocompatibilidad y Formato Legacy

PlumaAI mantiene compatibilidad con archivos .pluma legacy (JSON puro) de versiones anteriores.

### Formato Legacy (JSON Puro)

Versiones anteriores de PlumaAI usaban archivos JSON puros sin compresión ZIP:

```json
{
  "projectInfo": { ... },
  "apiKeys": { ... },
  "characters": [ ... ],
  ...
}
```

**Limitaciones del formato legacy:**
- ❌ No soporta imágenes/avatares
- ❌ Mayor tamaño de archivo
- ❌ No incluye metadata

### Detección Automática

PlumaAI detecta automáticamente el formato del archivo:

1. **Archivos ZIP** (formato nuevo):
   - Se identifican por los primeros bytes (`PK` - firma ZIP)
   - Se procesan con `zipService.readPlumaFile()`
   - Soportan assets completos

2. **Archivos JSON** (formato legacy):
   - Se detectan al fallar la lectura ZIP
   - Se procesan como JSON puro
   - Completamente compatibles con versión actual

### Migración de Legacy a ZIP

Al importar un archivo legacy (JSON), PlumaAI:

1. Lee el JSON correctamente
2. Aplica migraciones necesarias
3. **Al exportar nuevamente**, se guarda en formato ZIP moderno

> ✅ **Recomendación**: Actualiza tus archivos legacy importándolos y re-exportándolos para aprovechar el nuevo formato ZIP.

### Ventajas del Nuevo Formato ZIP

| Característica | Legacy (JSON) | Nuevo (ZIP) |
|---------------|---------------|-------------|
| **Soporte de imágenes** | ❌ No | ✅ Sí |
| **Tamaño de archivo** | Grande | Comprimido |
| **Metadata** | ❌ No | ✅ Sí |
| **Avatares de personajes** | ❌ No | ✅ Sí |
| **Portadas** | ❌ No | ✅ Sí |
| **Organización** | Todo en un JSON | Estructura de carpetas |
| **Compresión** | ❌ No | ✅ DEFLATE nivel 9 |
| **Extensible** | Limitado | Fácil agregar nuevos assets |

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
