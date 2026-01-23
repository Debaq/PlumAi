// Settings Modal Component for PlumaAI - Function that returns the component object
window.settingsModalComponent = function() {
    return {
        // AI Configuration - Basic
        selectedProvider: 'manual',
        selectedModel: '',
        apiKeyInput: '',
        showApiKey: false,
        connectionStatus: null,
        connectionMessage: '',

        // AI Configuration - Tabs and Multiple Keys
        activeApiTab: 'text', // 'text' | 'image'
        savedKeys: [], // Lista de keys guardadas para el proveedor seleccionado
        editingKeyId: null, // ID de la key que se está editando
        editingKeyName: '',

        // Token Optimization
        tokenLevel: 'normal',

        // Agentic Context
        useAgenticContext: true,

        // Debug Logs
        enableLogs: true,

        // Data Management
        deletionAllowed: false,
        deletionConfirmed: false,
        confirmationText: '',
        understandChecked: false,

        init() {
            // Migrar API keys si es necesario
            const projectStore = Alpine.store('project');
            if (projectStore) {
                projectStore.migrateApiKeys();
            }

            // Initialize AI configuration
            if (window.aiService) {
                this.selectedProvider = window.aiService.currentProvider || 'manual';
                this.selectedModel = window.aiService.currentModel || '';

                // Load API keys and saved keys list
                this.loadApiKey();
                this.loadSavedKeys();
            }

            // Initialize token optimization
            if (window.tokenOptimizer) {
                this.tokenLevel = window.tokenOptimizer.config.currentLevel;
            }

            // Initialize agentic context mode
            try {
                const settings = JSON.parse(localStorage.getItem('plum_settings') || '{}');
                this.useAgenticContext = settings.useAgenticContext !== false; // Por defecto activado
            } catch (e) {
                this.useAgenticContext = true;
            }

            // Initialize debug logs
            if (window.plumLogger) {
                this.enableLogs = window.plumLogger.enabled;
            } else {
                // Si no existe el logger, cargar desde localStorage
                try {
                    const settings = JSON.parse(localStorage.getItem('plum_settings') || '{}');
                    this.enableLogs = settings.enableLogs !== false;
                } catch (e) {
                    this.enableLogs = true;
                }
            }

            // Initialize data management values
            this.deletionAllowed = false;
            this.deletionConfirmed = false;
            this.confirmationText = '';
            this.understandChecked = false;
        },

        // ============================================
        // AI CONFIGURATION METHODS
        // ============================================

        getAvailableProviders() {
            return window.aiService ? window.aiService.getAvailableProviders() : [];
        },

        getProviderInfo() {
            if (!window.aiService || !this.selectedProvider) return null;

            // Buscar primero en providers de texto
            if (window.aiService.providers[this.selectedProvider]) {
                return window.aiService.providers[this.selectedProvider];
            }

            // Si no está, buscar en imageProviders
            if (window.aiService.imageProviders && window.aiService.imageProviders[this.selectedProvider]) {
                return window.aiService.imageProviders[this.selectedProvider];
            }

            return null;
        },

        getProviderName() {
            const info = this.getProviderInfo();
            return info ? info.name : '';
        },

        getProviderModels() {
            const info = this.getProviderInfo();
            return info ? info.models : [];
        },

        loadApiKey() {
            if (!window.aiService || !this.selectedProvider) return;

            const apiKey = window.aiService.getApiKey(this.selectedProvider);
            this.apiKeyInput = apiKey || '';
        },

        toggleApiKeyVisibility() {
            this.showApiKey = !this.showApiKey;
            const input = document.querySelector('[x-model="apiKeyInput"]');
            if (input) {
                input.type = this.showApiKey ? 'text' : 'password';
            }
        },

        canSaveApiKey() {
            const info = this.getProviderInfo();
            if (!info) return false;

            // Si no requiere API key, siempre se puede guardar
            if (!info.requiresApiKey) return true;

            // Si requiere API key, verificar que esté presente
            return this.apiKeyInput && this.apiKeyInput.trim().length > 0;
        },

        hasApiKey() {
            const info = this.getProviderInfo();
            if (!info) return false;

            // Si no requiere API key, considerarlo como "tiene key"
            if (!info.requiresApiKey) return true;

            // Verificar si tiene API key guardada
            if (!window.aiService) return false;
            const apiKey = window.aiService.getApiKey(this.selectedProvider);
            return apiKey && apiKey.length > 0;
        },

        async saveApiKey() {
            if (!this.canSaveApiKey()) return;

            try {
                const projectStore = Alpine.store('project');
                if (!projectStore) {
                    throw new Error('Project store not available');
                }

                // Migrar API keys si es necesario
                projectStore.migrateApiKeys();

                // Mapeo de IDs a nombres en el store
                const keyMap = {
                    'anthropic': 'claude',
                    'openai': 'openai',
                    'google': 'google',
                    'groq': 'groq',
                    'together': 'together',
                    'huggingface': 'huggingface'
                };

                const keyName = keyMap[this.selectedProvider] || this.selectedProvider;

                // Verificar si ya existe una key con el mismo valor
                const existingKeys = projectStore.getApiKeys('text', keyName);
                const isDuplicate = existingKeys.some(k => k.key === this.apiKeyInput.trim());

                if (isDuplicate) {
                    this.connectionStatus = 'error';
                    this.connectionMessage = Alpine.store('i18n').t('modals.settings.messages.apiKeyExists');
                    return;
                }

                // Agregar nueva API key usando el nuevo método
                const newKey = projectStore.addApiKey('text', keyName, {
                    name: existingKeys.length === 0 ? 'Primary' : `Key ${existingKeys.length + 1}`,
                    key: this.apiKeyInput.trim()
                });

                // Actualizar el proveedor en aiService
                if (window.aiService) {
                    window.aiService.setProvider(this.selectedProvider, this.selectedModel);
                }

                // Guardar proyecto
                if (window.storageManager) {
                    await window.storageManager.save(projectStore.exportProject());
                }

                this.connectionStatus = 'success';
                this.connectionMessage = Alpine.store('i18n').t('modals.settings.messages.apiKeySaved').replace('{name}', newKey.name);

                // Limpiar input
                this.apiKeyInput = '';

                setTimeout(() => {
                    this.connectionStatus = null;
                }, 3000);

                // Actualizar lucide icons
                this.$nextTick(() => {
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                });

            } catch (error) {
                console.error('Error saving API key:', error);
                this.connectionStatus = 'error';
                this.connectionMessage = error.message || Alpine.store('i18n').t('modals.settings.messages.errorSavingKey');
            }
        },

        async testConnection() {
            if (!this.hasApiKey()) return;

            this.connectionStatus = null;
            this.connectionMessage = Alpine.store('i18n').t('modals.settings.messages.testingConnection');

            try {
                if (!window.aiService) {
                    throw new Error('AI Service not available');
                }

                // Probar conexión (esto podría tomar tiempo dependiendo de la API)
                const result = await window.aiService.testConnection(this.selectedProvider);

                if (result.success) {
                    this.connectionStatus = 'success';
                    this.connectionMessage = Alpine.store('i18n').t('modals.settings.messages.connectionSuccess');
                } else {
                    this.connectionStatus = 'error';
                    this.connectionMessage = `✗ ${result.message}`;
                }

                setTimeout(() => {
                    this.connectionStatus = null;
                }, 5000);

            } catch (error) {
                console.error('Error testing connection:', error);
                this.connectionStatus = 'error';
                this.connectionMessage = `✗ Error: ${error.message}`;
            }
        },

        // ============================================
        // TABS AND MULTIPLE KEYS MANAGEMENT
        // ============================================

        switchTab(tab) {
            this.activeApiTab = tab;
            this.connectionStatus = null;
            // Reset provider selection when switching tabs
            if (tab === 'text') {
                this.selectedProvider = 'manual';
            } else {
                this.selectedProvider = 'googleImagen';
            }
            this.loadSavedKeys();
        },

        getAvailableImageProviders() {
            return window.aiService && window.aiService.imageProviders
                ? Object.values(window.aiService.imageProviders)
                : [];
        },

        onProviderChange() {
            const info = this.getProviderInfo();
            if (info) {
                this.selectedModel = info.defaultModel;
                this.loadApiKey();
                this.loadSavedKeys();
            }
            this.connectionStatus = null;
        },

        loadSavedKeys() {
            const projectStore = Alpine.store('project');
            if (!projectStore) {
                this.savedKeys = [];
                return;
            }

            const keyMap = {
                'anthropic': 'claude',
                'openai': 'openai',
                'google': 'google',
                'groq': 'groq',
                'together': 'together',
                'huggingface': 'huggingface',
                'googleImagen': 'googleImagen',
                'dalle': 'dalle',
                'stabilityai': 'stabilityai',
                'replicateImage': 'replicate',
                'leonardo': 'leonardo',
                'midjourney': 'midjourney'
            };

            const keyName = keyMap[this.selectedProvider] || this.selectedProvider;
            this.savedKeys = projectStore.getApiKeys(this.activeApiTab, keyName) || [];
        },

        deleteKey(keyId) {
            const projectStore = Alpine.store('project');
            if (!projectStore) return;

            const keyMap = {
                'anthropic': 'claude',
                'openai': 'openai',
                'google': 'google',
                'groq': 'groq',
                'together': 'together',
                'huggingface': 'huggingface',
                'googleImagen': 'googleImagen',
                'dalle': 'dalle',
                'stabilityai': 'stabilityai',
                'replicateImage': 'replicate',
                'leonardo': 'leonardo',
                'midjourney': 'midjourney'
            };

            const keyName = keyMap[this.selectedProvider] || this.selectedProvider;

            try {
                projectStore.deleteApiKey(this.activeApiTab, keyName, keyId);

                // Guardar proyecto
                if (window.storageManager) {
                    window.storageManager.save(projectStore.exportProject());
                }

                this.loadSavedKeys();
                this.connectionStatus = 'success';
                this.connectionMessage = Alpine.store('i18n').t('modals.settings.messages.apiKeyDeleted');

                setTimeout(() => {
                    this.connectionStatus = null;
                }, 2000);

            } catch (error) {
                console.error('Error deleting key:', error);
                this.connectionStatus = 'error';
                this.connectionMessage = error.message;
            }
        },

        setDefaultKey(keyId) {
            const projectStore = Alpine.store('project');
            if (!projectStore) return;

            const keyMap = {
                'anthropic': 'claude',
                'openai': 'openai',
                'google': 'google',
                'groq': 'groq',
                'together': 'together',
                'huggingface': 'huggingface',
                'googleImagen': 'googleImagen',
                'dalle': 'dalle',
                'stabilityai': 'stabilityai',
                'replicateImage': 'replicate',
                'leonardo': 'leonardo',
                'midjourney': 'midjourney'
            };

            const keyName = keyMap[this.selectedProvider] || this.selectedProvider;

            try {
                projectStore.updateApiKey(this.activeApiTab, keyName, keyId, { isDefault: true });

                // Guardar proyecto
                if (window.storageManager) {
                    window.storageManager.save(projectStore.exportProject());
                }

                this.loadSavedKeys();
                this.connectionStatus = 'success';
                this.connectionMessage = Alpine.store('i18n').t('modals.settings.messages.defaultKeyUpdated');

                setTimeout(() => {
                    this.connectionStatus = null;
                }, 2000);

            } catch (error) {
                console.error('Error setting default key:', error);
                this.connectionStatus = 'error';
                this.connectionMessage = error.message;
            }
        },

        startEditingKey(key) {
            this.editingKeyId = key.id;
            this.editingKeyName = key.name;
        },

        cancelEditingKey() {
            this.editingKeyId = null;
            this.editingKeyName = '';
        },

        async saveKeyName(keyId) {
            const projectStore = Alpine.store('project');
            if (!projectStore) return;

            const keyMap = {
                'anthropic': 'claude',
                'openai': 'openai',
                'google': 'google',
                'groq': 'groq',
                'together': 'together',
                'huggingface': 'huggingface',
                'googleImagen': 'googleImagen',
                'dalle': 'dalle',
                'stabilityai': 'stabilityai',
                'replicateImage': 'replicate',
                'leonardo': 'leonardo',
                'midjourney': 'midjourney'
            };

            const keyName = keyMap[this.selectedProvider] || this.selectedProvider;

            try {
                projectStore.updateApiKey(this.activeApiTab, keyName, keyId, {
                    name: this.editingKeyName.trim() || Alpine.store('i18n').t('modals.settings.messages.unnamed')
                });

                // Guardar proyecto
                if (window.storageManager) {
                    await window.storageManager.save(projectStore.exportProject());
                }

                this.cancelEditingKey();
                this.loadSavedKeys();

            } catch (error) {
                console.error('Error updating key name:', error);
                this.connectionStatus = 'error';
                this.connectionMessage = error.message;
            }
        },

        getKeyMasked(key) {
            if (!key || key.length < 8) return '••••••••';
            return key.substring(0, 8) + '••••••••';
        },

        // ============================================
        // TOKEN OPTIMIZATION METHODS
        // ============================================

        saveTokenLevel() {
            if (window.tokenOptimizer) {
                window.tokenOptimizer.setLevel(this.tokenLevel);
                console.log(`✅ Token level saved: ${this.tokenLevel}`);
            }
        },

        // ============================================
        // DEBUG LOGS METHODS
        // ============================================

        toggleLogs() {
            this.enableLogs = !this.enableLogs;
            if (window.plumLogger) {
                window.plumLogger.setEnabled(this.enableLogs);
            } else {
                // Si no existe el logger, guardar en localStorage
                const settings = JSON.parse(localStorage.getItem('plum_settings') || '{}');
                settings.enableLogs = this.enableLogs;
                localStorage.setItem('plum_settings', JSON.stringify(settings));
            }

            if (this.enableLogs) {
                console.log(Alpine.store('i18n').t('modals.settings.messages.logsEnabled'));
            } else {
                console.log(Alpine.store('i18n').t('modals.settings.messages.logsDisabled'));
            }
        },

        // ============================================
        // AGENTIC CONTEXT METHODS
        // ============================================

        toggleAgenticMode() {
            const settings = JSON.parse(localStorage.getItem('plum_settings') || '{}');
            settings.useAgenticContext = this.useAgenticContext;
            localStorage.setItem('plum_settings', JSON.stringify(settings));

            if (this.useAgenticContext) {
                console.log(Alpine.store('i18n').t('modals.settings.messages.agenticModeEnabled'));
            } else {
                console.log(Alpine.store('i18n').t('modals.settings.messages.traditionalModeEnabled'));
            }
        },

        // ============================================
        // DATA MANAGEMENT METHODS
        // ============================================
        
        checkDeletionConfirmation() {
            const input = document.getElementById('confirm-delete-input');
            if (input) {
                this.confirmationText = input.value;
                this.deletionAllowed = this.confirmationText.toUpperCase() === Alpine.store('i18n').t('modals.settings.messages.deleteDataText');
            }
        },
        
        toggleDeletionUnderstanding() {
            const checkbox = document.getElementById('understand-checkbox');
            if (checkbox) {
                this.understandChecked = checkbox.checked;
            }
        },
        
        get canDelete() {
            return this.deletionAllowed && this.understandChecked && !this.deletionConfirmed;
        },
        
        async exportAllData() {
            try {
                // Get all projects from storage
                const projects = await window.storageManager.getProjectsList();
                
                if (projects.length === 0) {
                    Alpine.store('ui').info(
                        Alpine.store('i18n').t('modals.settings.dataManagement.noDataTitle'),
                        Alpine.store('i18n').t('modals.settings.dataManagement.noDataMessage')
                    );
                    return;
                }
                
                // Export each project and bundle them
                const allData = {
                    metadata: {
                        exportedAt: new Date().toISOString(),
                        totalProjects: projects.length,
                        exportVersion: '1.0'
                    },
                    projects: []
                };
                
                // Load each project to get full data
                for (const project of projects) {
                    const projectData = await window.storageManager.load(project.id);
                    if (projectData) {
                        allData.projects.push(projectData);
                    }
                }
                
                // Create a combined export file
                const blob = new Blob([JSON.stringify(allData, null, 2)], {
                    type: 'application/json'
                });
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pluma_backup_${new Date().toISOString().split('T')[0]}.pluma`;
                document.body.appendChild(a);
                a.click();
                
                // Clean up
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                
                Alpine.store('ui').success(
                    Alpine.store('i18n').t('modals.settings.dataManagement.exportSuccessTitle'),
                    Alpine.store('i18n').t('modals.settings.dataManagement.exportSuccessMessage')
                );
            } catch (error) {
                console.error('Error exporting all data:', error);
                Alpine.store('ui').error(
                    Alpine.store('i18n').t('modals.settings.dataManagement.exportErrorTitle'),
                    error.message || Alpine.store('i18n').t('modals.settings.dataManagement.exportErrorMessage')
                );
            }
        },
        
        async confirmDeleteAllData() {
            if (!this.canDelete) return;
            
            const confirmed = confirm(Alpine.store('i18n').t('modals.settings.dataManagement.confirmDeletion'));
            if (!confirmed) return;
            
            try {
                // Call the storage manager to clear all data
                if (window.storageManager && typeof window.storageManager.clearAll === 'function') {
                    await window.storageManager.clearAll();
                    
                    // Update UI to show success
                    this.deletionConfirmed = true;
                    
                    // Show success message
                    Alpine.store('ui').success(
                        Alpine.store('i18n').t('modals.settings.dataManagement.deletionSuccessTitle'),
                        Alpine.store('i18n').t('modals.settings.dataManagement.deletionSuccessMessage')
                    );
                    
                    // Reload the page after a delay to ensure user sees the success message
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    throw new Error('Storage manager not available or clearAll method not found');
                }
            } catch (error) {
                console.error('Error deleting data:', error);
                Alpine.store('ui').error(
                    Alpine.store('i18n').t('modals.settings.dataManagement.deletionErrorTitle'),
                    error.message || Alpine.store('i18n').t('modals.settings.dataManagement.deletionErrorMessage')
                );
            }
        }
    };
};