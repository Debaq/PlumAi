# 🦙 Guía de Configuración de Ollama para PlumAI

## 1️⃣ Instalar Ollama (si no lo tienes)

### macOS / Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
Descarga desde: https://ollama.com/download

## 2️⃣ Iniciar Ollama con CORS Habilitado

**El problema más común es CORS**. El navegador bloquea las peticiones a Ollama si no está configurado correctamente.

### Opción A: Con variables de entorno (RECOMENDADO)

```bash
# Linux / macOS
OLLAMA_ORIGINS="*" ollama serve

# Windows (PowerShell)
$env:OLLAMA_ORIGINS="*"
ollama serve

# Windows (CMD)
set OLLAMA_ORIGINS=*
ollama serve
```

### Opción B: Configuración permanente

**Linux / macOS** (agregar a `~/.bashrc` o `~/.zshrc`):
```bash
export OLLAMA_ORIGINS="*"
```

**Windows** (Variables de Entorno del Sistema):
1. Buscar "Variables de entorno"
2. Agregar nueva variable: `OLLAMA_ORIGINS` con valor `*`
3. Reiniciar terminal

## 3️⃣ Descargar un Modelo

```bash
# Modelo recomendado (pequeño y rápido)
ollama pull llama3.2

# Otros modelos disponibles:
ollama pull qwen2.5
ollama pull mistral
ollama pull gemma2

# Ver modelos descargados
ollama list
```

## 4️⃣ Verificar que Funciona

### En tu terminal:
```bash
# Verificar versión
ollama --version

# Ver modelos
ollama list

# Test rápido
ollama run llama3.2 "Di hola"
```

### En el navegador:
1. Abre: `http://localhost:8080/test-ollama.html`
2. Haz clic en "Probar Conexión con Ollama"
3. Debería mostrar ✅ verde

## 5️⃣ Usar en PlumAI

1. Abre PlumAI: `http://localhost:8080`
2. Ve a **Configuración** (⚙️)
3. En la sección **APIs de IA**:
   - Selecciona **Ollama (Local)**
   - **PlumAI detectará automáticamente** los modelos que tienes instalados 🎉
   - Selecciona tu modelo (ej: `qwen3:1.7b`, `glm-4.6:cloud`)
   - Haz clic en **Guardar**
4. ¡Listo! Ya puedes usar IA 100% gratis

### 🔄 Auto-detección de Modelos

PlumAI detecta automáticamente los modelos instalados cuando seleccionas Ollama. Si instalas nuevos modelos:
1. Ve a Configuración
2. Cambia a otro proveedor y vuelve a seleccionar Ollama
3. Los nuevos modelos aparecerán en la lista

## ❌ Solución de Problemas

### Error: "Connection refused" o "Failed to fetch"
**Causa**: Ollama no está corriendo
**Solución**:
```bash
ollama serve
```

### Error: "CORS policy"
**Causa**: Ollama no permite peticiones desde el navegador
**Solución**: Iniciar con CORS habilitado:
```bash
OLLAMA_ORIGINS="*" ollama serve
```

### Error: "Model not found"
**Causa**: No has descargado ningún modelo
**Solución**:
```bash
ollama pull llama3.2
```

### Error: "No se pudo conectar"
**Causa**: Ollama está en otro puerto
**Solución**: Verifica que esté en el puerto 11434:
```bash
# Linux/macOS
lsof -i :11434

# Windows
netstat -ano | findstr :11434
```

## 📊 Modelos Recomendados

| Modelo | Tamaño | Velocidad | Calidad | Uso |
|--------|--------|-----------|---------|-----|
| `llama3.2` | ~2GB | ⚡⚡⚡ | ⭐⭐⭐ | General, diálogos |
| `qwen2.5` | ~4GB | ⚡⚡ | ⭐⭐⭐⭐ | Escritura creativa |
| `mistral` | ~4GB | ⚡⚡ | ⭐⭐⭐ | Análisis, worldbuilding |
| `gemma2` | ~5GB | ⚡ | ⭐⭐⭐⭐ | Alta calidad |

## 🔧 Comandos Útiles

```bash
# Ver modelos descargados
ollama list

# Eliminar un modelo
ollama rm llama3.2

# Ver logs
ollama logs

# Actualizar Ollama
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Info del sistema
ollama show llama3.2
```

## 💡 Tips

1. **Primer uso**: La primera vez que uses un modelo, puede tardar un poco en cargar en RAM
2. **RAM requerida**: Asegúrate de tener al menos 8GB RAM para modelos de 4GB
3. **Velocidad**: Los modelos más pequeños (llama3.2) son más rápidos pero menos precisos
4. **Persistencia**: Ollama mantiene los modelos en RAM entre peticiones para ser más rápido

## 📝 Verificación Rápida

Corre esto en tu terminal:
```bash
# Test completo
ollama --version && \
ollama list && \
curl http://localhost:11434/api/version
```

Si todo funciona, deberías ver:
- ✅ Versión de Ollama
- ✅ Lista de modelos
- ✅ Respuesta JSON con versión

---

**¿Sigue sin funcionar?** Abre `test-ollama.html` en tu navegador y comparte los mensajes de error.
