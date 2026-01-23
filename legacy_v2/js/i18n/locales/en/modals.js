// Modals translations - English
export default {
    welcome: {
        title: 'Welcome to PlumaAI!',
        subtitle: 'AI-powered novel editor',
        description: 'Get started by creating a new project or loading an existing one',
        selectLanguage: 'Select your language:',
        newProject: 'Create New Project',
        loadProject: 'Load Existing Project',
        continueProject: 'Continue with "{projectName}"',
        justLook: 'Just Look Around',
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
            openai: 'OpenAI (ChatGPT)',
            google: 'Google Gemini',
            groq: 'Groq (Ultra fast)',
            together: 'Together AI',
            replicate: 'Replicate',
            huggingface: 'HuggingFace',
            ollama: 'Ollama (Local)',
            manual: 'Copy Prompt (Manual)',
            kimi: 'Kimi (Moonshot)',
            qwen: 'Qwen (Alibaba)'
        },
        providerInfo: {
            claude: 'Anthropic API - $5 free',
            openai: 'OpenAI API - Paid only',
            google: 'Google API - Generous free tier',
            groq: 'Generous FREE tier - Ultra fast',
            together: '$25 free tier on signup',
            replicate: 'Various models - Pay per use',
            huggingface: 'Some models free',
            ollama: '100% FREE - Requires local installation',
            manual: '100% FREE - Copy prompt to any AI'
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
        description: 'Download your project as a PLUMA file (*.pluma)',
        includeApiKeys: 'Include API keys',
        filename: 'Filename',
        download: 'Download',
        formatWithImages: 'Format: PLUMA with images',
        securityRequired: 'Security (Required)',
        securityOptional: 'Security (Optional)',
        apiKeysWarning: 'This project contains API keys. For security, it is mandatory to encrypt them. If you forget the password, you will only lose the keys, not the project.',
        encryptApiKeysRequired: 'Encrypt API keys (required)',
        apiKeysAutoEncrypt: 'Detected API keys will be automatically encrypted',
        encryptAll: 'Encrypt entire project',
        encryptAllHint: 'Maximum privacy - encrypts all content (includes API keys)',
        password: 'Encryption password',
        passwordPlaceholder: 'Minimum 12 characters',
        passwordHint: 'Use a strong password. If you forget it, you cannot recover the data.',
        confirmPassword: 'Confirm password',
        confirmPasswordPlaceholder: 'Repeat the password',
        success: 'Project exported',
        successDetails: 'File downloaded successfully',
        errors: {
            passwordRequired: 'You must enter a password',
            passwordTooShort: 'Password must be at least 12 characters',
            passwordMismatch: 'Passwords do not match',
            exportFailed: 'Could not export project'
        }
    },
    import: {
        title: 'Import Project',
        description: 'Load a project from a PLUMA file (*.pluma)',
        selectFile: 'Select file',
        selected: 'File selected: {filename}',
        warning: 'This will replace the current project',
        success: 'Project imported',
        encryptedFile: 'Encrypted File'
    },
    password: {
        title: 'Password Required',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        encryptAll: 'Encrypt entire project'
    },
    manageImage: {
        title: 'Manage Image'
    },
    avatarSelector: {
        automaticProvider: 'Automatic (use first available)',
        seedHint: '- If empty, it will be generated automatically',
        generateImage: 'Generate Image',
        generatedSuccessfully: 'Image generated successfully',
        customImageLoaded: 'Custom image loaded'
    },
    projectsList: {
        title: 'My Projects'
    },
    editRelationship: {
        title: 'Relationship and its History'
    },
    vitalStatus: {
        title: 'Vital Status of {name}'
    },
    newRelationship: {
        title: 'New Relationship'
    },
    settings: {
        title: 'Settings',
        theme: {
            title: 'Appearance',
            label: 'Theme',
            dark: 'Dark',
            dracula: 'Dracula',
            light: 'Light Pastel'
        },
        dataManagement: {
            title: 'Data Management',
            description: 'Manage data stored locally in this browser',
            exportProjectDescription: 'Download the current project as a .pluma file with images and optional encryption',
            warningTitle: 'Important Warning!',
            warningDescription: 'This action will permanently delete all projects, characters, chapters, and settings stored locally in this browser. This action cannot be undone.',
            exportBeforeDeleteLabel: 'We recommend exporting your data before deleting it:',
            exportAllButton: 'Export All Data',
            noDataTitle: 'No data',
            noDataMessage: 'No projects to export',
            exportSuccessTitle: 'Data exported',
            exportSuccessMessage: 'All data has been exported successfully',
            exportErrorTitle: 'Export error',
            exportErrorMessage: 'An error occurred while trying to export the data',
            confirmationLabel: 'To confirm deletion, type "DELETE DATA" in the field below:',
            confirmationPlaceholder: 'DELETE DATA',
            understandCheckbox: 'I understand that this action cannot be undone and that I will lose all locally stored data',
            deleteButton: 'Delete All Data Locally',
            deletionConfirmed: 'Data deleted successfully. The application will reload in a few seconds.',
            confirmDeletion: 'Are you completely sure? This action will delete all your local data and cannot be undone.',
            deletionSuccessTitle: 'Data deleted',
            deletionSuccessMessage: 'All local data has been deleted successfully.',
            deletionErrorTitle: 'Error deleting data',
            deletionErrorMessage: 'An error occurred while trying to delete the data.'
        },
        textAPIs: 'Text APIs',
        imageAPIs: 'Image APIs',
        imageProvider: 'Image Provider',
        requiresLocalInstall: 'Requires local installation: See instructions',
        manualPromptCopy: 'Copy the generated prompt and paste it into any web AI (ChatGPT, Claude, etc.)',
        savedKeys: 'Saved Keys',
        lastUsed: 'Last used:',
        autoFallbackHint: 'Automatic fallback: If a key fails, the system will automatically try the next available one.',
        keysPrivacy: 'Keys are stored on your device and not sent to any server',
        tokenOptimization: 'Token Optimization',
        tokenOptimizationDesc: 'Control how much context is sent to the AI to save tokens and reduce costs',
        tokenLevels: {
            minimal: '⚡ Minimal (~1,000 tokens) - Only essentials',
            normal: '⚖️ Normal (~3,000 tokens) - Balanced (recommended)',
            complete: '📚 Complete (~8,000 tokens) - Full context',
            unlimited: '🚀 Unlimited - Send everything'
        },
        contextLevel: 'Context Level',
        minimalLevel: 'Minimal Level',
        minimalLevelDesc: 'Only includes: Protagonist, antagonist, current chapter. Ideal for saving tokens.',
        normalLevel: 'Normal Level (Recommended)',
        smartLevelDesc: 'Includes: Mentioned characters, relevant lore, cited locations. Perfect balance between quality and cost.',
        completeLevel: 'Complete Level',
        fullLevelDesc: 'Includes: All characters, all lore, all locations. Maximum quality, higher cost.',
        unlimitedLevel: 'Unlimited',
        unlimitedLevelWarning: '⚠️ Sends EVERYTHING without restrictions. May consume many tokens on large projects.',
        smartSavingTip: '💡 Smart saving: The system automatically detects characters and lore mentioned in your text to include only what is relevant.',
        agenticSystem: '🤖 Agentic AI System',
        agenticSystemDesc: 'AI analyzes your task and decides what context it needs, sending only what is relevant',
        agenticMode: 'Agentic Mode',
        agenticModeDesc: 'AI decides what context it needs (recommended)',
        twoStepFlow: {
            title: 'How does the 2-step flow work?',
            step1: '<strong>Step 1:</strong> AI receives your task and an inventory of available context (names only, no content)',
            step2: '<strong>Step 2:</strong> AI decides which characters, lore, locations it needs and the system sends ONLY that'
        },
        agenticBenefits: {
            title: 'Benefits of agentic mode',
            tokenSaving: '<strong>Massive token savings:</strong> Only sends what it really needs',
            relevantContext: '<strong>More relevant context:</strong> AI selects what is specific to your task',
            fullTraceability: '<strong>Full traceability:</strong> Logs show exactly what it decided to include',
            smartOptimization: '<strong>Smart optimization:</strong> AI decides, not predefined rules',
            tip: '<strong>💡 Tip:</strong> Enable debug logs to see the 2-step flow in action.'
        },
        debugLogs: {
            title: 'Debug Logs',
            description: 'Enable detailed console logs to see the AI request flow'
        },
        apiKeys: {
            editName: 'Edit name',
            markDefault: 'Mark as default',
            delete: 'Delete',
            confirmDelete: 'Delete this API key?'
        },
        showLogs: 'Show Logs',
        showLogsDesc: 'View detailed AI system information',
        logsInfo: {
            title: 'What is logged?',
            items: {
                modeAndProvider: 'Selected AI mode and provider',
                contextBuilding: 'Context building (characters, lore, chapters)',
                tokenOptimization: 'Token optimization (before/after)',
                finalPrompt: 'Final prompt generated',
                apiRequests: 'API requests and responses',
                responseTimes: 'Response times and errors'
            },
            tip: '💡 Tip: Open the browser console (F12) to see logs in real time.'
        },
        localDataDesc: 'Manage data stored locally in this browser (PLUMA Projects)',
        exportCurrentProject: 'Export Current Project',
        exportProject: 'Export Project',
        exportAllData: 'Export All Data',
        deleteAllData: 'Delete All Data Locally',
        providerInfo: {
            freeTier: 'Free tier:',
            pricing: 'Pricing:',
            notAvailable: 'Not available',
            checkWebsite: 'Check website'
        },
        messages: {
            apiKeyExists: 'This API key is already saved',
            apiKeySaved: 'API key saved as "{name}"',
            errorSavingKey: 'Error saving API key',
            testingConnection: 'Testing connection...',
            connectionSuccess: '✓ Connection successful',
            apiKeyDeleted: 'API key deleted',
            defaultKeyUpdated: 'Default key updated',
            unnamed: 'Unnamed',
            logsEnabled: '🔍 Debug logs enabled',
            logsDisabled: '🔇 Debug logs disabled',
            agenticModeEnabled: '🤖 Agentic mode enabled: AI will decide which context it needs',
            traditionalModeEnabled: '📦 Traditional mode enabled: All context will be sent with optimization',
            deleteDataText: 'DELETE DATA'
        }
    }
};
