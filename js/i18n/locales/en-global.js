// English Translations
window.translations_en = {
    // Common
    common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        close: 'Close',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        export: 'Export',
        import: 'Import',
        loading: 'Loading...',
        noResults: 'No results',
        confirm: 'Confirm',
        confirmDelete: 'Are you sure you want to delete this?',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        yes: 'Yes',
        no: 'No',
        optional: 'Optional',
        required: 'Required'
    },

    // Header
    header: {
        title: 'PlumaAI',
        subtitle: 'AI-Powered Novel Editor',
        newProject: 'New Project',
        loadProject: 'Load Project',
        saveProject: 'Save Project',
        settings: 'Settings',
        help: 'Help'
    },

    // Sidebar
    sidebar: {
        dashboard: 'Dashboard',
        characters: 'Characters',
        chapters: 'Chapters',
        scenes: 'Scenes',
        locations: 'Locations',
        timeline: 'Timeline',
        aiAssistant: 'AI Assistant',
        notes: 'Notes',
        settings: 'Settings',
        collapse: 'Collapse',
        expand: 'Expand'
    },

    // Dashboard
    dashboard: {
        title: 'Dashboard',
        subtitle: 'Overview of your project',
        stats: {
            words: 'Words',
            chapters: 'Chapters',
            characters: 'Characters',
            scenes: 'Scenes'
        },
        recentActivity: {
            title: 'Recent Activity',
            empty: 'No recent activity',
            hint: 'Start by creating characters, scenes or chapters'
        },
        quickActions: {
            title: 'Quick Actions',
            newChapter: 'New Chapter',
            newCharacter: 'New Character',
            newScene: 'New Scene',
            openEditor: 'Open Editor'
        }
    },

    // Characters
    characters: {
        title: 'Characters',
        subtitle: 'Manage your novel characters',
        new: 'New Character',
        edit: 'Edit Character',
        empty: 'No characters created',
        emptyHint: 'Create your first character to get started',
        form: {
            name: 'Name',
            namePlaceholder: 'E.g: John Doe',
            role: 'Role',
            rolePlaceholder: 'Select a role',
            roles: {
                protagonist: 'Protagonist',
                antagonist: 'Antagonist',
                secondary: 'Secondary',
                supporting: 'Supporting'
            },
            description: 'Physical Description',
            descriptionPlaceholder: 'Describe the character\'s physical appearance',
            personality: 'Personality',
            personalityPlaceholder: 'Describe the character\'s personality',
            background: 'Background Story',
            backgroundPlaceholder: 'Tell the character\'s story',
            notes: 'Additional Notes',
            notesPlaceholder: 'Other notes about the character'
        },
        delete: {
            title: 'Delete Character',
            message: 'Are you sure you want to delete {name}?',
            warning: 'This action cannot be undone'
        }
    },

    // Scenes
    scenes: {
        title: 'Scenes',
        subtitle: 'Organize your story scenes',
        new: 'New Scene',
        edit: 'Edit Scene',
        empty: 'No scenes created',
        emptyHint: 'Create your first scene',
        form: {
            title: 'Title',
            titlePlaceholder: 'E.g: Meeting at the cafe',
            chapter: 'Chapter',
            chapterPlaceholder: 'Select a chapter',
            description: 'Description',
            descriptionPlaceholder: 'Describe what happens in this scene',
            characters: 'Characters',
            charactersPlaceholder: 'Select participating characters',
            location: 'Location',
            locationPlaceholder: 'Where the scene takes place',
            timelinePosition: 'Timeline Position',
            notes: 'Notes'
        }
    },

    // Locations
    locations: {
        title: 'Locations',
        subtitle: 'Manage your novel locations',
        new: 'New Location',
        edit: 'Edit Location',
        empty: 'No locations created',
        emptyHint: 'Create your first location',
        form: {
            name: 'Name',
            namePlaceholder: 'E.g: Central Café',
            description: 'Description',
            descriptionPlaceholder: 'Describe this place'
        }
    },

    // Chapters
    chapters: {
        title: 'Chapters',
        subtitle: 'Write and organize your chapters',
        new: 'New Chapter',
        edit: 'Edit Chapter',
        empty: 'No chapters created',
        emptyHint: 'Create your first chapter to start writing',
        chapter: 'Chapter',
        form: {
            number: 'Number',
            title: 'Title',
            titlePlaceholder: 'Chapter title',
            content: 'Content',
            status: 'Status',
            statuses: {
                draft: 'Draft',
                review: 'In Review',
                final: 'Final'
            }
        },
        stats: {
            words: '{count} words',
            scenes: '{count} scenes',
            modified: 'Modified: {date}'
        },
        openEditor: 'Open in Editor',
        delete: {
            title: 'Delete Chapter',
            message: 'Are you sure you want to delete Chapter {number}?',
            warning: 'This action cannot be undone'
        }
    },

    // Timeline
    timeline: {
        title: 'Timeline',
        subtitle: 'Visualize your story chronology',
        new: 'New Event',
        edit: 'Edit Event',
        empty: 'No events in timeline',
        emptyHint: 'Add events to organize the chronology',
        form: {
            date: 'Date',
            datePlaceholder: 'E.g: May 15, 1990',
            event: 'Event',
            eventPlaceholder: 'What happens on this date',
            description: 'Description',
            descriptionPlaceholder: 'Event details',
            scenes: 'Related scenes',
            chapters: 'Related chapters',
            notes: 'Notes'
        }
    },

    // AI Assistant
    ai: {
        title: 'AI Assistant',
        subtitle: 'Work with artificial intelligence',
        status: {
            active: 'AI Active',
            inactive: 'AI Inactive',
            processing: 'Processing...'
        },
        modes: {
            write: 'AI Writes',
            assist: 'AI Assists'
        },
        prompt: {
            label: 'Instruction for AI',
            placeholder: 'Tell the AI what you want it to do...',
            examples: {
                write: 'Example: Write a chapter where {character} discovers a secret',
                assist: 'Example: Suggest improvements for this paragraph'
            }
        },
        actions: {
            generate: 'Generate',
            apply: 'Apply Changes',
            reject: 'Reject',
            retry: 'Retry'
        },
        history: {
            title: 'History',
            empty: 'No interactions yet',
            user: 'You',
            assistant: 'AI'
        },
        settings: {
            title: 'AI Configuration',
            apiKeys: 'API Keys',
            model: 'Model',
            temperature: 'Temperature',
            maxTokens: 'Max Tokens',
            noApiKey: 'No API key configured',
            configure: 'Configure'
        }
    },

    // Notes
    notes: {
        title: 'Notes',
        subtitle: 'Save ideas and annotations',
        new: 'New Note',
        empty: 'No notes',
        emptyHint: 'Create a note to save ideas',
        form: {
            title: 'Title',
            titlePlaceholder: 'Note title',
            content: 'Content',
            contentPlaceholder: 'Write your note here...'
        }
    },

    // Editor
    editor: {
        title: 'Editor',
        toolbar: {
            bold: 'Bold',
            italic: 'Italic',
            underline: 'Underline',
            heading: 'Heading',
            bulletList: 'Bullet List',
            numberedList: 'Numbered List',
            quote: 'Quote',
            undo: 'Undo',
            redo: 'Redo'
        },
        wordCount: '{count} words',
        saving: 'Saving...',
        saved: 'Saved',
        placeholder: 'Start writing your story...'
    },

    // Modals
    modals: {
        welcome: {
            title: 'Welcome to PlumaAI!',
            subtitle: 'AI-powered novel editor',
            description: 'Get started by creating a new project or loading an existing one',
            newProject: 'Create New Project',
            loadProject: 'Load Existing Project',
            getStarted: 'Get Started'
        },
        newProject: {
            title: 'New Project',
            form: {
                title: 'Novel Title',
                titlePlaceholder: 'E.g: The Lighthouse Mystery',
                author: 'Author',
                authorPlaceholder: 'Your name',
                genre: 'Genre',
                genrePlaceholder: 'E.g: Mystery, Fantasy, Romance',
                isPublicPC: 'I\'m using a public PC',
                publicPCWarning: 'Data will not be saved automatically'
            }
        },
        projectSettings: {
            title: 'Project Settings',
            tabs: {
                general: 'General',
                api: 'AI APIs',
                preferences: 'Preferences'
            }
        },
        apiKeys: {
            title: 'Configure AI APIs',
            description: 'Set up API keys to use AI features',
            providers: {
                claude: 'Claude (Anthropic)',
                kimi: 'Kimi (Moonshot)',
                replicate: 'Replicate',
                qwen: 'Qwen (Alibaba)'
            },
            form: {
                key: 'API Key',
                keyPlaceholder: 'Enter your API key',
                test: 'Test connection',
                status: {
                    valid: 'Valid',
                    invalid: 'Invalid',
                    testing: 'Testing...'
                }
            },
            warning: 'Keys are stored on your device and not sent to any server',
            publicPCWarning: 'Warning: You\'re on a public PC. Keys will not be saved automatically'
        },
        export: {
            title: 'Export Project',
            description: 'Download your project as a JSON file',
            includeApiKeys: 'Include API keys',
            filename: 'Filename',
            download: 'Download'
        },
        import: {
            title: 'Import Project',
            description: 'Load a project from a JSON file',
            selectFile: 'Select file',
            selected: 'File selected: {filename}',
            warning: 'This will replace the current project'
        }
    },

    // Status bar
    status: {
        words: '{count} words',
        autosave: {
            enabled: 'Autosave enabled',
            disabled: 'Autosave disabled',
            saving: 'Saving...',
            saved: 'Saved at {time}'
        },
        ai: {
            active: 'AI ready',
            inactive: 'AI not configured',
            processing: 'AI processing...'
        }
    },

    // Notifications
    notifications: {
        success: {
            projectCreated: 'Project created successfully',
            projectSaved: 'Project saved',
            projectLoaded: 'Project loaded',
            characterCreated: 'Character created',
            characterUpdated: 'Character updated',
            characterDeleted: 'Character deleted',
            sceneCreated: 'Scene created',
            sceneUpdated: 'Scene updated',
            sceneDeleted: 'Scene deleted',
            chapterCreated: 'Chapter created',
            chapterUpdated: 'Chapter updated',
            chapterDeleted: 'Chapter deleted',
            locationCreated: 'Location created',
            locationUpdated: 'Location updated',
            locationDeleted: 'Location deleted',
            eventCreated: 'Event created',
            eventUpdated: 'Event updated',
            eventDeleted: 'Event deleted',
            noteCreated: 'Note created',
            noteUpdated: 'Note updated',
            noteDeleted: 'Note deleted'
        },
        error: {
            generic: 'An error occurred',
            loadProject: 'Error loading project',
            saveProject: 'Error saving project',
            invalidFile: 'Invalid file',
            apiError: 'API error',
            noApiKey: 'No API key configured'
        }
    },

    // Validation
    validation: {
        required: 'This field is required',
        minLength: 'Minimum {min} characters',
        maxLength: 'Maximum {max} characters',
        invalid: 'Invalid value'
    }
};
