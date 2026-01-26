

import { Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  const { i18n } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      unlisten = await listen('dictation-event', (event: any) => {
        const payload = event.payload;
        if (editor && payload?.text && payload?.is_final) {
          editor.chain().focus().insertContent(payload.text + " ").run();
        }
      });
    };

    setupListener();

    return () => {
      if (unlisten) unlisten();
    };
  }, [editor]);

  // Ensure recording stops on unmount
  useEffect(() => {
    return () => {
      invoke('stop_dictation').catch(() => {});
    };
  }, []);

  const toggleDictation = async () => {
    if (isRecording) {
      await invoke('stop_dictation');
      setIsRecording(false);
    } else {
      try {
        await invoke('start_dictation', { language: i18n.language });
        setIsRecording(true);
      } catch (error) {
        console.error("Dictation failed:", error);
        setIsRecording(false);
      }
    }
  };

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

      <div className="w-[1px] h-6 bg-gray-300 mx-1" />

      <button
        onClick={toggleDictation}
        className={cn(
          "p-2 rounded hover:bg-gray-200 transition-colors",
          isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500'
        )}
        title={isRecording ? "Stop Dictation" : "Start Dictation"}
      >
        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
    </div>
  );
}
