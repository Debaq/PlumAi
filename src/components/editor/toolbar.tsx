

import { Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 border-b p-2 bg-gray-50 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn(
          "p-2 rounded hover:bg-gray-200",
          editor.isActive('bold') ? 'bg-gray-200 text-black' : 'text-gray-500'
        )}
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn(
          "p-2 rounded hover:bg-gray-200",
          editor.isActive('italic') ? 'bg-gray-200 text-black' : 'text-gray-500'
        )}
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={cn(
          "p-2 rounded hover:bg-gray-200",
          editor.isActive('strike') ? 'bg-gray-200 text-black' : 'text-gray-500'
        )}
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-6 bg-gray-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          "p-2 rounded hover:bg-gray-200",
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-black' : 'text-gray-500'
        )}
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "p-2 rounded hover:bg-gray-200",
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-black' : 'text-gray-500'
        )}
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-6 bg-gray-300 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "p-2 rounded hover:bg-gray-200",
          editor.isActive('bulletList') ? 'bg-gray-200 text-black' : 'text-gray-500'
        )}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          "p-2 rounded hover:bg-gray-200",
          editor.isActive('orderedList') ? 'bg-gray-200 text-black' : 'text-gray-500'
        )}
      >
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  );
}
