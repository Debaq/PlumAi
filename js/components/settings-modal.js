// Settings Modal Component for PlumaAI - Function that returns the component object
window.settingsModalComponent = function() {
    return {
        // AI Configuration
        selectedProvider: 'manual',
        selectedModel: '',
        apiKeyInput: '',
        showApiKey: false,
        connectionStatus: null,
        connectionMessage: '',

        // Data Management
        deletionAllowed: false,
        deletionConfirmed: false,
        confirmationText: '',
        understandChecked: false,

        init() {
            // Initialize AI configuration
            if (window.aiService) {
                this.selectedProvider = window.aiService.currentProvider || 'manual';
                this.selectedModel = window.aiService.currentModel || '';

                // Load API key if exists
                this.loadApiKey();
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
            return window.aiService.providers[this.selectedProvider];
        },

        getProviderName() {
            const info = this.getProviderInfo();
            return info ? info.name : '';
        },

        getProviderModels() {
            const info = this.getProviderInfo();
            return info ? info.models : [];
        },

        onProviderChange() {
            const info = this.getProviderInfo();
            if (info) {
                this.selectedModel = info.defaultModel;
                this.loadApiKey();
            }
            this.connectionStatus = null;
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

                // Guardar API key en el store del proyecto
                if (!projectStore.apiKeys) {
                    projectStore.apiKeys = {};
                }
                projectStore.apiKeys[keyName] = this.apiKeyInput.trim();

                // Actualizar el proveedor en aiService
                if (window.aiService) {
                    window.aiService.setProvider(this.selectedProvider, this.selectedModel);
                }

                // Guardar proyecto
                if (window.storageManager) {
                    await window.storageManager.save(projectStore.exportProject());
                }

                this.connectionStatus = 'success';
                this.connectionMessage = 'API key guardada correctamente';

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
                this.connectionMessage = error.message || 'Error al guardar la API key';
            }
        },

        async testConnection() {
            if (!this.hasApiKey()) return;

            this.connectionStatus = null;
            this.connectionMessage = 'Probando conexión...';

            try {
                if (!window.aiService) {
                    throw new Error('AI Service not available');
                }

                // Probar conexión (esto podría tomar tiempo dependiendo de la API)
                const result = await window.aiService.testConnection(this.selectedProvider);

                if (result.success) {
                    this.connectionStatus = 'success';
                    this.connectionMessage = '✓ Conexión exitosa';
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
        // DATA MANAGEMENT METHODS
        // ============================================
        
        checkDeletionConfirmation() {
            const input = document.getElementById('confirm-delete-input');
            if (input) {
                this.confirmationText = input.value;
                this.deletionAllowed = this.confirmationText.toUpperCase() === 'ELIMINAR DATOS';
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