// PlumaAI - Main Application
// Inicialización de Alpine.js y Stores

// Asumimos que los stores y storageManager están disponibles globalmente (cargados en index.html)

document.addEventListener('alpine:init', () => {
    console.log('🚀 Inicializando PlumaAI...');

    // Hacer los objetos profundamente reactivos primero
    const reactiveI18n = Alpine.reactive(window.i18nStore);
    const reactiveProject = Alpine.reactive(window.projectStore);
    const reactiveUi = Alpine.reactive(window.uiStore);
    const reactiveAi = Alpine.reactive(window.aiStore);

    // Registrar stores reactivos
    Alpine.store('i18n', reactiveI18n);
    Alpine.store('project', reactiveProject);
    Alpine.store('ui', reactiveUi);
    Alpine.store('ai', reactiveAi);

    console.log('📋 Stores registrados como Proxy');

    // Inicializar stores que lo requieran
    Alpine.store('i18n').init();
    Alpine.store('ui').init();
    Alpine.store('ai').init();

    // Inicializar Storage Manager
    window.storageManager.init();
    console.log('✅ Storage Manager inicializado');

    // Cargar último proyecto al inicio
    window.storageManager.getProjectsList().then(projects => {
        if (projects.length > 0) {
            // Cargar el proyecto más reciente
            const lastProject = projects[0];
            window.storageManager.load(lastProject.id).then(projectData => {
                if (projectData) {
                    Alpine.store('project').loadProject(projectData);
                    Alpine.store('ui').success(
                        Alpine.store('i18n').t('notifications.success.projectLoaded'),
                        Alpine.store('i18n').t('notifications.success.projectLoadedDesc', { projectName: projectData.projectInfo.title })
                    );
                } else {
                    // Si no hay proyecto cargado, mostrar modal de bienvenida o nuevo proyecto
                    const hasVisited = localStorage.getItem('pluma_has_visited');
                    if (!hasVisited) {
                        Alpine.store('ui').openModal('welcome');
                    } else {
                        Alpine.store('ui').openModal('newProject');
                    }
                }
            }).catch(error => {
                console.error('Error al cargar el proyecto inicial:', error);
                Alpine.store('ui').error(
                    Alpine.store('i18n').t('notifications.error.projectLoad'),
                    error.message
                );
                // Mostrar modal de nuevo proyecto si falla la carga
                Alpine.store('ui').openModal('newProject');
            });
        } else {
            // Si no hay proyectos guardados, mostrar modal de bienvenida o nuevo proyecto
            const hasVisited = localStorage.getItem('pluma_has_visited');
            if (!hasVisited) {
                Alpine.store('ui').openModal('welcome');
            } else {
                Alpine.store('ui').openModal('newProject');
            }
        }
    }).catch(error => {
        console.error('Error al obtener la lista de proyectos:', error);
        Alpine.store('ui').error(
            Alpine.store('i18n').t('notifications.error.projectList'),
            error.message
        );
        // Mostrar modal de nuevo proyecto si falla la carga
        Alpine.store('ui').openModal('newProject');
    });

    console.log('✅ Stores inicializados');
    console.log('🎯 Estado inicial:', Alpine.store('ui').currentView);

    // App component principal
    Alpine.data('app', () => ({
        init() {
            console.log('📱 App component initialized');
            console.log('Idioma actual:', this.$store.i18n.currentLocale);

            // Forzar reactividad observando cambios en el store
            this.$watch('$store.ui.currentView', (value) => {
                console.log('👁️ Watch detectó cambio de vista:', value);
            });
        }
    }));

    console.log('✅ PlumaAI listo');
});

// Agregar estilos para x-cloak
const style = document.createElement('style');
style.textContent = `
    [x-cloak] {
        display: none !important;
    }
`;
document.head.appendChild(style);
