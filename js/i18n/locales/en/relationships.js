// Character Relationships translations - English
export default {
    title: 'Relationships',
    currentState: 'Current Relationship State',
    currentStateLabel: 'Current State',
    type: 'Type',
    status: 'Status',
    editingRelation: 'Editing relationship',
    history: 'Relationship History',
    addChange: 'Add Change',
    newChange: 'New Change in Relationship',
    editingHistoryEntry: 'Editing History Entry',
    deleteRelationship: 'Delete Relationship',
    addToHistory: 'Add to History',
    addNew: 'Add new relationship',
    create: 'Create Relationship',
    statuses: {
        active: '✅ Active',
        strained: '😰 Strained',
        improving: '📈 Improving',
        deteriorating: '📉 Deteriorating',
        ended: '💔 Ended',
        complicated: '🤔 Complicated'
    },
    form: {
        selectOtherCharacter: 'Select the other character',
        relatedCharacter: 'Related Character *',
        selectCharacterPlaceholder: 'Select a character',
        type: 'Relationship Type *',
        newType: 'New Relationship Type *',
        description: 'Description',
        descriptionPlaceholder: 'Describe the nature of this relationship',
        descriptionHint: 'How did they meet? What unites or separates them?',
        currentStatus: 'Current Status',
        newStatus: 'New Status',
        statusHint: 'You can change this later by associating it with events',
        whatHappened: 'What happened? *',
        whatHappenedPlaceholder: 'Describe what event or situation caused this change in the relationship',
        associatedEvent: 'Associated Event (Optional)',
        startEvent: 'Starting Event (Optional)',
        startEventHint: 'What event in the story started this relationship?',
        additionalNotes: 'Additional Notes',
        additionalNotesPlaceholder: 'Additional details about the relationship...'
    },
    errors: {
        notFound: 'Relationship not found',
        mustSelectCharacter: 'You must select a character',
        alreadyExists: 'A relationship with this character already exists',
        cannotDeleteLastEntry: 'You cannot delete the only history entry. Delete the entire relationship if you want to remove it.'
    },
    success: {
        created: 'Relationship created',
        historyAdded: 'Change added to history',
        historyUpdated: 'History entry updated',
        historyDeleted: 'Entry deleted from history',
        deleted: 'Relationship deleted'
    },
    confirm: {
        deleteHistoryEntry: 'Are you sure you want to delete this history entry?',
        deleteRelationship: 'Are you sure you want to delete this relationship and all its history?'
    }
};
