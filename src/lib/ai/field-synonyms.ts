// Field synonyms database for intelligent column matching
export const FIELD_SYNONYMS: Record<string, string[]> = {
    // Task fields
    title: ['task', 'name', 'item', 'todo', 'subject', 'heading', 'summary', 'work'],
    description: ['details', 'notes', 'info', 'about', 'comment', 'desc', 'body', 'content'],
    dueDate: ['date', 'deadline', 'due', 'when', 'finish by', 'complete by', 'target', 'eta'],
    priority: ['importance', 'level', 'urgency', 'criticality', 'rank', 'pri'],
    status: ['state', 'progress', 'stage', 'phase', 'condition'],
    completed: ['done', 'finished', 'complete', 'check', 'checked'],

    // Calendar/Event fields
    startTime: ['start', 'begins', 'from', 'start time', 'start date'],
    endTime: ['end', 'finish', 'to', 'end time', 'end date', 'until'],
    location: ['place', 'where', 'venue', 'room', 'address'],
    allDay: ['full day', 'whole day', 'entire day'],

    // Category/Tags
    category: ['type', 'group', 'project', 'area', 'folder'],
    tags: ['labels', 'keywords', 'tag'],

    // Time tracking
    duration: ['time', 'hours', 'minutes', 'elapsed', 'spent'],
    estimatedTime: ['estimate', 'estimated', 'expected time', 'planned'],

    // Recurrence
    recurrenceType: ['recurring', 'repeat', 'frequency', 'recurs'],
}

// Reverse mapping for quick lookup
export const SYNONYM_TO_FIELD: Record<string, string> = {}

for (const [field, synonyms] of Object.entries(FIELD_SYNONYMS)) {
    for (const synonym of synonyms) {
        SYNONYM_TO_FIELD[synonym.toLowerCase()] = field
    }
    // Add the field name itself
    SYNONYM_TO_FIELD[field.toLowerCase()] = field
}

// Get all target fields
export const TARGET_FIELDS = Object.keys(FIELD_SYNONYMS)
