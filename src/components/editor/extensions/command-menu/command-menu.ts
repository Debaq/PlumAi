import Mention from '@tiptap/extension-mention';
import suggestion from './suggestion';

export const CommandMenuExtension = Mention.extend({
  name: 'command-menu',
}).configure({
  HTMLAttributes: {
    class: 'command-menu',
  },
  suggestion: {
    ...suggestion,
    char: '/',
  },
});
