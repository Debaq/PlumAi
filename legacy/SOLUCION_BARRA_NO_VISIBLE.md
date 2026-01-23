# Solución: Barra de Track Changes No Visible

## Problema
La barra de controles de Track Changes no aparece en el editor de capítulos.

## Soluciones (en orden de prioridad)

### 1. Limpiar Caché del Navegador (MUY IMPORTANTE)

El navegador está usando archivos antiguos en caché. Necesitas hacer un **Hard Refresh**:

- **Chrome/Edge (Windows/Linux)**: `Ctrl + Shift + R` o `Ctrl + F5`
- **Chrome/Edge (Mac)**: `Cmd + Shift + R`
- **Firefox (Windows/Linux)**: `Ctrl + Shift + R` o `Ctrl + F5`
- **Firefox (Mac)**: `Cmd + Shift + R`
- **Safari (Mac)**: `Cmd + Option + R`

**O mejor aún, limpia la caché completamente:**
1. Abre DevTools (F12)
2. Haz clic derecho en el botón de refrescar (mientras DevTools está abierto)
3. Selecciona "Vaciar caché y volver a cargar forzosamente" / "Empty Cache and Hard Reload"

### 2. Verificar en la Consola del Navegador

1. Abre DevTools (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo (especialmente relacionados con `trackChangesService` o `trackChangesUI`)
4. Busca estos mensajes:
   - `🔍 Track Changes Service initialized`
   - Si no aparece, hay un error de carga

### 3. Verificar que los Archivos se Cargan

En DevTools:
1. Ve a la pestaña "Network" (Red)
2. Recarga la página (F5)
3. Busca estos archivos y verifica que tienen status 200 (OK):
   - `track-changes.css`
   - `track-changes-service.js`
   - `track-changes-ui.js`
4. Si tienen status 304, está usando caché (vuelve al paso 1)

### 4. Probar Manualmente en la Consola

Abre la consola (F12) y ejecuta:

```javascript
// Verificar que el servicio existe
console.log('Service:', window.trackChangesService);

// Verificar que la función UI existe
console.log('UI Function:', window.trackChangesUI);

// Forzar inicialización
if (window.trackChangesService && !window.trackChangesService.enabled) {
    window.trackChangesService.init();
    console.log('Servicio inicializado manualmente');
}
```

### 5. Verificar que estás en un Capítulo

La barra **solo aparece cuando tienes un capítulo abierto**:

1. Ve a la vista "Capítulos" en el sidebar
2. Haz clic en un capítulo existente (o crea uno nuevo)
3. El editor debería abrirse con la barra de controles arriba

### 6. Modo Incógnito/Privado

Como última prueba, abre el proyecto en una ventana de incógnito/privado:
- **Chrome/Edge**: `Ctrl + Shift + N` (Windows) o `Cmd + Shift + N` (Mac)
- **Firefox**: `Ctrl + Shift + P` (Windows) o `Cmd + Shift + P` (Mac)

Esto fuerza al navegador a no usar caché.

## Ubicación de la Barra

La barra debería aparecer:
- **Ubicación**: Arriba del área de escritura, justo debajo del header
- **Contenido**: Botones para "Track Changes: ON/OFF", "Aceptar todos", "Rechazar todos"
- **Color**: Fondo gris oscuro con botones coloridos

## Verificación Visual Rápida

Si ves el editor pero NO ves esta barra de controles horizontal arriba del área de texto, entonces el problema es de caché o errores JavaScript.

## Si Nada Funciona

Si después de limpiar la caché y verificar errores aún no funciona:

1. **Verifica la versión de git**:
   ```bash
   git log -1 --oneline
   ```
   Debería mostrar: `a24a5be Agregar sistema de Track Changes...`

2. **Verifica que los archivos están actualizados**:
   ```bash
   git status
   ```
   Debería mostrar: `On branch claude/ai-edit-visual-feedback-011SLKMHeZdrEmTFyF9XK5HA`
   y no debería haber cambios pendientes

3. **Comparte los errores de la consola** para diagnóstico adicional

## Código de Prueba Rápida

Pega esto en la consola del navegador (F12) cuando estés en el editor:

```javascript
// Test completo de Track Changes
(function() {
    console.log('=== DIAGNÓSTICO TRACK CHANGES ===');

    // 1. Verificar servicio
    console.log('1. Servicio existe:', !!window.trackChangesService);
    console.log('   - Habilitado:', window.trackChangesService?.isEnabled());

    // 2. Verificar función UI
    console.log('2. Función UI existe:', typeof window.trackChangesUI === 'function');

    // 3. Verificar editor
    const editor = document.querySelector('.rich-editor-content');
    console.log('3. Editor existe:', !!editor);

    // 4. Verificar barra de controles
    const controls = document.querySelector('.track-changes-controls');
    console.log('4. Barra de controles existe:', !!controls);
    console.log('   - Visible:', controls ? window.getComputedStyle(controls).display !== 'none' : false);

    // 5. Verificar CSS cargado
    const stylesheets = Array.from(document.styleSheets);
    const trackChangesCSS = stylesheets.find(s => s.href && s.href.includes('track-changes.css'));
    console.log('5. CSS cargado:', !!trackChangesCSS);

    console.log('=== FIN DIAGNÓSTICO ===');
})();
```

Copia el resultado y compártelo si el problema persiste.
