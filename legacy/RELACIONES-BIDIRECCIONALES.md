# Sistema de Relaciones Bidireccionales Inteligentes

## Descripción General

PlumAI ahora cuenta con un sistema inteligente de relaciones bidireccionales que maneja automáticamente las relaciones entre personajes según su naturaleza.

## Tipos de Relaciones

### 1. Relaciones Simétricas (Bidireccionales Automáticas)

Estas relaciones se crean automáticamente en ambas direcciones con el **mismo tipo**:

- **friend** (amigo) → Si Aria es amiga de Kael, Kael es automáticamente amigo de Aria
- **family** (familia) → Relaciones familiares son siempre bidireccionales
- **acquaintance** (conocido) → Mutuo conocimiento
- **colleague** (colega) → Compañeros de trabajo
- **collaborator** (colaborador) → Colaboración mutua
- **ally** (aliado) → Alianza mutua
- **rival** (rival) → Rivalidad mutua
- **neighbor** (vecino) → Vecindad mutua
- **partner** (socio/pareja) → Sociedad mutua
- **businessPartner** (socio de negocios) → Negocio compartido
- **ex** (ex pareja) → Relación pasada mutua

### 2. Relaciones Asimétricas (Con Inversa Específica)

Estas relaciones crean automáticamente una relación inversa con un **tipo diferente**:

- **mentor** ↔ **student** (mentor ↔ estudiante)
- **teacher** ↔ **student** (profesor ↔ estudiante)
- **boss** ↔ **subordinate** (jefe ↔ subordinado)
- **guardian** ↔ **ward** (tutor ↔ pupilo)
- **hero** ↔ **villain** (héroe ↔ villano)
- **sidekick** → **hero** (compañero → héroe)

**Ejemplo:** Si marcas que Aria es mentora de Kael, automáticamente Kael será marcado como estudiante de Aria.

### 3. Relaciones Unilaterales (No Automáticas)

Estas relaciones **NO** crean automáticamente una relación inversa, permitiendo relaciones no correspondidas:

- **love** (amor) → Puede ser amor no correspondido
- **enemy** (enemigo) → La enemistad puede ser unilateral
- **crush** (enamoramiento) → Típicamente unilateral
- **rivalLove** (amor rival) → Amor no correspondido
- **archenemy** (archienemigo) → Némesis puede ser unilateral

**Ejemplo:** Si Aria está enamorada de Kael, esto NO crea automáticamente que Kael esté enamorado de Aria. Debes crear esa relación manualmente si es mutua.

## Cómo Funciona en la Práctica

### Creación de Relaciones

1. **Relación Simétrica:**
   ```
   Usuario: Aria → friend → Kael
   Sistema: ✅ Crea automáticamente: Kael → friend → Aria
   ```

2. **Relación Asimétrica:**
   ```
   Usuario: Aria → mentor → Kael
   Sistema: ✅ Crea automáticamente: Kael → student → Aria
   ```

3. **Relación Unilateral:**
   ```
   Usuario: Aria → love → Kael
   Sistema: ❌ NO crea relación automática

   Si el amor es correspondido, el usuario debe crear:
   Usuario: Kael → love → Aria (manualmente)
   ```

### Actualización de Relaciones

Cuando actualizas el tipo de una relación existente:
- **Simétricas y Asimétricas:** La relación inversa se actualiza automáticamente
- **Unilaterales:** Solo se actualiza la relación que modificaste

### Eliminación de Relaciones

Al eliminar una relación:
- Si tiene relación inversa automática, también se elimina
- Si es unilateral, solo se elimina la que seleccionaste

## Ventajas del Sistema

1. **Menos Trabajo Manual:** No necesitas crear las relaciones familiares o de amistad dos veces
2. **Consistencia:** Las relaciones simétricas siempre están sincronizadas
3. **Flexibilidad:** Permite relaciones complejas como amor no correspondido
4. **Realismo:** Refleja mejor las relaciones reales donde no todo es mutuo

## Casos de Uso Comunes

### Familia
```
Aria → family → Kael
✅ Automático: Kael → family → Aria
```

### Mentor y Aprendiz
```
Gandalf → mentor → Frodo
✅ Automático: Frodo → student → Gandalf
```

### Amor No Correspondido
```
Sam → love → Frodo
❌ NO automático
Frodo podría tener → friend → Sam (diferentes tipos)
```

### Enemigos Mutuos
```
Héroe → enemy → Villano
❌ NO automático (permite enemistades unilaterales)

Para enemistad mutua, agregar manualmente:
Villano → enemy → Héroe
```

## Implementación Técnica

El sistema está implementado en:
- `js/stores/project-global.js:800-885` - Lógica de tipos inversos
- `js/stores/project-global.js:477-537` - Creación de relaciones simétricas
- `js/stores/project-global.js:644-676` - Actualización de relaciones simétricas

---

**Nota:** Este sistema respeta la complejidad de las relaciones humanas, permitiéndote crear historias más ricas y realistas.
