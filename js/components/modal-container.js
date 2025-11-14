// Modal Container Component for PlumaAI - Function that returns the component object
window.modalContainerComponent = function() {
    return {
        async init() {
            try {
                // Create the container structure for all modals
                this.$el.innerHTML = `
                    <!-- Welcome Modal -->
                    <div id="welcome-modal-container"></div>
                    
                    <!-- Character Info Modal (for editor mentions) -->
                    <div id="character-info-modal-container"></div>
                    
                    <!-- New Project Modal -->
                    <div id="new-project-modal-container"></div>
                    
                    <!-- New/Edit Character Modal -->
                    <div id="new-edit-character-modal-container"></div>
                    
                    <!-- New/Edit Chapter Modal -->
                    <div id="new-edit-chapter-modal-container"></div>
                    
                    <!-- New/Edit Scene Modal -->
                    <div id="new-edit-scene-modal-container"></div>
                    
                    <!-- New/Edit Location Modal -->
                    <div id="new-edit-location-modal-container"></div>
                    
                    <!-- New/Edit Lore Entry Modal -->
                    <div id="new-edit-lore-modal-container"></div>
                    
                    <!-- New/Edit Timeline Event Modal -->
                    <div id="new-edit-timeline-event-modal-container"></div>
                    
                    <!-- Projects List Modal -->
                    <div id="projects-list-modal-container"></div>
                    
                    <!-- Export Modal -->
                    <div id="export-modal-container"></div>
                    
                    <!-- Import Modal -->
                    <div id="import-modal-container"></div>

                    <!-- Settings Modal -->
                    <div id="settings-modal-container"></div>

                    <!-- Avatar Selector Modal -->
                    <div id="avatar-selector-modal-container"></div>

                    <!-- Lore Preview Modal -->
                    <div id="lore-preview-modal-container"></div>

                    <!-- Edit Relationship Modal -->
                    <div id="edit-relationship-modal-container"></div>

                    <!-- Toast Container -->
                    <div class="toast-container">
                        <template x-for="toast in $store.ui.toasts" :key="toast.id">
                            <div class="toast" :class="toast.type">
                                <div class="toast-icon">
                                    <i x-show="toast.type === 'success'" data-lucide="check-circle" width="20" height="20"></i>
                                    <i x-show="toast.type === 'error'" data-lucide="alert-circle" width="20" height="20"></i>
                                    <i x-show="toast.type === 'warning'" data-lucide="alert-triangle" width="20" height="20"></i>
                                    <i x-show="toast.type === 'info'" data-lucide="info" width="20" height="20"></i>
                                </div>
                                <div class="toast-content">
                                    <div class="toast-title" x-text="toast.title"></div>
                                    <div class="toast-message" x-text="toast.message"></div>
                                </div>
                                <button class="toast-close" @click="$store.ui.removeToast(toast.id)">
                                    <i data-lucide="x" width="16" height="16"></i>
                                </button>
                            </div>
                        </template>
                    </div>
                `;
                
                // Wait a moment for the DOM to update, then load each individual modal template
                await this.$nextTick();
                await this.loadModalTemplates();
                
                // After loading all templates, we need to manually initialize Alpine on the new content
                this.$nextTick(() => {
                    setTimeout(() => {
                        // Re-initialize Lucide icons
                        lucide.createIcons();
                        
                        // If Alpine is available, ensure new elements are initialized
                        if (window.Alpine) {
                            // Initialize Alpine on the entire modal container
                            window.Alpine.initTree(this.$el);
                        }
                    }, 100);
                });
            } catch (error) {
                console.error('Error initializing modal container:', error);
            }
        },
        
        async loadModalTemplates() {
            // Define all modal template paths
            const modalTemplates = [
                { containerId: 'welcome-modal-container', templatePath: 'templates/modals/welcome-modal.html' },
                { containerId: 'character-info-modal-container', templatePath: 'templates/modals/character-info-modal.html' },
                { containerId: 'new-project-modal-container', templatePath: 'templates/modals/new-project-modal.html' },
                { containerId: 'new-edit-character-modal-container', templatePath: 'templates/modals/new-edit-character-modal.html' },
                { containerId: 'new-edit-chapter-modal-container', templatePath: 'templates/modals/new-edit-chapter-modal.html' },
                { containerId: 'new-edit-scene-modal-container', templatePath: 'templates/modals/new-edit-scene-modal.html' },
                { containerId: 'new-edit-location-modal-container', templatePath: 'templates/modals/new-edit-location-modal.html' },
                { containerId: 'new-edit-lore-modal-container', templatePath: 'templates/modals/new-edit-lore-modal.html' },
                { containerId: 'new-edit-timeline-event-modal-container', templatePath: 'templates/modals/new-edit-timeline-event-modal.html' },
                { containerId: 'projects-list-modal-container', templatePath: 'templates/modals/projects-list-modal.html' },
                { containerId: 'export-modal-container', templatePath: 'templates/modals/export-modal.html' },
                { containerId: 'import-modal-container', templatePath: 'templates/modals/import-modal.html' },
                { containerId: 'settings-modal-container', templatePath: 'templates/modals/settings-modal.html' },
                { containerId: 'avatar-selector-modal-container', templatePath: 'templates/modals/avatar-selector-modal.html' },
                { containerId: 'lore-preview-modal-container', templatePath: 'templates/modals/lore-preview-modal.html' },
                { containerId: 'edit-relationship-modal-container', templatePath: 'templates/modals/edit-relationship-modal.html' }
            ];

            // Load each modal template into its respective container
            for (const modal of modalTemplates) {
                try {
                    const response = await fetch(modal.templatePath);
                    const html = await response.text();
                    
                    const container = document.getElementById(modal.containerId);
                    if (container) {
                        container.innerHTML = html;
                        
                        // Initialize Alpine for this specific container if Alpine is available
                        if (window.Alpine) {
                            window.Alpine.initTree(container);
                        }
                    }
                } catch (error) {
                    console.error(`Error loading modal template ${modal.templatePath}:`, error);
                }
            }
        }
    };
};