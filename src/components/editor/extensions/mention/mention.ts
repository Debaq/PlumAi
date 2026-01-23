import Mention from '@tiptap/extension-mention';
import suggestion from './suggestion';

export const MentionExtension = Mention.configure({
  HTMLAttributes: {
    class: 'mention',
  },
  suggestion,
});
