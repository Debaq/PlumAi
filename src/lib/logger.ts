/**
 * Logger Service - Specialized for AI flow monitoring
 */

import { useSettingsStore } from '@/stores/useSettingsStore';

class Logger {
  private get enabled() {
    return useSettingsStore.getState().enableLogs;
  }

  private colors = {
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    ai: '#00BCD4',
    context: '#FF5722',
    token: '#FFC107',
  };

  private log(message: string, category: string, color: string, data?: any) {
    if (!this.enabled) return;
    const timestamp = new Date().toLocaleTimeString();
    const style = `color: ${color}; font-weight: bold;`;
    
    if (data) {
      console.log(`%c[${timestamp}] [${category}]%c ${message}`, style, '', data);
    } else {
      console.log(`%c[${timestamp}] [${category}]%c ${message}`, style, '');
    }
  }

  info(message: string, data?: any) {
    this.log(message, 'INFO', this.colors.info, data);
  }

  success(message: string, data?: any) {
    this.log(message, 'SUCCESS', this.colors.success, data);
  }

  error(message: string, error?: any) {
    this.log(message, 'ERROR', this.colors.error, error);
  }

  ai(message: string, data?: any) {
    this.log(message, 'AI', this.colors.ai, data);
  }

  context(message: string, data?: any) {
    this.log(message, 'CONTEXT', this.colors.context, data);
  }

  group(label: string) {
    if (!this.enabled) return;
    console.group(`%c${label}`, `color: ${this.colors.info}; font-weight: bold;`);
  }

  groupEnd() {
    if (!this.enabled) return;
    console.groupEnd();
  }
}

export const logger = new Logger();
