// Sidebar Component for PlumaAI - Function that returns the component object
window.sidebarComponent = function() {
    return {
        async init() {
            try {
                const templatePath = window.PathResolver.resolve('templates/components/sidebar.html');
                const response = await fetch(templatePath);
                const html = await response.text();
                // Replace the entire element with the sidebar HTML content
                this.$el.outerHTML = html;
                // Initialize Lucide icons after content is inserted
                setTimeout(() => lucide.createIcons(), 100);
            } catch (error) {
                console.error('Error loading sidebar template:', error);
            }
        }
    };
};