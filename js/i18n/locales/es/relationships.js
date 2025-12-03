// Traducciones de Relaciones - Español

export default {
    title: 'Relaciones',
    empty: 'No hay relaciones registradas',
    emptyHint: 'Agrega relaciones entre personajes para dar profundidad a tu historia',
    diagram: 'Diagrama de Relaciones',
    legend: 'Leyenda',
    currentState: 'Estado Actual de la Relación',
    currentStateLabel: 'Estado Actual',
    type: 'Tipo',
    status: 'Estado',
    editingRelation: 'Editando relación',
    history: 'Historial de la Relación',
    addChange: 'Agregar Cambio',
    newChange: 'Nuevo Cambio en la Relación',
    editingHistoryEntry: 'Editando Entrada del Historial',
    deleteRelationship: 'Eliminar Relación',
    addToHistory: 'Agregar al Historial',
    addNew: 'Agregar nueva relación',
    create: 'Crear Relación',
    statuses: {
        active: '✅ Activa',
        strained: '😰 Tensa',
        improving: '📈 Mejorando',
        deteriorating: '📉 Deteriorándose',
        ended: '💔 Terminada',
        complicated: '🤔 Complicada'
    },
    form: {
        selectOtherCharacter: 'Selecciona el otro personaje',
        relatedCharacter: 'Personaje Relacionado *',
        selectCharacterPlaceholder: 'Selecciona un personaje',
        type: 'Tipo de Relación *',
        newType: 'Nuevo Tipo de Relación *',
        description: 'Descripción',
        descriptionPlaceholder: 'Describe la naturaleza de esta relación',
        descriptionHint: '¿Cómo se conocieron? ¿Qué los une o separa?',
        currentStatus: 'Estado Actual',
        newStatus: 'Nuevo Estado',
        statusHint: 'Podrás cambiar esto más adelante asociándolo a eventos',
        whatHappened: '¿Qué pasó? *',
        whatHappenedPlaceholder: 'Describe qué evento o situación causó este cambio en la relación',
        associatedEvent: 'Evento Asociado (Opcional)',
        startEvent: 'Evento de Inicio (Opcional)',
        startEventHint: '¿En qué evento de la historia comenzó esta relación?',
        additionalNotes: 'Notas Adicionales',
        additionalNotesPlaceholder: 'Detalles adicionales sobre la relación...'
    },
    errors: {
        notFound: 'No se encontró la relación',
        mustSelectCharacter: 'Debes seleccionar un personaje',
        alreadyExists: 'Ya existe una relación con este personaje',
        cannotDeleteLastEntry: 'No puedes eliminar la única entrada del historial. Elimina toda la relación si quieres borrarla.'
    },
    success: {
        created: 'Relación creada',
        historyAdded: 'Cambio agregado al historial',
        historyUpdated: 'Entrada del historial actualizada',
        historyDeleted: 'Entrada eliminada del historial',
        deleted: 'Relación eliminada'
    },
    confirm: {
        deleteHistoryEntry: '¿Estás seguro de que quieres eliminar esta entrada del historial?',
        deleteRelationship: '¿Estás seguro de que quieres eliminar esta relación y todo su historial?'
    }
};
