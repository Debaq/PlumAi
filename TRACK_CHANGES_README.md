# Sistema de Track Changes para Ediciones de IA

## Descripción

Este sistema proporciona feedback visual en el editor de capítulos cuando la IA realiza modificaciones al texto. Incluye:

1. **Texto generado por IA en color diferente**: Todo el texto insertado por la IA se muestra en color púrpura con un icono ✨
2. **Tachado para reemplazos**: Cuando la IA reemplaza texto, el original se muestra tachado en rojo y el nuevo texto en verde
3. **Modo Track Changes**: Un modo que se puede activar/desactivar para ver o no los cambios
4. **Controles de gestión**: Botones para aceptar o rechazar todos los cambios

## Características Principales

### 1. Colores Distintivos

- **Texto de IA** (púrpura): `#a78bfa`
  - Aparece cuando la IA genera texto nuevo
  - Incluye icono ✨ como indicador visual
  - Animación al insertar

- **Texto eliminado** (rojo): `#ef4444`
  - Texto original que fue reemplazado
  - Aparece tachado
  - Visible al hacer hover

- **Texto insertado** (verde): `#10b981`
  - Nuevo texto que reemplaza al anterior
  - Subrayado con borde verde
  - Contraste con el texto eliminado

### 2. Modo Track Changes

El modo se puede activar/desactivar desde la barra de controles en el editor:

- **ON**: Todos los cambios de IA se marcan visualmente
- **OFF**: Los cambios se insertan normalmente sin marcado especial

El estado se guarda en `localStorage` para persistir entre sesiones.

### 3. Controles de Gestión

La interfaz incluye una barra de herramientas con:

- **Toggle Track Changes**: Activar/desactivar el modo
- **Aceptar Todos**: Elimina todos los tachados y colores, conservando solo el texto final
- **Rechazar Todos**: Elimina el texto de IA y restaura el original
- **Contador de Cambios**: Muestra cuántos cambios hay pendientes
- **Menú de Opciones**:
  - Ver estadísticas
  - Exportar historial
  - Limpiar historial

### 4. Acciones Individuales

Cada cambio tiene botones inline (aparecen al hacer hover):

- ✓ **Aceptar**: Conserva solo el texto nuevo
- ✕ **Rechazar**: Restaura el texto original

## Arquitectura

### Archivos Creados

1. **`styles/track-changes.css`**: Estilos visuales para el sistema
2. **`js/services/track-changes-service.js`**: Servicio principal que maneja la lógica
3. **`js/components/track-changes-ui.js`**: Componente Alpine.js para la UI

### Archivos Modificados

1. **`js/components/rich-editor-component.js`**:
   - Modificada función `insertAIResponse()` para usar track changes

2. **`js/components/editor-alpine.js`**:
   - Modificadas funciones `insertAtCursor()` y `insertAtEnd()`
   - Agregados parámetros `metadata` para información de la IA

3. **`templates/components/views/editor.html`**:
   - Agregada barra de controles de track changes

4. **`index.html`**:
   - Agregadas referencias a los nuevos archivos CSS y JS

## Uso

### Para el Usuario

1. **Activar Track Changes**:
   - Abre el editor de un capítulo
   - Haz clic en el botón "Track Changes: OFF" para activarlo
   - El botón cambiará a "Track Changes: ON" y tendrá color púrpura

2. **Usar la IA**:
   - Usa cualquier función de IA (Continuar escribiendo, Sugerir mejoras, etc.)
   - El texto generado aparecerá en color púrpura con ✨
   - Si seleccionas texto y pides a la IA que lo reemplace, verás el original tachado y el nuevo en verde

3. **Gestionar Cambios**:
   - **Aceptar un cambio**: Pasa el mouse sobre el cambio y haz clic en ✓
   - **Rechazar un cambio**: Pasa el mouse sobre el cambio y haz clic en ✕
   - **Aceptar todos**: Haz clic en "Aceptar todos" en la barra de herramientas
   - **Rechazar todos**: Haz clic en "Rechazar todos"

4. **Finalizar el Capítulo**:
   - Antes de marcar un capítulo como "Final", acepta o rechaza todos los cambios
   - Esto limpiará el texto de todos los colores y tachados

### Para Desarrolladores

#### Insertar Texto de IA

```javascript
// En cualquier función que inserte texto de IA
const metadata = {
    provider: 'google',
    model: 'gemini-1.5-flash',
    type: 'api',
    mode: 'continue'
};

// Usando el servicio directamente
const editorElement = document.querySelector('.rich-editor-content');
window.trackChangesService.insertAIText(editorElement, text, metadata);

// O usando las funciones del componente
this.insertAtCursor(text, metadata);
this.insertAtEnd(text, metadata);
```

#### Reemplazar Texto Seleccionado

```javascript
const metadata = {
    provider: 'google',
    model: 'gemini-1.5-flash',
    type: 'api'
};

window.trackChangesService.replaceSelectedText(editorElement, newText, metadata);
```

#### Verificar Estado del Modo

```javascript
if (window.trackChangesService.isEnabled()) {
    // El modo está activo
}
```

#### Obtener Estadísticas

```javascript
const stats = window.trackChangesService.getStats(editorElement);
console.log(`Pendientes: ${stats.pending}`);
console.log(`Aceptados: ${stats.accepted}`);
console.log(`Rechazados: ${stats.rejected}`);
```

## Flujo de Trabajo

1. El usuario activa el modo Track Changes
2. La IA genera o modifica texto
3. El servicio envuelve el texto con markup HTML especial
4. Los estilos CSS colorean el texto según el tipo de cambio
5. El usuario revisa los cambios visualmente
6. El usuario acepta o rechaza cambios individuales o todos
7. El servicio limpia el markup y normaliza el texto

## Almacenamiento

El sistema guarda en `localStorage`:

- **`track_changes_enabled`**: Estado del modo (true/false)
- **`track_changes_list`**: Historial de todos los cambios

## Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Frameworks**: Alpine.js 3.x
- **Dependencias**: Lucide Icons para iconos

## Limitaciones Conocidas

1. El texto se guarda como HTML en el editor, por lo que los colores persisten en el archivo
2. Al copiar/pegar desde el editor, se pueden copiar los estilos inline
3. El historial de cambios se guarda en localStorage (límite de ~5MB)

## Mejoras Futuras

- [ ] Modo de comparación lado a lado
- [ ] Historial de versiones con timeline
- [ ] Exportar comparación como PDF
- [ ] Soporte para múltiples usuarios (colaboración)
- [ ] Integración con sistema de comentarios
- [ ] Atajos de teclado para aceptar/rechazar

## Troubleshooting

### Los cambios no se marcan

- Verifica que el modo Track Changes esté activado (botón en ON)
- Revisa la consola del navegador para errores
- Asegúrate de que `track-changes-service.js` esté cargado

### Los colores no se muestran

- Verifica que `track-changes.css` esté cargado
- Revisa las variables CSS (`--text-primary`, etc.)
- Limpia la caché del navegador

### El contador de cambios no se actualiza

- El componente se actualiza cada segundo
- Verifica que `trackChangesUI()` esté inicializado
- Revisa la consola para errores de Alpine.js

## Soporte

Para reportar bugs o sugerir mejoras, crea un issue en el repositorio del proyecto.
