'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Toolbar } from './toolbar';
import { MentionExtension } from './extensions/mention/mention';
import { CommandMenuExtension } from './extensions/command-menu/command-menu';
import { TrackChangeExtension } from './extensions/track-changes/track-change-extension';

interface EditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function Editor({ initialContent = '', onChange, placeholder = 'Start writing...', className }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      MentionExtension,
      CommandMenuExtension,
      TrackChangeExtension,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 min-h-[300px]',
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className={`border rounded-lg shadow-sm ${className || ''}`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
