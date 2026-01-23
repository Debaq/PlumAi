import { Mark, mergeAttributes } from '@tiptap/core';

export interface TrackChangeOptions {
  HTMLAttributes: Record<string, any>;
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
    const classes = [];

    if (type === 'insert') {
      classes.push('bg-green-100 text-green-800 border-b-2 border-green-500 decoration-clone');
    } else if (type === 'delete') {
      classes.push('bg-red-100 text-red-800 line-through decoration-red-500 decoration-clone');
    } else if (type === 'ai-generated') {
       classes.push('bg-purple-100 text-purple-800 decoration-clone');
    }

    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-track-change': '',
      class: classes.join(' ')
    }), 0];
  },
});
