# Mejoras al Sistema de Track Changes

## Fecha: 2025-11-20

## Resumen de Problemas Identificados

El sistema de control de versiones visual (Track Changes) tenía los siguientes problemas:

### 1. **Memoria de cambios global, no por capítulo**
- **Problema**: El array `changes[]` en `track-changes-service.js` era global para todo el proyecto
- **Síntoma**: Al cambiar de capítulo, se perdía el contexto de qué cambios correspondían a cada uno
- **Impacto**: No se podía rastrear correctamente qué texto fue tachado, agregado o modificado por IA en cada capítulo específico

### 2. **No había integración con Git real**
- **Problema**: El sistema llamaba a `createCommit()` que usaba un sistema de control de versiones interno simulado en JavaScript, NO Git del sistema operativo
- **Síntoma**: Al aceptar cambios, no se creaba un commit en el repositorio Git real
- **Impacto**: Los cambios aceptados no quedaban registrados en el historial de Git

### 3. **Persistencia de cambios visuales no garantizada**
- **Problema**: Aunque los spans HTML se guardaban en el contenido, el registro de cambios no estaba sincronizado con el capítulo activo
- **Síntoma**: Al cambiar de capítulo y volver, los colores visuales aparecían pero el sistema no reconocía correctamente los cambios
- **Impacto**: Confusión sobre qué cambios estaban pendientes, aceptados o rechazados

---

## Soluciones Implementadas

### 1. Sistema de Memoria por Capítulo

**Archivos modificados:**
- `/home/user/mdnote/js/services/track-changes-service.js`
- `/home/user/mdnote/js/components/editor-alpine.js`

**Cambios realizados:**

#### A. Estructura de datos modificada (track-changes-service.js)

**Antes:**
```javascript
changes: [], // Array global de todos los cambios
```

**Después:**
```javascript
changesByChapter: {}, // Objeto con cambios por capítulo: { 'chapterId': [...] }
currentChapterId: null, // ID del capítulo actual
```

#### B. Nuevos métodos agregados

```javascript
// Establecer el capítulo actual
setCurrentChapter(chapterId)

// Obtener cambios del capítulo actual
getCurrentChapterChanges()

// Guardar cambios en localStorage
saveChanges()

// Migrar cambios antiguos al nuevo formato
migrateLegacyChanges()
```

#### C. Métodos actualizados

- `registerChange()`: Ahora guarda cambios en el capítulo actual
- `getPendingChanges()`: Filtra cambios del capítulo actual
- `acceptAllChanges()` y `rejectAllChanges()`: Operan solo sobre el capítulo actual
- `getStats()`: Muestra estadísticas del capítulo actual
- Nueva función `getGlobalStats()`: Muestra estadísticas de todos los capítulos

#### D. Integración con el editor (editor-alpine.js)

Al inicializar el editor para un capítulo:
```javascript
if (this.currentChapter?.id) {
    window.trackChangesService.setCurrentChapter(this.currentChapter.id);
}
```

Esto asegura que el servicio siempre sepa qué capítulo está siendo editado.

---

### 2. Integración con Git Real

**Archivos creados/modificados:**
- `/home/user/mdnote/js/services/git-integration.js` (NUEVO)
- `/home/user/mdnote/js/components/track-changes-ui.js`
- `/home/user/mdnote/index.html`

**Cambios realizados:**

#### A. Nuevo servicio: git-integration.js

Proporciona integración con Git real del sistema operativo mediante tres métodos:

1. **Backend HTTP**: Servidor Node.js/Express que ejecuta comandos Git
   ```javascript
   // POST a backend en localhost:3000/git/execute
   ```

2. **Electron API**: Para aplicaciones Electron con acceso nativo al sistema
   ```javascript
   window.electronAPI.executeCommand(command)
   ```

3. **Tauri API**: Para aplicaciones Tauri con acceso nativo
   ```javascript
   window.__TAURI__.shell.Command
   ```

**Funcionalidades:**
- `executeGitCommand(command)`: Ejecuta cualquier comando Git
- `isGitRepository()`: Verifica si estamos en un repo Git
- `add(files)`: Agregar archivos al staging area
- `commit(message)`: Crear commit
- `commitAll(message)`: Add + commit automático
- `getLog(limit)`: Obtener historial de commits
- `push(remote, branch)`: Push a repositorio remoto

#### B. Modificación de track-changes-ui.js

La función `createAutoCommit()` ahora:

1. **Intenta usar isomorphic-git (sistema Git en navegador):**
   ```javascript
   await window.gitService.saveProjectState(projectData, commitMessage);
   const sha = await window.gitService.commit(commitMessage, {...});
   ```

2. **Si git-integration-service está configurado, también crea commit en Git real:**
   ```javascript
   if (window.gitIntegrationService?.isGitAvailable) {
       await window.gitIntegrationService.commitAll(commitMessage);
   }
   ```

3. **Mantiene compatibilidad con sistema interno:**
   ```javascript
   await this.$store.versionControl.createCommit(commitMessage);
   ```

**Flujo completo al aceptar cambios:**
1. Usuario hace clic en "Aceptar todos los cambios y commitear"
2. Se normalizan todos los cambios visuales (se elimina el markup HTML)
3. Se guarda el capítulo
4. Se crea commit en isomorphic-git (funciona siempre)
5. Si hay backend configurado, también se crea commit en Git real
6. Se actualiza el sistema de version control interno
7. Se notifica al usuario el éxito

---

### 3. Persistencia de Cambios Visuales

**Cómo funciona:**

1. **Los spans HTML se insertan en el DOM:**
   ```html
   <span class="ai-generated-text" data-ai-generated="true" data-timestamp="..." data-provider="google">
       Texto generado por IA
   </span>
   ```

2. **Al guardar el capítulo:**
   ```javascript
   const content = this.editor.getContent(); // Obtiene innerHTML con todos los spans
   this.$store.project.updateChapter(chapterId, { content: content });
   ```

3. **Al cargar el capítulo:**
   ```javascript
   initialContent: this.currentChapter?.content || '' // Restaura HTML con spans
   ```

4. **El servicio sincroniza el contexto:**
   ```javascript
   window.trackChangesService.setCurrentChapter(chapterId);
   ```

**Resultado:** Los cambios visuales (colores, tachados, etc.) persisten entre navegaciones de capítulos porque:
- El HTML con los spans se guarda en el contenido del capítulo
- El registro de cambios está ahora asociado al capítulo específico
- Al volver al capítulo, se restaura tanto el HTML visual como el contexto de cambios

---

## Compatibilidad y Migración

### Migración Automática

El sistema migra automáticamente cambios del formato antiguo:

```javascript
migrateLegacyChanges() {
    const legacyChanges = localStorage.getItem('track_changes_list');
    if (legacyChanges) {
        // Asigna cambios legacy a un capítulo especial
        this.changesByChapter['legacy-unknown'] = JSON.parse(legacyChanges);
        localStorage.removeItem('track_changes_list');
    }
}
```

### Retrocompatibilidad

- El sistema interno de version control sigue funcionando
- Si no hay Git disponible, usa solo isomorphic-git
- Los métodos antiguos siguen disponibles para código legacy

---

## Configuración para Git Real

### Opción 1: Backend Node.js

Crear un servidor simple:

```javascript
// server.js
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.post('/git/execute', (req, res) => {
    const { command } = req.body;

    // Validar comando por seguridad
    if (!command.startsWith('git ')) {
        return res.status(400).json({ error: 'Solo comandos Git permitidos' });
    }

    exec(command, { cwd: '/path/to/project' }, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: stderr });
        }
        res.json({ output: stdout });
    });
});

app.listen(3000);
```

### Opción 2: Electron

En el main process:

```javascript
const { ipcMain } = require('electron');
const { exec } = require('child_process');

ipcMain.handle('execute-git-command', async (event, command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) reject(stderr);
            else resolve(stdout);
        });
    });
});
```

En el renderer:

```javascript
window.electronAPI = {
    executeCommand: (cmd) => window.electron.ipcRenderer.invoke('execute-git-command', cmd)
};
```

### Opción 3: Sin configuración adicional

El sistema usa isomorphic-git automáticamente, que funciona completamente en el navegador sin necesidad de backend. Los commits se guardan en un filesystem virtual (LightningFS).

---

## Testing

### Verificar que funciona:

1. **Abrir un capítulo y hacer cambios:**
   - Activar modo edición
   - Escribir texto (debería aparecer en verde)
   - Usar IA para generar texto (debería aparecer en púrpura)

2. **Cambiar a otro capítulo:**
   - Abrir un capítulo diferente
   - Hacer otros cambios
   - Volver al capítulo original

3. **Verificar persistencia:**
   - Los cambios visuales del primer capítulo deben seguir visibles
   - Abrir consola y ejecutar:
     ```javascript
     window.trackChangesService.getGlobalStats()
     // Debería mostrar cambios separados por capítulo
     ```

4. **Aceptar cambios y commitear:**
   - Click en "Aceptar todos los cambios y commitear"
   - Verificar en consola que se creó el commit
   - Si hay backend configurado, verificar con `git log` en terminal

---

## Archivos Modificados

1. `/home/user/mdnote/js/services/track-changes-service.js`
   - Cambio de estructura de datos de global a por-capítulo
   - Nuevos métodos para gestión por capítulo
   - Migración automática de datos legacy

2. `/home/user/mdnote/js/components/editor-alpine.js`
   - Establece capítulo actual al inicializar editor

3. `/home/user/mdnote/js/components/track-changes-ui.js`
   - Nueva función `createAutoCommit()` con integración Git real
   - Soporte para múltiples backends (isomorphic-git, Git real, sistema interno)

4. `/home/user/mdnote/js/services/git-integration.js` (NUEVO)
   - Servicio de integración con Git real
   - Soporte para backend HTTP, Electron y Tauri

5. `/home/user/mdnote/index.html`
   - Agregado script de git-integration.js

---

## Beneficios

### Para el Usuario

1. **Cambios por capítulo:** Cada capítulo mantiene su propio historial visual de cambios
2. **Persistencia completa:** Los cambios visuales se mantienen incluso al cambiar de capítulo
3. **Commits en Git real:** Los cambios aceptados se registran en el repositorio Git
4. **Mejor organización:** Estadísticas y gestión separada por capítulo

### Para el Desarrollador

1. **Arquitectura limpia:** Separación clara entre cambios de diferentes capítulos
2. **Extensibilidad:** Fácil agregar nuevas funcionalidades por capítulo
3. **Debugging mejorado:** Métodos para obtener stats globales y por capítulo
4. **Retrocompatibilidad:** El código antiguo sigue funcionando

---

## Próximos Pasos Sugeridos

1. **Implementar backend para Git real** (opcional)
2. **Agregar UI para ver historial de cambios por capítulo**
3. **Permitir comparar versiones entre capítulos**
4. **Agregar exportación de cambios por capítulo**
5. **Implementar sistema de revisión colaborativa**

---

## Contacto y Soporte

Para reportar bugs o sugerir mejoras, crear un issue en el repositorio del proyecto.
