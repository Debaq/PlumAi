import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Mention } from './extensions/mention';
import { CommandMenu } from './extensions/commandMenu';

// Componente base de editor de texto rico
export class RichTextEditor {
  constructor(options = {}) {
    this.element = options.element || null;
    this.type = options.type || 'document';
    this.onSearch = options.onSearch || null;
    this.searchFunction = options.searchFunction || null;  // Función de búsqueda de Lunr.js
    this.onLLMRequest = options.onLLMRequest || null;
    this.readOnly = options.readOnly || false;
    this.placeholder = options.placeholder || 'Escribe aquí...';
    
    // Datos de ejemplo para la búsqueda
    this.searchData = options.searchData || [
      { id: 'documento1', label: 'Documento de Ventas', content: 'Información sobre ventas del 2024' },
      { id: 'documento2', label: 'Informe de Proyecto', content: 'Resumen del proyecto actual' },
      { id: 'documento3', label: 'Notas de Reunión', content: 'Notas de la reunión del equipo' }
    ];
    
    this.editor = null;
    this.init();
  }
  
  init() {
    // Configurar la extensión de menciones con datos de búsqueda
    const mentionExtension = Mention.configure({
      suggestion: {
        char: '@',
        pluginKey: 'mention',
        command: ({ editor, range, props }) => {
          editor.chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: 'mention',
              attrs: props,
            })
            .run();
        },
        items: ({ query }) => {
          if (this.searchFunction) {
            // Usar la función de búsqueda de Lunr.js si está disponible
            return query ? this.searchFunction(query) : this.searchData;
          } else {
            // Fallback a búsqueda simple si no hay función de búsqueda
            if (!query) return this.searchData;
            return this.searchData
              .filter(item => 
                item.label.toLowerCase().includes(query.toLowerCase()) ||
                item.content.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5); // Limitar a 5 resultados
          }
        },
        render: () => {
          let component;
          let popup;
          
          return {
            onStart: props => {
              component = this.createMentionList(props);
              popup = this.createPopup(component);
            },
            
            onUpdate: props => {
              if (component) {
                component.update(props);
              }
            },
            
            onKeyDown: props => {
              if (props.event.key === 'Escape') {
                this.removePopup(popup);
                return true;
              }
              if (component) {
                return component.handleKeyDown(props);
              }
              return false;
            },
            
            onExit: () => {
              this.removePopup(popup);
            },
          };
        },
      },
    });
    
    // Configurar la extensión de menú de comandos
    const commandMenuExtension = CommandMenu.configure({
      onCommand: (commandName) => {
        console.log(`Ejecutando comando: ${commandName}`);
        if (commandName === 'buscar') {
          // Aquí se podría abrir una interfaz de búsqueda
          alert('Abrir búsqueda global');
        }
      },
      onSearch: this.searchFunction  // Pasar la función de búsqueda de Lunr.js
    });
    
    // Inicializar el editor de Tiptap
    this.editor = new Editor({
      element: this.element,
      extensions: [
        StarterKit,
        mentionExtension,
        commandMenuExtension,
      ],
      content: '',
      editable: !this.readOnly,
      autofocus: true,
      placeholder: this.placeholder,
    });
  }
  
  // Crear lista de sugerencias para menciones
  createMentionList(props) {
    const div = document.createElement('div');
    div.className = 'tiptap-mention-list';
    div.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-height: 200px;
      overflow-y: auto;
      z-index: 10000;
      min-width: 200px;
    `;
    
    const renderItems = () => {
      div.innerHTML = '';
      props.items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = `mention-item ${index === props.command ? 'is-selected' : ''}`;
        itemElement.style.cssText = `
          padding: 8px 12px;
          cursor: pointer;
          ${index === props.command ? 'background-color: #f0f0f0;' : ''}
        `;
        itemElement.textContent = `${item.label} (${item.content.substring(0, 30)}...)`;
        
        itemElement.addEventListener('mousedown', () => {
          props.command(item);
        });
        
        div.appendChild(itemElement);
      });
    };
    
    renderItems();
    
    return {
      element: div,
      update: (newProps) => {
        props = { ...props, ...newProps };
        renderItems();
      },
      handleKeyDown: (keyProps) => {
        if (keyProps.event.key === 'ArrowUp') {
          props.command = Math.max(0, props.command - 1);
          renderItems();
          return true;
        }
        
        if (keyProps.event.key === 'ArrowDown') {
          props.command = Math.min(props.items.length - 1, props.command + 1);
          renderItems();
          return true;
        }
        
        if (keyProps.event.key === 'Enter') {
          props.command(props.items[props.command]);
          return true;
        }
        
        return false;
      }
    };
  }
  
  // Crear popup para la lista de menciones
  createPopup(component) {
    document.body.appendChild(component.element);
    
    const updatePosition = () => {
      const { selection } = this.editor.view.state;
      const { from } = selection;
      const dom = this.editor.view.dom;
      const coords = this.editor.view.coordsAtPos(from);
      
      component.element.style.left = `${coords.left}px`;
      component.element.style.top = `${coords.bottom + window.scrollY}px`;
    };
    
    updatePosition();
    return component.element;
  }
  
  // Eliminar popup
  removePopup(popup) {
    if (popup && popup.parentNode) {
      popup.parentNode.removeChild(popup);
    }
  }
  
  // Destruir el editor
  destroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }
  
  // Obtener contenido del editor
  get content() {
    if (this.editor) {
      return this.editor.getHTML();
    }
    return '';
  }
  
  // Establecer contenido del editor
  set content(value) {
    if (this.editor) {
      this.editor.commands.setContent(value);
    }
  }
  
  // Focusear el editor
  focus() {
    if (this.editor) {
      this.editor.commands.focus();
    }
  }
}