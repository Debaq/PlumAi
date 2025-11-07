// Main Content Component for PlumaAI - Function that returns the component object
window.mainContentComponent = function() {
    return {
        async init() {
            try {
                // Load the main content container structure
                const response = await fetch('templates/components/main-content.html');
                const html = await response.text();
                
                // Replace the entire element with the main content container
                this.$el.outerHTML = `<main class="main-content">${html}</main>`;
                
                // Initialize Lucide icons after content is loaded
                setTimeout(() => lucide.createIcons(), 100);
            } catch (error) {
                console.error('Error loading main content template:', error);
            }
        }
    };
};