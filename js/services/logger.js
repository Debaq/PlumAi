/**
 * Sistema de Logging Centralizado para PlumAI
 * Permite debug visual del flujo de IA con logs en consola
 */

class Logger {
    constructor() {
        this.enabled = this.loadPreference();
        this.colors = {
            info: '#2196F3',      // Azul
            success: '#4CAF50',   // Verde
            warning: '#FF9800',   // Naranja
            error: '#F44336',     // Rojo
            debug: '#9C27B0',     // Púrpura
            ai: '#00BCD4',        // Cyan
            context: '#FF5722',   // Deep Orange
            token: '#FFC107',     // Amber
            api: '#673AB7'        // Deep Purple
        };
    }

    /**
     * Carga preferencia de logs desde localStorage
     */
    loadPreference() {
        try {
            const settings = JSON.parse(localStorage.getItem('plum_settings') || '{}');
            return settings.enableLogs !== false; // Por defecto activado
        } catch (e) {
            return true;
        }
    }

    /**
     * Actualiza preferencia de logs
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        const settings = JSON.parse(localStorage.getItem('plum_settings') || '{}');
        settings.enableLogs = enabled;
        localStorage.setItem('plum_settings', JSON.stringify(settings));

        if (enabled) {
            this.info('Logs', 'Sistema de logs activado ✓');
        }
    }

    /**
     * Log genérico con estilo personalizado
     */
    _log(level, category, message, data, color) {
        if (!this.enabled) return;

        const timestamp = new Date().toLocaleTimeString('es-ES');
        const prefix = `[${timestamp}] [${category}]`;

        const styles = [
            `color: ${color}; font-weight: bold;`,
            'color: inherit; font-weight: normal;'
        ];

        if (data !== undefined) {
            console.log(`%c${prefix}%c ${message}`, ...styles, data);
        } else {
            console.log(`%c${prefix}%c ${message}`, ...styles);
        }
    }

    /**
     * Grupo de logs (collapsible)
     */
    group(category, title, color = this.colors.info) {
        if (!this.enabled) return;
        console.group(`%c[${category}] ${title}`, `color: ${color}; font-weight: bold;`);
    }

    groupCollapsed(category, title, color = this.colors.info) {
        if (!this.enabled) return;
        console.groupCollapsed(`%c[${category}] ${title}`, `color: ${color}; font-weight: bold;`);
    }

    groupEnd() {
        if (!this.enabled) return;
        console.groupEnd();
    }

    /**
     * Métodos por tipo de log
     */
    info(category, message, data) {
        this._log('info', category, message, data, this.colors.info);
    }

    success(category, message, data) {
        this._log('success', category, `✓ ${message}`, data, this.colors.success);
    }

    warning(category, message, data) {
        this._log('warning', category, `⚠ ${message}`, data, this.colors.warning);
    }

    error(category, message, data) {
        this._log('error', category, `✗ ${message}`, data, this.colors.error);
    }

    debug(category, message, data) {
        this._log('debug', category, `🔍 ${message}`, data, this.colors.debug);
    }

    /**
     * Logs especializados para el sistema de IA
     */

    // Inicio de request de IA
    aiRequest(mode, provider, userInput) {
        this.group('AI REQUEST', `🤖 Modo: ${mode} | Proveedor: ${provider}`, this.colors.ai);
        this.info('Input', 'Solicitud del usuario:', userInput);
    }

    // Construcción de contexto
    contextBuild(chapterId, contextSize) {
        this.groupCollapsed('CONTEXTO', '📚 Construcción de contexto', this.colors.context);
        this.info('Capítulo', `ID: ${chapterId || 'N/A'}`);
        this.info('Tamaño', `Elementos en contexto: ${contextSize}`);
    }

    contextData(label, items) {
        if (!this.enabled) return;
        if (Array.isArray(items)) {
            this.info('Contexto', `${label}: ${items.length} elementos`, items.map(i => i.name || i.title || i));
        } else {
            this.info('Contexto', label, items);
        }
    }

    // Optimización de tokens
    tokenOptimization(before, after, level) {
        this.group('TOKENS', `⚡ Optimización (${level})`, this.colors.token);
        this.info('Antes', `~${before} tokens`);
        this.info('Después', `~${after} tokens`);
        const saved = before - after;
        const percentage = ((saved / before) * 100).toFixed(1);
        if (saved > 0) {
            this.success('Ahorro', `${saved} tokens (${percentage}%)`);
        } else {
            this.info('Ahorro', 'Sin reducción necesaria');
        }
    }

    tokenDetail(category, count, items) {
        if (!this.enabled) return;
        this.info('Token Detail', `${category}: ${count}`, items);
    }

    // Prompt final
    promptBuilt(promptLength, tokensEstimated) {
        this.groupCollapsed('PROMPT', '📝 Prompt construido', this.colors.debug);
        this.info('Longitud', `${promptLength} caracteres`);
        this.info('Tokens estimados', `~${tokensEstimated} tokens`);
    }

    promptPreview(prompt) {
        if (!this.enabled) return;
        const preview = prompt.substring(0, 500) + (prompt.length > 500 ? '...' : '');
        console.log('%cPreview:', 'color: #9C27B0; font-weight: bold;');
        console.log(preview);
        this.groupEnd();
    }

    // Request API
    apiRequest(provider, endpoint, model) {
        this.group('API', `🌐 Request a ${provider}`, this.colors.api);
        this.info('Endpoint', endpoint);
        this.info('Modelo', model);
        this.info('Estado', 'Enviando...');
    }

    apiResponse(success, responseData) {
        if (success) {
            this.success('Respuesta', 'Recibida exitosamente');
            if (responseData) {
                this.debug('Data', 'Contenido de respuesta:', responseData);
            }
        } else {
            this.error('Respuesta', 'Error en la solicitud', responseData);
        }
        this.groupEnd(); // Cierra API group
    }

    // Finalización de request
    aiComplete(totalTime, model, tokensUsed) {
        this.success('COMPLETO', `⏱ Tiempo total: ${totalTime}ms`);
        this.info('Modelo usado', model);
        if (tokensUsed) {
            this.info('Tokens', `Usados: ${tokensUsed}`);
        }
        this.groupEnd(); // Cierra CONTEXTO group (si estaba abierto)
        this.groupEnd(); // Cierra AI REQUEST group
    }

    aiError(error) {
        this.error('ERROR', error.message || error);
        this.groupEnd(); // Cierra todos los grupos
        this.groupEnd();
    }

    /**
     * Tabla para datos estructurados
     */
    table(category, data) {
        if (!this.enabled) return;
        console.log(`%c[${category}] Tabla de datos:`, `color: ${this.colors.info}; font-weight: bold;`);
        console.table(data);
    }

    /**
     * Log de rendimiento
     */
    time(label) {
        if (!this.enabled) return;
        console.time(label);
    }

    timeEnd(label) {
        if (!this.enabled) return;
        console.timeEnd(label);
    }

    /**
     * Separador visual
     */
    separator() {
        if (!this.enabled) return;
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                    'color: #666; font-weight: bold;');
    }
}

// Instancia global
window.plumLogger = window.plumLogger || new Logger();

export default window.plumLogger;
