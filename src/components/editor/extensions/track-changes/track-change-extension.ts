import { Mark, mergeAttributes } from '@tiptap/core';

export interface TrackChangeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    trackChange: {
      /**
       * Set a track change mark
       */
      setTrackChange: (attributes: { type: string, author: string }) => ReturnType,
      /**
       * Toggle a track change mark
       */
      toggleTrackChange: (attributes: { type: string, author: string }) => ReturnType,
      /**
       * Accept all changes
       */
      acceptAllTrackChanges: () => ReturnType,
      /**
       * Reject all changes
       */
      rejectAllTrackChanges: () => ReturnType,
    }
  }
}

export const TrackChangeExtension = Mark.create<TrackChangeOptions>({
  name: 'trackChange',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      type: {
        default: 'insert',
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => {
          return {
            'data-type': attributes.type,
          };
        },
      },
      author: {
        default: 'ai',
        parseHTML: element => element.getAttribute('data-author'),
        renderHTML: attributes => {
          return {
            'data-author': attributes.author,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-track-change]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-type'];
    const author = HTMLAttributes['data-author'];
    const classes = ['track-change-span'];

    if (type === 'delete') {
      classes.push('bg-red-500/10 text-red-500 line-through decoration-red-500/50');
    } else {
      if (author === 'ai') {
        classes.push('bg-purple-500/10 border-b-2 border-purple-500/50 text-purple-700 dark:text-purple-300');
      } else {
        classes.push('bg-green-500/10 border-b-2 border-green-500/50 text-green-700 dark:text-green-300');
      }
    }

    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-track-change': '',
      class: classes.join(' ')
    }), 0];
  },

  addCommands() {
    return {
      setTrackChange: attributes => ({ commands }) => {
        return commands.setMark(this.name, attributes);
      },
      toggleTrackChange: attributes => ({ commands }) => {
        return commands.toggleMark(this.name, attributes);
      },
      acceptAllTrackChanges: () => ({ tr, dispatch }) => {
        if (dispatch) {
          tr.doc.descendants((node, pos) => {
            const trackChange = node.marks.find(mark => mark.type.name === this.name);
            if (trackChange) {
              if (trackChange.attrs.type === 'delete') {
                tr.delete(pos, pos + node.nodeSize);
              } else {
                tr.removeMark(pos, pos + node.nodeSize, this.type);
              }
            }
          });
        }
        return true;
      },
      rejectAllTrackChanges: () => ({ tr, dispatch }) => {
        if (dispatch) {
          tr.doc.descendants((node, pos) => {
            const trackChange = node.marks.find(mark => mark.type.name === this.name);
            if (trackChange) {
              if (trackChange.attrs.type === 'insert' || trackChange.attrs.type === 'ai-generated') {
                tr.delete(pos, pos + node.nodeSize);
              } else {
                tr.removeMark(pos, pos + node.nodeSize, this.type);
              }
            }
          });
        }
        return true;
      },
    };
  },
});
