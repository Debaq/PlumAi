// Store para estado de la UI
export default {
    // Vista activa
    currentView: 'dashboard',

    // Sidebar
    sidebarCollapsed: false,

    // Modales
    modals: {
        welcome: true,
        newProject: false,
        loadProject: false,
        projectSettings: false,
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
        newTimelineEvent: false,
        editTimelineEvent: false,
        export: false,
        import: false
    },

    // Datos temporales para modales
    modalData: null,

    // Vista de editor
    editorSidebarOpen: true,
    editorMode: 'write', // 'write' | 'diff'
    currentEditingChapterId: null,

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
        this.currentView = viewName;
    },

    isCurrentView(viewName) {
        return this.currentView === viewName;
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
            this.modalData = data;
        }
    },

    closeModal(modalName = null) {
        if (modalName) {
            this.modals[modalName] = false;
        } else {
            // Cerrar todos los modales
            Object.keys(this.modals).forEach(key => {
                this.modals[key] = false;
            });
        }
        this.modalData = null;
    },

    closeAllModals() {
        Object.keys(this.modals).forEach(key => {
            this.modals[key] = false;
        });
        this.modalData = null;
    },

    isModalOpen(modalName) {
        return this.modals[modalName] || false;
    },

    // Métodos para toast notifications
    showToast(type, title, message, duration = 5000) {
        const id = crypto.randomUUID();
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

    setEditorMode(mode) {
        this.editorMode = mode;
    },

    setCurrentEditingChapter(chapterId) {
        this.currentEditingChapterId = chapterId;
    },

    // Estado inicial
    init() {
        // Verificar si es primera vez
        const hasVisited = localStorage.getItem('pluma_has_visited');
        if (hasVisited) {
            this.modals.welcome = false;
        }
    },

    markAsVisited() {
        localStorage.setItem('pluma_has_visited', 'true');
        this.closeModal('welcome');
    }
};
