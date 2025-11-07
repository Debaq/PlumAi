import { Extension, Command } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

// Comandos disponibles para el menú
const defaultCommands = [
  { name: 'buscar', description: 'Buscar en el proyecto', icon: '🔍' },
  { name: 'nuevo-documento', description: 'Crear nuevo documento', icon: '📄' },
  { name: 'resumir', description: 'Resumir selección', icon: '✂️' },
  { name: 'ayuda', description: 'Mostrar ayuda', icon: '?' },
];

// Extensión para menú de comandos con /
export const CommandMenu = Extension.create({
  name: 'commandMenu',

  addOptions() {
    return {
      commands: defaultCommands,
      onCommand: null,
      onSearch: null,  // Función para búsqueda global
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('commandMenu'),
        props: {
          handleKeyDown(view, event) {
            // Detectar cuando se presiona '/'
            if (event.key === '/' && !event.ctrlKey && !event.metaKey) {
              // Aquí podríamos activar un menú de comandos
              // Por ahora solo mostramos una alerta como ejemplo
              event.preventDefault();
              
              // En el futuro, esto abriría un menú flotante
              console.log('Abriendo menú de comandos');
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      // Comando para abrir el menú de comandos
      openCommandMenu: () => ({ editor, tr }) => {
        // Lógica para abrir el menú de comandos
        console.log('Comando para abrir menú de comandos');
        return true;
      },
      
      // Comando para ejecutar una acción específica
      executeCommand: (commandName) => ({ editor, tr }) => {
        console.log(`Ejecutando comando: ${commandName}`);
        if (this.options.onCommand) {
          this.options.onCommand(commandName);
        }
        // Si es el comando de búsqueda, usar la función de búsqueda
        if (commandName === 'buscar' && this.options.onSearch) {
          this.options.onSearch();
        }
        return true;
      },
    };
  },
});