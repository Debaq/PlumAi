// Status Bar Component
export const statusBarComponent = () => ({
    init() {
        this.$nextTick(() => {
            this.render();
        });
        
        // Update last saved time every minute
        setInterval(() => {
            this.$store.project.updateLastSaved();
        }, 60000);
    },

    render() {
        this.$el.innerHTML = `
            <footer class="status-bar">
                <div class="status-left">
                    <span class="status-item">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M8 4V8L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        <span x-text="$store.project.lastSaved"></span>
                    </span>
                </div>
                <div class="status-right">
                    <span class="status-item" x-text="$store.project.wordCount + ' palabras'"></span>
                    <span class="status-item">
                        <span class="ai-indicator" :class="{ 'active': $store.ai.connected }"></span>
                        <span x-text="$store.ai.connected ? 'IA conectada' : 'IA desconectada'"></span>
                    </span>
                </div>
            </footer>
        `;
    }
});