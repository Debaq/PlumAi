'use client';

import { useState } from 'react';
import { Editor } from '@/components/editor/editor';

export default function EditorTestPage() {
  const [content, setContent] = useState(`
    <p>Initial content.</p>
    <p>This is <span data-track-change="" data-type="insert" data-author="ai">inserted by AI</span>.</p>
    <p>This is <span data-track-change="" data-type="delete" data-author="ai">deleted by AI</span>.</p>
    <p>This is <span data-track-change="" data-type="ai-generated" data-author="ai">AI generated text</span>.</p>
  `);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Tiptap Editor Test</h1>
      <Editor
        initialContent={content}
        onChange={setContent}
        className="bg-white"
      />
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Output HTML:</h2>
        <pre className="whitespace-pre-wrap break-all text-xs">{content}</pre>
      </div>
    </div>
  );
}
