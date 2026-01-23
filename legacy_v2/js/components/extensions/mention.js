import { Suggestion, mergeAttributes } from '@tiptap/suggestion';
import { Node, ReactNodeViewRenderer } from '@tiptap/core';

// Extensión para menciones con @
export const Mention = Node.create({
  name: 'mention',

  addOptions() {
    return {
      HTMLAttributes: {},
      renderLabel({ options, node }) {
        return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`;
      },
      suggestion: {
        char: '@',
        pluginKey: 'mention',
        command: ({ editor, range, props }) => {
          // Insertar la mención en el rango especificado
          editor.chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: this.name,
              attrs: props,
            })
            .run();
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const parent = $from.parent;
          return !parent.type.spec.isolating;
        },
      },
    };
  },

  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          return {
            'data-id': attributes.id,
            'data-type': this.name,
          };
        },
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: attributes => {
          return {
            'data-label': attributes.label,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      this.options.renderLabel({
        options: this.options,
        node,
      }),
    ];
  },

  renderText({ node }) {
    return this.options.renderLabel({
      options: this.options,
      node,
    });
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});