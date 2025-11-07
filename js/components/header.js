// Header Component for PlumaAI - Function that returns the component object
window.headerComponent = function() {
    return {
        async init() {
            try {
                const response = await fetch('templates/components/header.html');
                const html = await response.text();
                // Replace the entire element with the header HTML content
                this.$el.outerHTML = html;
                // Initialize Lucide icons after content is inserted
                setTimeout(() => lucide.createIcons(), 100);
            } catch (error) {
                console.error('Error loading header template:', error);
            }
        }
    };
};