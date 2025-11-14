# 🤖 Guía Completa del AI Service - PlumAI

**Fecha**: 2025-11-14
**Versión**: 1.0
**Estado**: ✅ Implementado y funcionando

---

## 📋 Resumen

Se ha implementado un **sistema completo de integración con múltiples APIs de IA** que permite a los usuarios elegir entre diferentes proveedores según sus necesidades y presupuesto.

### ✨ Características Principales

- ✅ **9 proveedores diferentes** (pagados, gratuitos, locales, manual)
- ✅ **7 modos de asistencia** (escribir, sugerir, analizar, mejorar, etc.)
- ✅ **Construcción inteligente de prompts** con contexto del proyecto
- ✅ **UI completa** para configuración y gestión
- ✅ **Modo "Copy Prompt"** para usar sin API (100% gratis)
- ✅ **Test de conexión** para verificar configuración

---

## 🎯 Proveedores Soportados

### 1. APIs Pagadas (con Free Tier)

| Proveedor | Modelo | Free Tier | Precio | Velocidad |
|-----------|--------|-----------|--------|-----------|
| **Claude (Anthropic)** | claude-3-5-sonnet, claude-3-haiku | $5 gratis | Desde $3/M tokens | Media-Alta |
| **OpenAI (ChatGPT)** | gpt-4o, gpt-4o-mini, gpt-3.5-turbo | No | Desde $0.15/M tokens | Alta |
| **Google Gemini** | gemini-1.5-pro, gemini-1.5-flash | 15 req/min gratis | Free tier generoso | Media |
| **Groq** | llama-3.3-70b, mixtral-8x7b | FREE generoso | Gratis (rate limited) | **Ultra rápido** |
| **Together AI** | llama-3.1-70b, mixtral-8x7b | $25 gratis | Desde $0.2/M tokens | Alta |

### 2. APIs Gratuitas

| Proveedor | Modelo | Free Tier | Notas |
|-----------|--------|-----------|-------|
| **HuggingFace** | llama-3.2-3b, mistral-7b | Rate limited gratis | Algunos modelos gratis |
| **Ollama** | llama3.2, qwen2.5, mistral, gemma2 | 100% GRATIS | **Requiere instalación local** |

### 3. Modo Manual (sin API)

| Modo | Descripción | Costo |
|------|-------------|-------|
| **Copy Prompt** | Genera prompt completo para copiar/pegar | 100% GRATIS |

**Uso**: Copia el prompt generado y pégalo en ChatGPT web, Claude.ai, Gemini, o cualquier IA de tu elección.

---

## 🔧 Configuración

### Paso 1: Abrir Configuración

1. Click en el icono de **configuración** (⚙️) en la esquina superior derecha
2. Selecciona la pestaña **"Configurar APIs de IA"**

### Paso 2: Seleccionar Proveedor

1. Elige un proveedor del dropdown
2. Verás información sobre:
   - Free tier disponible
   - Precio
   - Si requiere instalación local
   - Si requiere API key

### Paso 3: Configurar API Key (si es necesario)

**Proveedores que NO requieren API key:**
- Ollama (local)
- Modo manual (copy prompt)

**Proveedores que SÍ requieren API key:**
- Claude → Obtener en https://console.anthropic.com/
- OpenAI → Obtener en https://platform.openai.com/api-keys
- Google → Obtener en https://makersuite.google.com/app/apikey
- Groq → Obtener en https://console.groq.com/keys
- Together → Obtener en https://api.together.xyz/settings/api-keys
- HuggingFace → Obtener en https://huggingface.co/settings/tokens

### Paso 4: Seleccionar Modelo

Cada proveedor tiene varios modelos disponibles. El sistema selecciona automáticamente el modelo recomendado, pero puedes cambiarlo.

### Paso 5: Guardar y Probar

1. Click en **"Guardar"** para guardar la API key
2. Click en **"Probar"** para verificar la conexión
3. Verás un mensaje de éxito o error

---

## 🎨 Modos de Asistencia

El AI Service soporta 7 modos diferentes:

### 1. ✍️ Continuar Escribiendo
- **Uso**: Continúa la narrativa desde donde dejaste
- **Contexto**: Capítulo actual, capítulos anteriores, personajes
- **Ejemplo**: "Continúa la escena donde María descubre el secreto"

### 2. 💡 Sugerir Ideas
- **Uso**: Genera ideas para desarrollar la historia
- **Contexto**: Todo el proyecto
- **Ejemplo**: "Sugiere 3 giros inesperados para el capítulo 5"

### 3. 🔍 Analizar Texto
- **Uso**: Analiza consistencia, ritmo, tono
- **Contexto**: Texto seleccionado + proyecto
- **Ejemplo**: "Analiza si el tono de este pasaje es consistente con el personaje"

### 4. ✨ Mejorar Pasaje
- **Uso**: Reescribe mejorando la prosa
- **Contexto**: Texto seleccionado
- **Ejemplo**: "Mejora este diálogo haciéndolo más natural"

### 5. 💬 Generar Diálogo
- **Uso**: Crea diálogos característicos
- **Contexto**: Personajes + escena actual
- **Ejemplo**: "Genera un diálogo entre Juan y María sobre el viaje"

### 6. 🌍 Expandir Worldbuilding
- **Uso**: Desarrolla el mundo de la historia
- **Contexto**: Lore + ubicaciones + timeline
- **Ejemplo**: "Describe la historia del Reino del Norte"

### 7. 🎭 Desarrollar Personaje
- **Uso**: Profundiza en caracterización
- **Contexto**: Personaje específico
- **Ejemplo**: "Desarrolla el trasfondo de María"

---

## 💻 Uso del Código

### Inicialización

El servicio se inicializa automáticamente al cargar la página:

```javascript
// Ya está disponible globalmente
window.aiService
```

### Cambiar Proveedor

```javascript
// Cambiar a Claude
window.aiService.setProvider('anthropic', 'claude-3-5-sonnet-20241022');

// Cambiar a modo manual (gratis)
window.aiService.setProvider('manual', 'copy-paste');

// Cambiar a Groq (gratis, rápido)
window.aiService.setProvider('groq', 'llama-3.3-70b-versatile');
```

### Enviar Request

```javascript
// Ejemplo básico
const result = await window.aiService.sendRequest(
    'continue',                    // modo
    'Continúa desde aquí...',      // instrucción
    chapterId,                     // ID del capítulo actual (opcional)
    'Texto seleccionado...'        // texto seleccionado (opcional)
);

// Resultado con API
if (result.type === 'api') {
    console.log('Respuesta:', result.content);
    console.log('Modelo usado:', result.model);
    console.log('Proveedor:', result.provider);
}

// Resultado en modo manual
if (result.type === 'manual') {
    console.log('Prompt para copiar:', result.prompt);
    console.log('Instrucciones:', result.instructions);
}
```

### Construcción de Prompt

El sistema construye automáticamente prompts contextuales:

```javascript
const context = window.aiService.buildContext(chapterId);

// Context incluye:
// - Información del proyecto (título, género, autor)
// - Personajes principales
// - Ubicaciones
// - Escenas
// - Lore/worldbuilding
// - Timeline
// - Capítulo actual
// - Capítulos anteriores (últimos 3)
```

### Test de Conexión

```javascript
const result = await window.aiService.testConnection('anthropic');

if (result.success) {
    console.log('✓ Conexión exitosa');
} else {
    console.log('✗ Error:', result.message);
}
```

### Obtener Estado de Proveedores

```javascript
const status = window.aiService.getProvidersStatus();

// Devuelve array con:
// - id, name, type
// - freeTier, pricing
// - hasApiKey, available
// - models[]
```

---

## 🔐 Seguridad

### Almacenamiento de API Keys

- Las API keys se guardan **en el proyecto** (localStorage/IndexedDB)
- **No se envían a ningún servidor** externo
- Cada proyecto puede tener sus propias API keys
- Las keys se guardan encriptadas en el navegador

### Advertencia de PC Público

Si detecta que estás en un PC público, mostrará una advertencia y no guardará las keys automáticamente.

### Exportar/Importar

Al exportar un proyecto, puedes elegir:
- ✅ **Incluir API keys** (para backup personal)
- ❌ **Excluir API keys** (para compartir el proyecto)

---

## 📊 Construcción de Prompts

El sistema construye prompts inteligentes que incluyen:

### Estructura del Prompt

```markdown
# PROYECTO: Nombre del Proyecto
**Género**: Fantasía

## PERSONAJES PRINCIPALES

### Juan Pérez (protagonist)
Descripción del personaje...
**Personalidad**: Valiente, impulsivo

## WORLDBUILDING
- **Historia del Reino**: Detalles...
- **Sistema de Magia**: Explicación...

## CAPÍTULOS ANTERIORES

**Capítulo 1: El Despertar**
Resumen del capítulo anterior...

## CAPÍTULO ACTUAL: El Descubrimiento
Contenido del capítulo actual...

## TEXTO SELECCIONADO
(Si seleccionaste texto)

---

## INSTRUCCIÓN
Tu instrucción específica aquí

**Modo**: Continuar escribiendo
**Tarea**: [System prompt del modo]
```

### Contexto Inteligente

El sistema solo incluye información relevante:
- Personajes protagonistas y antagonistas (no secundarios)
- Últimos 3 capítulos (no todos)
- Top 5 elementos de lore
- Solo escenas y ubicaciones relevantes

Esto optimiza el uso de tokens y mejora la relevancia.

---

## 🚀 Próximos Pasos

### Integración en el Editor

El siguiente paso es integrar el AI Service en el editor de capítulos para que el usuario pueda:

1. Seleccionar texto en el editor
2. Elegir un modo de asistencia
3. Ver la respuesta de la IA
4. Aceptar/rechazar los cambios

### Features Pendientes

- [ ] Botones de IA en el toolbar del editor
- [ ] Panel lateral con historial de interacciones
- [ ] Shortcuts de teclado (Ctrl+K para comandos IA)
- [ ] Streaming de respuestas (mostrar mientras se genera)
- [ ] Modo diff para ver cambios sugeridos
- [ ] Guardar prompts favoritos
- [ ] Templates de prompts personalizados

---

## 🐛 Troubleshooting

### Error: "API Key no configurada"

**Solución**: Ve a Configuración → APIs de IA → Selecciona proveedor → Ingresa tu API key → Guardar

### Error: "Provider not supported"

**Solución**: Asegúrate de que el proveedor esté habilitado en `ai-service.js`

### Error de CORS (Ollama)

**Solución**: Asegúrate de que Ollama esté corriendo:
```bash
ollama serve
```

Y que permita CORS desde localhost.

### Error: "Model not found"

**Solución**: Verifica que el modelo existe para ese proveedor. Algunos modelos requieren permisos especiales.

### Groq: Rate Limit Exceeded

**Solución**: Espera unos segundos y reintenta. Groq tiene rate limits generosos pero existen.

---

## 📚 Recursos

### Enlaces Útiles

- **Anthropic Claude**: https://docs.anthropic.com/
- **OpenAI**: https://platform.openai.com/docs
- **Google Gemini**: https://ai.google.dev/docs
- **Groq**: https://console.groq.com/docs
- **Together AI**: https://docs.together.ai/
- **Ollama**: https://github.com/ollama/ollama
- **HuggingFace**: https://huggingface.co/docs

### Comparación de Proveedores

**Para escritura creativa recomendamos:**

1. **Calidad máxima**: Claude Sonnet 3.5 (Anthropic)
2. **Velocidad máxima**: Groq (gratis y ultra rápido)
3. **Gratuito completo**: Ollama (local) o Modo Manual
4. **Balance**: Google Gemini Flash (free tier generoso)

---

## ✅ Checklist de Implementación

- [x] Crear `js/services/ai-service.js`
- [x] Soportar múltiples proveedores
- [x] Implementar construcción de prompts
- [x] Agregar API keys al store project
- [x] Crear UI de configuración
- [x] Agregar traducciones ES/EN
- [x] Implementar test de conexión
- [x] Modo manual (copy prompt)
- [x] Soporte para Ollama local
- [ ] Integrar en el editor
- [ ] Agregar streaming
- [ ] Panel de historial

---

## 🎉 Conclusión

El **AI Service** está completamente implementado y listo para usar. Los usuarios pueden:

- Elegir entre 9 proveedores diferentes
- Configurar API keys fácilmente
- Usar el modo manual sin costo
- Generar prompts contextuales inteligentes
- Probar diferentes modelos

**Siguiente paso**: Integrar en el editor de capítulos para permitir la interacción directa con la IA mientras se escribe.

---

**Última actualización**: 2025-11-14
**Autor**: Claude
**Versión**: 1.0
