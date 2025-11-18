// Store para estado de la UI
window.uiStore = {
    // Vista activa
    currentView: 'lore',

    // Tema
    currentTheme: 'dark', // 'dark' | 'dracula' | 'light'

    // Sidebar
    sidebarCollapsed: false,

    // Modales
    modals: {
        welcome: true,
        newProject: false,
        loadProject: false,
        projectsList: false,
        projectSettings: false,
        settings: false,
        apiKeys: false,
        newCharacter: false,
        editCharacter: false,
        newScene: false,
        editScene: false,
        newLocation: false,
        editLocation: false,
        newChapter: false,
        editChapter: false,
        newNote: false,
        editNote: false,
        newLore: false,
        editLore: false,
        lorePreview: false,
        avatarSelector: false,
        newTimelineEvent: false,
        editTimelineEvent: false,
        newRelationship: false,
        editRelationship: false,
        vitalStatus: false,
        export: false,
        import: false,
        versionHistory: false,
        forksView: false,
        createCommit: false,
        createFork: false,
        createTree: false,
        password: false
    },

    // Datos temporales para modales
    modalData: null,

    // Vista de editor
    editorSidebarOpen: true,
    editorZenMode: false, // Modo sin distracciones
    editorMode: 'write', // 'write' | 'diff'
    currentEditingChapterId: null,
    editorSaveStatus: 'saved', // 'saved' | 'saving' | 'unsaved'
    editorAutoSaveTimeout: null,

    // Estado para pestañas de lore
    activeLoreTab: null,
    
    // Estado para vista de relaciones
    activeRelationsView: null,
    
    // Carácter seleccionado en la vista de relaciones
    selectedCharacter: null,
    
    // Último proyecto para el modal de bienvenida
    lastProject: null,

    // Notificaciones toast
    toasts: [],

    // Loading states
    loading: {
        global: false,
        ai: false,
        save: false
    },

    // Métodos para vistas
    setView(viewName) {
        // Verificar si está saliendo del editor con cambios sin guardar
        if (this.currentView === 'editor' && viewName !== 'editor') {
            if (this.editorSaveStatus === 'unsaved' || this.editorSaveStatus === 'saving') {
                if (!confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
                    return; // Cancelar cambio de vista
                }
                // Resetear estado
                this.editorSaveStatus = 'saved';
            }
        }

        this.currentView = viewName;

        // Auto-colapsar sidebar al entrar al sistema de publicación
        if (viewName === 'publishing') {
            this.sidebarCollapsed = true;
        }
    },

    isCurrentView(viewName) {
        return this.currentView === viewName;
    },

    // Métodos para temas
    setTheme(themeName) {
        const validThemes = ['dark', 'dracula', 'light'];
        if (validThemes.includes(themeName)) {
            this.currentTheme = themeName;
            document.documentElement.setAttribute('data-theme', themeName);
            localStorage.setItem('pluma_theme', themeName);
        }
    },

    getTheme() {
        return this.currentTheme;
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('pluma_theme') || 'dark';
        this.setTheme(savedTheme);
    },

    // Métodos para sidebar
    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    // Métodos para modales
    openModal(modalName, data = null) {
        // Cerrar todos los modales primero
        Object.keys(this.modals).forEach(key => {
            this.modals[key] = false;
        });

        // Abrir el modal solicitado
        if (this.modals.hasOwnProperty(modalName)) {
            this.modals[modalName] = true;
            
            // Initialize modal data with default values based on modal type
            if (modalName === 'createCommit') {
                this.modalData = {
                    message: data?.message || '',
                    author: data?.author || 'User',
                    projectStats: data?.projectStats || { totalWords: 0, totalChapters: 0, totalCharacters: 0, totalScenes: 0 }
                };
            } else if (modalName === 'createFork') {
                this.modalData = {
                    name: data?.name || '',
                    description: data?.description || '',
                    projectStats: data?.projectStats || { totalWords: 0, totalChapters: 0, totalCharacters: 0, totalScenes: 0 }
                };
            } else {
                this.modalData = data;
            }
        }
    },

    closeModal(modalName = null) {
        console.log(`🚪 closeModal() llamado${modalName ? ` para: ${modalName}` : ' (cerrar todos)'}`, new Error().stack);

        if (modalName) {
            this.modals[modalName] = false;
            console.log(`🔒 Modal cerrado: ${modalName}`);
        } else {
            // Cerrar todos los modales
            console.log('🔒 Cerrando TODOS los modales');
            Object.keys(this.modals).forEach(key => {
                this.modals[key] = false;
            });
        }
        console.log('🗑️ Limpiando modalData (esto puede causar pérdida de contenido)');
        this.modalData = null;

        // Restaurar foco al editor si existe
        setTimeout(() => {
            const editor = document.querySelector('.rich-editor-content');
            if (editor) {
                editor.focus();
            }
        }, 100);
    },

    closeAllModals() {
        Object.keys(this.modals).forEach(key => {
            this.modals[key] = false;
        });
        this.modalData = null;

        // Restaurar foco al editor si existe
        setTimeout(() => {
            const editor = document.querySelector('.rich-editor-content');
            if (editor) {
                editor.focus();
            }
        }, 100);
    },

    isModalOpen(modalName) {
        return this.modals[modalName] || false;
    },

    // Métodos para toast notifications
    showToast(type, title, message, duration = 5000) {
        const id = window.uuid.generateUUID();
        const toast = {
            id,
            type, // 'success', 'error', 'warning', 'info'
            title,
            message,
            duration
        };

        this.toasts.push(toast);

        // Auto-remover después de duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(id);
            }, duration);
        }

        return id;
    },

    removeToast(id) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    },

    clearToasts() {
        this.toasts = [];
    },

    // Helpers para toast
    success(title, message, duration = 5000) {
        return this.showToast('success', title, message, duration);
    },

    error(title, message, duration = 5000) {
        return this.showToast('error', title, message, duration);
    },

    warning(title, message, duration = 5000) {
        return this.showToast('warning', title, message, duration);
    },

    info(title, message, duration = 5000) {
        return this.showToast('info', title, message, duration);
    },

    // Métodos para loading states
    setLoading(key, value) {
        if (this.loading.hasOwnProperty(key)) {
            this.loading[key] = value;
        }
    },

    startLoading(key = 'global') {
        this.setLoading(key, true);
    },

    stopLoading(key = 'global') {
        this.setLoading(key, false);
    },

    isLoading(key = 'global') {
        return this.loading[key] || false;
    },

    // Métodos para editor
    toggleEditorSidebar() {
        this.editorSidebarOpen = !this.editorSidebarOpen;
    },

    toggleEditorZenMode() {
        this.editorZenMode = !this.editorZenMode;
        // En modo zen, esconder ambas barras laterales
        if (this.editorZenMode) {
            this.sidebarCollapsed = true;
            this.editorSidebarOpen = false;
        } else {
            // Al salir del modo zen, restaurar estado normal
            this.sidebarCollapsed = false;
            this.editorSidebarOpen = true;
        }
    },

    setEditorMode(mode) {
        this.editorMode = mode;
    },

    openEditor(chapterId) {
        this.currentEditingChapterId = chapterId;
        this.setView('editor');
        this.editorSaveStatus = 'saved';
    },

    closeEditor() {
        // Verificar si hay cambios sin guardar
        if (this.editorSaveStatus === 'unsaved' || this.editorSaveStatus === 'saving') {
            // Preguntar al usuario si quiere salir sin guardar
            if (!confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
                return; // Cancelar cierre
            }
        }

        this.currentEditingChapterId = null;
        this.setView('chapters');
        this.editorSaveStatus = 'saved';
    },

    setCurrentEditingChapter(chapterId) {
        this.currentEditingChapterId = chapterId;
    },

    markEditorUnsaved() {
        this.editorSaveStatus = 'unsaved';
    },

    markEditorSaving() {
        this.editorSaveStatus = 'saving';
    },

    markEditorSaved() {
        this.editorSaveStatus = 'saved';
    },

    triggerAutoSave(callback, delay = 2000) {
        // Cancelar el timeout anterior si existe
        if (this.editorAutoSaveTimeout) {
            clearTimeout(this.editorAutoSaveTimeout);
        }

        // Marcar como no guardado
        this.markEditorUnsaved();

        // Programar el guardado automático
        this.editorAutoSaveTimeout = setTimeout(() => {
            callback();
        }, delay);
    },

    // Estado inicial
    init() {
        // Verificar si es primera vez
        const hasVisited = localStorage.getItem('pluma_has_visited');
        if (hasVisited) {
            this.modals.welcome = false;
        }

        // Cargar tema guardado
        this.loadTheme();
    },

    markAsVisited() {
        localStorage.setItem('pluma_has_visited', 'true');
        this.closeModal('welcome');
    }
};
