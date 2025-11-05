# Plan de Desarrollo - PlumaAI
## Editor de Novelas con Inteligencia Artificial

## 1. Arquitectura General

### 1.1 Tecnologías
- **Frontend**: HTML5, CSS3, JavaScript ES6+ Modules
- **Framework UI**: Alpine.js 3.x (~15kb)
- **Editor**: Tiptap (latest)
- **Diff/Versiones**: jsdiff + diff2html
- **Almacenamiento**: Dexie.js (IndexedDB wrapper)
- **Utilities**: uuid, date-fns
- **APIs IA**: Kimi, Claude (Anthropic), Replicate, Qwen
- **Formato datos**: JSON

### 1.2 Arquitectura Modular
Componentes Alpine.js cargados dinámicamente para mantener el index.html limpio y el código organizado.

### 1.2 Estructura de archivos
```
index.html (estructura mínima)
├── styles/
│   ├── main.css (dark mode minimalista)
│   └── components.css
├── js/
│   ├── app.js (inicialización Alpine + Stores globales)
│   ├── i18n/
│   │   ├── index.js (exportador principal)
│   │   ├── locales/
│   │   │   ├── es.js (traducciones español)
│   │   │   └── en.js (traducciones inglés)
│   ├── components/
│   │   ├── sidebar.js (Alpine component)
│   │   ├── header.js (Alpine component)
│   │   ├── dashboard.js (Alpine component)
│   │   ├── characters.js (Alpine component)
│   │   ├── scenes.js (Alpine component)
│   │   ├── chapters.js (Alpine component)
│   │   ├── timeline.js (Alpine component)
│   │   ├── ai-assistant.js (Alpine component)
│   │   ├── editor.js (Alpine component con Tiptap)
│   │   └── modals.js (Alpine component)
│   ├── stores/
│   │   ├── i18n.js (Alpine store - internacionalización)
│   │   ├── project.js (Alpine store - estado proyecto)
│   │   ├── ui.js (Alpine store - estado UI)
│   │   └── ai.js (Alpine store - estado IA)
│   ├── services/
│   │   ├── storage.js (Dexie.js wrapper)
│   │   ├── ai-service.js (APIs IA)
│   │   ├── diff-service.js (jsdiff + diff2html)
│   │   └── export-service.js (JSON export/import)
│   └── utils/
│       ├── uuid.js
│       └── dates.js
└── lib/
    ├── alpine.min.js (3.x)
    ├── tiptap/ (módulos necesarios)
    ├── dexie.min.js
    └── otras librerías
```

### 1.3 Sistema de Internacionalización (i18n)

**Idiomas Soportados:**
- Español (es) - idioma por defecto
- Inglés (en)

**Arquitectura:**
- **Store i18n**: Gestiona el idioma activo y proporciona funciones de traducción
- **Archivos de locale**: Objetos JSON con todas las traducciones organizadas por sección
- **Detección automática**: Lee el idioma del navegador al inicio
- **Persistencia**: Guarda la preferencia del usuario en localStorage

**Uso en componentes:**
```javascript
// Texto simple
x-text="$store.i18n.t('dashboard.title')"

// Con parámetros (interpolación)
x-text="$store.i18n.t('chapters.stats.words', {count: 1500})"

// En atributos
:placeholder="$store.i18n.t('characters.form.namePlaceholder')"

// Cambiar idioma
$store.i18n.setLocale('en')
```

**Estructura de keys:**
```javascript
{
  common: { save, cancel, delete, ... },
  header: { title, subtitle, ... },
  sidebar: { dashboard, characters, ... },
  dashboard: { title, stats: { words, chapters }, ... },
  // ... etc
}
```

**Agregar nuevos idiomas:**
1. Crear archivo en `js/i18n/locales/{code}.js`
2. Importar en `js/i18n/index.js`
3. Agregar a `availableLocales` en `js/stores/i18n.js`

## 2. Modelo de Datos

### 2.1 Estructura del Proyecto
```json
{
  "projectInfo": {
    "id": "uuid",
    "title": "Título de la novela",
    "author": "Nombre autor",
    "created": "timestamp",
    "modified": "timestamp",
    "isPublicPC": false
  },
  "apiKeys": {
    "kimi": "encrypted_key",
    "claude": "encrypted_key",
    "replicate": "encrypted_key",
    "qwen": "encrypted_key"
  },
  "characters": [],
  "locations": [],
  "chapters": [],
  "scenes": [],
  "timeline": [],
  "notes": []
}
```

### 2.2 Personaje
```json
{
  "id": "uuid",
  "name": "Nombre",
  "role": "protagonista|secundario|antagonista",
  "description": "Descripción física",
  "personality": "Personalidad",
  "background": "Historia",
  "relationships": [],
  "notes": "",
  "created": "timestamp",
  "modified": "timestamp"
}
```

### 2.3 Capítulo
```json
{
  "id": "uuid",
  "number": 1,
  "title": "Título del capítulo",
  "content": "Texto del capítulo",
  "scenes": ["scene_id_1", "scene_id_2"],
  "status": "draft|review|final",
  "wordCount": 0,
  "versions": [],
  "created": "timestamp",
  "modified": "timestamp"
}
```

### 2.4 Versión (Control de Cambios)
```json
{
  "id": "uuid",
  "chapterId": "uuid",
  "versionNumber": 1,
  "content": "Texto completo",
  "changes": [
    {
      "type": "add|delete|modify",
      "position": 0,
      "oldText": "",
      "newText": "",
      "source": "user|ai",
      "status": "pending|accepted|rejected"
    }
  ],
  "comment": "Nota de versión",
  "timestamp": "timestamp",
  "author": "user|ai-model-name"
}
```

### 2.5 Escena
```json
{
  "id": "uuid",
  "title": "Título escena",
  "chapterId": "uuid",
  "description": "Descripción",
  "characters": ["char_id_1"],
  "location": "location_id",
  "timelinePosition": 0,
  "notes": "",
  "created": "timestamp",
  "modified": "timestamp"
}
```

### 2.6 Línea Temporal
```json
{
  "id": "uuid",
  "position": 0,
  "date": "Fecha en la historia",
  "event": "Descripción del evento",
  "sceneIds": [],
  "chapterIds": [],
  "notes": ""
}
```

## 3. Funcionalidades Core

### 3.1 Gestión de Proyecto
- [x] Crear nuevo proyecto
- [x] Cargar proyecto (JSON import)
- [x] Guardar proyecto (JSON export)
- [x] Autosave (si PC propio)
- [x] Configuración PC público/propio

### 3.2 Editor de Texto
- [x] Editor rich text básico
- [x] Contador de palabras en tiempo real
- [x] Autoguardado cada X segundos
- [x] Formato básico (negrita, cursiva, párrafos)

### 3.3 Integración IA

#### 3.3.1 Configuración APIs
- [x] Gestión de API keys (input seguro)
- [x] Selector de modelo activo
- [x] Guardado de keys en proyecto

#### 3.3.2 Modos de trabajo

**Modo 1: IA Escribe**
- Usuario da idea/prompt
- IA genera capítulo completo
- Sistema de instrucciones iterativas:
  - "Cambia este párrafo..."
  - "Elimina esta parte..."
  - "Mejora la descripción de..."
  - "No tiene sentido esto, reescribe..."

**Modo 2: Usuario Escribe + IA Asiste**
- Usuario escribe
- IA disponible para:
  - Consultar base de datos (coherencia)
  - Parafrasear texto seleccionado
  - Sugerir mejoras
  - Generar ideas
  - Completar frases/párrafos

#### 3.3.3 Contexto IA
La IA siempre tiene acceso a:
- Lista de personajes (nombres, características)
- Escenas previas
- Línea temporal
- Notas del proyecto
- Capítulos anteriores (resumen)

### 3.4 Control de Cambios

#### 3.4.1 Historial de Versiones
- Guardar versión completa cada vez
- Numeración automática
- Timestamp y autor (user/ai)
- Comentarios opcionales

#### 3.4.2 Visualización Diff
- Vista lado a lado (antes/después)
- Resaltado de cambios:
  - Verde: agregado
  - Rojo: eliminado
  - Amarillo: modificado
- Indicador de fuente (user/ai)

#### 3.4.3 Acciones
- Aceptar cambio individual
- Rechazar cambio individual
- Aceptar todos
- Rechazar todos
- Revertir a versión anterior
- Comparar cualquier versión

### 3.5 Gestión de Personajes
- [x] Crear/editar/eliminar personaje
- [x] Fichas completas con campos personalizables
- [x] Relaciones entre personajes
- [x] Vista de lista y detalle
- [x] Búsqueda y filtros

### 3.6 Gestión de Escenas
- [x] Crear/editar/eliminar escena
- [x] Asignar personajes a escena
- [x] Vincular con capítulo
- [x] Ubicar en línea temporal
- [x] Vista de tarjetas

### 3.7 Gestión de Capítulos
- [x] Crear/editar/eliminar capítulo
- [x] Reordenar capítulos (drag & drop)
- [x] Estados (borrador/revisión/final)
- [x] Estadísticas (palabras, escenas)
- [x] Navegación rápida

### 3.8 Línea Temporal
- [x] Vista visual de eventos
- [x] Vinculación con escenas/capítulos
- [x] Navegación cronológica
- [x] Detección de inconsistencias

## 4. Interfaz de Usuario

### 4.1 Diseño General
- **Estilo**: Minimalista, dark mode profesional
- **Colores**: 
  - Background: #1a1a1a
  - Panels: #252525
  - Text: #e0e0e0
  - Accent: #4a90e2
  - Success: #4caf50
  - Warning: #ff9800
  - Error: #f44336

### 4.2 Layout Principal
```
+--------------------------------------------------+
| [Logo] Editor de Novelas        [Config] [Save] |
+--------------------------------------------------+
| [Sidebar]           | [Main Content Area]        |
| - Dashboard         |                            |
| - Personajes        |                            |
| - Escenas           |                            |
| - Capítulos         |    [Editor/Content]        |
| - Línea Temporal    |                            |
| - IA Asistente      |                            |
| - Notas             |                            |
+--------------------------------------------------+
| [Status Bar: Words | Autosave | AI Status]      |
+--------------------------------------------------+
```

### 4.3 Componentes UI

#### 4.3.1 Sidebar
- Navegación principal
- Iconos + texto
- Colapsable
- Indicadores de estado

#### 4.3.2 Editor Principal
- Zona de escritura amplia
- Toolbar minimalista
- Panel lateral colapsable (IA/Info)
- Sin distracciones

#### 4.3.3 Panel IA
- Selector de modo (Escribir/Asistir)
- Área de prompt
- Historial de interacciones
- Botones de acción rápida

#### 4.3.4 Vista Diff
- Split view (50/50)
- Resaltado de cambios
- Controles aceptar/rechazar
- Timeline de versiones

#### 4.3.5 Modales
- Crear personaje/escena/capítulo
- Configuración API keys
- Configuración proyecto
- Exportar/Importar

## 5. Flujo de Trabajo

### 5.1 Inicio de Proyecto
1. Usuario crea nuevo proyecto o carga existente
2. Configura información básica
3. Selecciona si es PC propio/público
4. Ingresa API keys (opcional, puede hacerlo después)

### 5.2 Escritura con IA (Modo 1)
1. Usuario selecciona capítulo
2. Activa "IA Escribe"
3. Ingresa prompt/idea
4. IA genera contenido (con contexto del proyecto)
5. Usuario revisa en vista diff
6. Da instrucciones de cambios
7. IA modifica (nueva versión)
8. Usuario acepta/rechaza cambios
9. Repite hasta satisfacción
10. Acepta versión final

### 5.3 Escritura Asistida (Modo 2)
1. Usuario escribe en editor
2. Cuando necesita ayuda:
   - Selecciona texto → pide parafraseo/mejora
   - Consulta personaje → IA muestra info
   - Pide ideas → IA sugiere basado en contexto
   - Pide coherencia → IA verifica timeline/personajes
3. IA responde en panel lateral
4. Usuario aplica sugerencias manualmente o acepta cambios

### 5.4 Gestión de Personajes
1. Usuario crea personaje (ficha completa)
2. IA puede acceder a info para coherencia
3. Usuario vincula personaje a escenas
4. Sistema alerta si personaje no usado o inconsistencias

### 5.5 Exportar Proyecto
1. Usuario selecciona "Exportar"
2. Sistema genera JSON completo
3. Incluye API keys si están configuradas
4. Descarga archivo .json
5. Usuario puede importarlo en otra sesión

## 6. Fases de Desarrollo

### Fase 0: Internacionalización (Completado ✓)
- [x] Store i18n para Alpine.js
- [x] Sistema de traducciones (ES/EN)
- [x] Detección automática de idioma
- [x] Persistencia en localStorage
- [x] Interpolación de parámetros
- [x] Traducciones completas de todas las secciones

### Fase 1: Estructura Base (Día 1) - **EN PROGRESO**
- [x] HTML estructura completa
- [x] CSS dark mode minimalista
- [x] Layout responsive
- [ ] Estructura de directorios JS
- [ ] Sistema de navegación
- [ ] Componentes Alpine.js básicos

### Fase 2: Almacenamiento (Día 1-2)
- [ ] LocalStorage manager
- [ ] IndexedDB para proyectos grandes
- [ ] Import/Export JSON
- [ ] Detección PC público/propio
- [ ] Autosave condicional

### Fase 3: Gestión de Datos (Día 2-3)
- [ ] CRUD Personajes
- [ ] CRUD Escenas
- [ ] CRUD Capítulos
- [ ] Línea temporal básica
- [ ] Relaciones entre entidades

### Fase 4: Editor de Texto (Día 3-4)
- [ ] Editor básico funcional
- [ ] Formato texto (rich text)
- [ ] Contador palabras
- [ ] Autosave editor

### Fase 5: Integración IA (Día 4-6)
- [ ] Manager API keys
- [ ] Conexión a APIs (Kimi, Claude, Replicate, Qwen)
- [ ] Sistema de prompts con contexto
- [ ] Modo "IA Escribe"
- [ ] Modo "IA Asiste"
- [ ] Panel IA interactivo

### Fase 6: Control de Versiones (Día 6-7)
- [ ] Sistema de versiones completo
- [ ] Vista diff visual
- [ ] Aceptar/rechazar cambios
- [ ] Historial navegable
- [ ] Comparación de versiones

### Fase 7: Refinamiento (Día 7-8)
- [ ] Optimización rendimiento
- [ ] Validaciones y errores
- [ ] UX improvements
- [ ] Testing funcionalidades
- [ ] Documentación

## 7. Consideraciones Técnicas

### 7.1 Seguridad
- API keys no se envían a ningún servidor (solo en JSON del usuario)
- Advertencia sobre PC público
- No hay backend, todo cliente

### 7.2 Rendimiento
- Lazy loading de capítulos largos
- IndexedDB para proyectos >5MB
- Debounce en autosave
- Virtualización de listas largas

### 7.3 Compatibilidad
- Chrome/Edge (último)
- Firefox (último)
- Safari 14+
- No IE

### 7.4 Limitaciones
- Depende de APIs externas (requiere keys)
- Sin colaboración en tiempo real
- Sin backend/sincronización
- Proyectos locales solamente

## 8. Futuras Mejoras (Fase 2)

### 8.1 Exportación Avanzada
- [ ] Export a DOCX
- [ ] Export a ODT
- [ ] Export a PDF
- [ ] Export a EPUB

### 8.2 Análisis IA
- [ ] Análisis de coherencia automático
- [ ] Sugerencias de mejora general
- [ ] Detección de plot holes
- [ ] Análisis de desarrollo de personajes

### 8.3 Colaboración
- [ ] Backend opcional
- [ ] Compartir proyecto
- [ ] Comentarios colaborativos

### 8.4 Plantillas
- [ ] Plantillas de estructura (3 actos, héroe, etc.)
- [ ] Plantillas de personajes
- [ ] Plantillas de escenas

## 9. API IA - Especificaciones

### 9.1 Endpoints y Formato

#### Claude (Anthropic)
```javascript
{
  url: "https://api.anthropic.com/v1/messages",
  headers: {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  },
  body: {
    model: "claude-3-sonnet-20240229",
    max_tokens: 4096,
    messages: [...]
  }
}
```

#### Kimi (Moonshot)
```javascript
{
  url: "https://api.moonshot.cn/v1/chat/completions",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: {
    model: "moonshot-v1-8k",
    messages: [...],
    temperature: 0.7
  }
}
```

#### Replicate
```javascript
{
  url: "https://api.replicate.com/v1/predictions",
  headers: {
    "Authorization": `Token ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: {
    version: "model-version-id",
    input: {...}
  }
}
```

#### Qwen (Alibaba Cloud)
```javascript
{
  url: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: {
    model: "qwen-turbo",
    input: {...},
    parameters: {}
  }
}
```

### 9.2 Sistema de Contexto

El prompt a la IA siempre incluirá:

```
CONTEXTO DEL PROYECTO:
Título: [título]
Género: [género]

PERSONAJES PRINCIPALES:
- [nombre]: [descripción breve]

ESCENAS RELEVANTES:
- [escena]: [descripción]

LÍNEA TEMPORAL:
- [eventos importantes]

CAPÍTULO ACTUAL: [número y título]

INSTRUCCIÓN DEL USUARIO:
[prompt del usuario]
```

## 10. Próximos Pasos

1. Aprobar este plan
2. Comenzar Fase 1: crear estructura HTML/CSS
3. Implementar cada fase secuencialmente
4. Testing continuo entre fases
5. Iterar basado en feedback

---

**Fecha creación**: 2025-11-05
**Versión**: 1.0
**Estado**: Pendiente aprobación
