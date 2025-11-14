# 🚀 Cómo Iniciar Ollama para PlumAI

## ⚠️ El Problema

El error **"Failed to fetch"** ocurre porque el navegador bloquea la conexión a Ollama por seguridad (CORS).

## ✅ La Solución (3 pasos)

### Paso 1: Cerrar Ollama si está corriendo

Si Ollama ya está corriendo, ciérralo primero:
- Presiona `Ctrl + C` en la terminal donde está corriendo
- O cierra la ventana/app de Ollama

### Paso 2: Iniciar Ollama con CORS habilitado

**Elige según tu sistema operativo:**

#### 🐧 Linux / macOS

```bash
# Opción A: Usando el script
cd /ruta/a/PlumAi
./START-OLLAMA.sh

# Opción B: Comando directo
OLLAMA_ORIGINS="*" ollama serve
```

#### 🪟 Windows (PowerShell)

```powershell
# Opción A: Usando el script
cd C:\ruta\a\PlumAi
.\START-OLLAMA.ps1

# Opción B: Comando directo
$env:OLLAMA_ORIGINS="*"
ollama serve
```

#### 🪟 Windows (CMD)

```cmd
# Opción A: Usando el script
cd C:\ruta\a\PlumAi
START-OLLAMA.bat

# Opción B: Comando directo
set OLLAMA_ORIGINS=*
ollama serve
```

**⚠️ IMPORTANTE:** Deja esa terminal abierta mientras uses PlumAI

### Paso 3: Verificar la conexión

#### Opción A: Comando curl

Abre **otra terminal nueva** (sin cerrar la de Ollama) y ejecuta:

```bash
curl http://localhost:11434/api/version
```

**Resultado esperado:**
```json
{"version":"0.1.47"}
```

Si ves eso, ¡Ollama está funcionando! 🎉

#### Opción B: Navegador

Abre: `http://localhost:8080/test-ollama.html`

Debería mostrar **✅ verde** en "Conexión con Ollama"

---

## 🔍 Verificación Completa

Ejecuta estos 3 comandos (en una terminal **diferente** a donde corre Ollama):

```bash
# 1. Verificar versión
curl http://localhost:11434/api/version

# 2. Ver modelos instalados
curl http://localhost:11434/api/tags

# 3. Test rápido de chat
curl http://localhost:11434/api/chat -d '{
  "model": "qwen3:1.7b",
  "messages": [{"role": "user", "content": "di hola"}],
  "stream": false
}'
```

Si **los 3 comandos funcionan**, PlumAI debería conectarse sin problemas.

---

## 🎯 Usar PlumAI con Ollama

Una vez que Ollama esté corriendo con CORS:

1. Abre PlumAI: `http://localhost:8080`
2. Presiona `Ctrl + Shift + R` para limpiar caché
3. Ve a **Configuración** (⚙️)
4. Selecciona **"Ollama (Local)"**
5. Selecciona tu modelo: **qwen3:1.7b**
6. Clic en **Guardar**
7. ¡Listo! 🎉

---

## ❌ Si sigue sin funcionar

### Prueba 1: Verificar en la consola del navegador

1. Abre PlumAI: `http://localhost:8080`
2. Presiona **F12**
3. Ve a la pestaña **Console**
4. Pega este código y presiona Enter:

```javascript
fetch('http://localhost:11434/api/version')
  .then(r => r.json())
  .then(d => console.log('✅ Funciona:', d))
  .catch(e => console.error('❌ Error:', e))
```

**Si dice `✅ Funciona:`** → Ollama está bien, el problema está en PlumAI
**Si dice `❌ Error: Failed to fetch`** → Ollama no tiene CORS habilitado
**Si dice `❌ Error: NetworkError`** → Ollama no está corriendo

### Prueba 2: Reiniciar todo

1. Cerrar Ollama (Ctrl+C)
2. Cerrar el navegador completamente
3. Iniciar Ollama de nuevo con el script
4. Abrir el navegador y PlumAI

---

## 📋 Checklist de Diagnóstico

Marca lo que funciona:

- [ ] `ollama --version` muestra la versión
- [ ] `ollama list` muestra tus modelos (qwen3:1.7b, glm-4.6:cloud)
- [ ] Iniciaste Ollama con `OLLAMA_ORIGINS="*"`
- [ ] `curl http://localhost:11434/api/version` funciona
- [ ] `test-ollama.html` muestra ✅ verde
- [ ] La consola del navegador NO muestra errores de CORS

Si TODO está marcado, PlumAI debería funcionar.

---

## 🆘 Comparte esto si sigue sin funcionar

1. **Tu sistema operativo:** (Windows 10/11, macOS, Linux)
2. **Versión de Ollama:**
   ```bash
   ollama --version
   ```
3. **Resultado de:**
   ```bash
   curl http://localhost:11434/api/version
   ```
4. **Screenshot de:** `test-ollama.html`
5. **Errores en la consola del navegador** (F12 → Console)

---

**Última actualización:** 2025-11-14
**Archivos incluidos:**
- `START-OLLAMA.sh` (Linux/macOS)
- `START-OLLAMA.bat` (Windows CMD)
- `START-OLLAMA.ps1` (Windows PowerShell)
