# 🔧 Solución de Problemas: Ollama "Failed to fetch"

## ⚠️ Error: "Failed to fetch"

Este error significa que el **navegador no puede conectarse** a Ollama. Aquí está la solución paso por paso.

---

## 🔍 Diagnóstico Rápido

### Paso 1: Verificar que Ollama está corriendo

Abre tu terminal y ejecuta:

```bash
# Verificar si Ollama está corriendo
curl http://localhost:11434/api/version

# Si funciona, verás algo como:
# {"version":"0.1.x"}

# Si no funciona, verás:
# curl: (7) Failed to connect to localhost port 11434
```

**✅ Si funciona:** Ollama está corriendo, pasa al Paso 2
**❌ Si no funciona:** Ollama no está corriendo, ve a "Iniciar Ollama"

---

## 🚀 Iniciar Ollama Correctamente

### ⚡ Solución Rápida (Prueba esto primero)

**Opción 1: Con CORS habilitado (MÁS IMPORTANTE)**

```bash
# Linux / macOS
OLLAMA_ORIGINS="*" ollama serve

# Windows (PowerShell)
$env:OLLAMA_ORIGINS="*"; ollama serve

# Windows (CMD)
set OLLAMA_ORIGINS=* && ollama serve
```

**Opción 2: Si ya está corriendo, reinícialo**

```bash
# 1. Detener Ollama
# En Linux/macOS: Ctrl+C en la terminal donde corre
# En Windows: Ctrl+C o cerrar la ventana

# 2. Volver a iniciar con CORS
OLLAMA_ORIGINS="*" ollama serve
```

---

### 📋 Verificación Completa

Una vez que Ollama esté corriendo, verifica TODO esto:

```bash
# 1. ¿Está corriendo?
curl http://localhost:11434/api/version

# 2. ¿Tiene modelos?
curl http://localhost:11434/api/tags

# 3. ¿Responde a peticiones?
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3:1.7b",
  "messages": [{"role": "user", "content": "hola"}],
  "stream": false
}'
```

Si **todos** los comandos funcionan, entonces Ollama está bien configurado.

---

## 🌐 Verificar en el Navegador

### Opción A: Test Ollama HTML

1. Abre: `http://localhost:8080/test-ollama.html`
2. Haz clic en **"Probar Conexión con Ollama"**

**Si muestra ❌ Error de CORS:**
- Reinicia Ollama con `OLLAMA_ORIGINS="*"`

**Si muestra ❌ Connection refused:**
- Ollama no está corriendo, ejecuta `ollama serve`

**Si muestra ✅ Verde:**
- ¡Perfecto! Ollama está configurado correctamente

### Opción B: Consola del Navegador

1. Abre PlumAI: `http://localhost:8080`
2. Presiona **F12** para abrir la consola
3. Pega este código y presiona Enter:

```javascript
fetch('http://localhost:11434/api/version')
  .then(r => r.json())
  .then(d => console.log('✅ Ollama funciona:', d))
  .catch(e => console.error('❌ Error:', e.message))
```

**Resultados posibles:**

| Resultado | Causa | Solución |
|-----------|-------|----------|
| `✅ Ollama funciona: {version: "..."}` | Todo está bien | ¡Listo! |
| `❌ Error: Failed to fetch` | CORS bloqueado | Reiniciar con `OLLAMA_ORIGINS="*"` |
| `❌ Error: NetworkError` | Ollama no corre | Ejecutar `ollama serve` |

---

## 🔴 Problema: CORS

**¿Qué es CORS?**
El navegador bloquea peticiones a `localhost:11434` por seguridad, a menos que Ollama permita explícitamente peticiones desde el navegador.

**Solución definitiva:**

### Linux / macOS

Agregar a `~/.bashrc` o `~/.zshrc`:
```bash
export OLLAMA_ORIGINS="*"
```

Luego:
```bash
source ~/.bashrc  # o ~/.zshrc
ollama serve
```

### Windows

**Método 1: PowerShell Profile**
```powershell
# Abrir profile
notepad $PROFILE

# Agregar esta línea:
$env:OLLAMA_ORIGINS="*"

# Guardar y cerrar, luego:
ollama serve
```

**Método 2: Variables de Entorno del Sistema**
1. Buscar "Variables de entorno" en el menú de Windows
2. Agregar nueva variable de sistema:
   - Nombre: `OLLAMA_ORIGINS`
   - Valor: `*`
3. Reiniciar la terminal
4. Ejecutar `ollama serve`

---

## 🔍 Diagnóstico Avanzado

### Ver logs de Ollama

```bash
# Linux/macOS
ollama serve 2>&1 | tee ollama.log

# Luego en otra terminal, intenta usar PlumAI
# Los logs mostrarán si llegan las peticiones
```

### Verificar el puerto

```bash
# Linux/macOS
lsof -i :11434

# Windows
netstat -ano | findstr :11434
```

**Debería mostrar algo como:**
```
ollama  12345  user  TCP *:11434 (LISTEN)
```

Si no aparece nada, Ollama no está corriendo en el puerto 11434.

---

## 📱 Alternativas si CORS no funciona

### Opción 1: Usar el Modo "Copiar Prompt"

1. En PlumAI → Configuración
2. Selecciona **"Copiar Prompt (Manual)"**
3. PlumAI generará el prompt
4. Cópialo y pégalo en Ollama desde la terminal:

```bash
ollama run qwen3:1.7b
# Pega el prompt aquí
```

### Opción 2: Usar un proxy simple

Crear un proxy local que agregue los headers CORS. (Más avanzado)

---

## ✅ Checklist Final

Antes de pedir ayuda, verifica:

- [ ] `ollama --version` funciona
- [ ] `ollama list` muestra tus modelos
- [ ] `ollama serve` está corriendo en una terminal
- [ ] Ejecutaste `ollama serve` con `OLLAMA_ORIGINS="*"`
- [ ] `curl http://localhost:11434/api/version` funciona
- [ ] `test-ollama.html` muestra ✅ verde
- [ ] Reiniciaste el navegador después de iniciar Ollama

Si TODOS estos pasos pasan, PlumAI debería funcionar.

---

## 🆘 Sigue sin funcionar

Si después de TODO esto sigue sin funcionar, comparte:

1. **Sistema operativo:** (Windows/macOS/Linux)
2. **Versión de Ollama:** `ollama --version`
3. **Resultado de:** `curl http://localhost:11434/api/version`
4. **Screenshot de** `test-ollama.html`
5. **Logs de la consola del navegador** (F12)

---

**Última actualización:** 2025-11-14
