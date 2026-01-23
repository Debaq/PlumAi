import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface MediaManagerProps {
  imageUrl?: string;
  onUpdate?: (url: string) => void;
}

export const MediaManager = ({ imageUrl }: MediaManagerProps) => {
  const [url, setUrl] = useState(imageUrl || '');

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-700">
        {url ? (
          <img src={url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-8 h-8 text-gray-400" />
        )}
      </div>
      <input
        type="text"
        placeholder="Image URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="text-xs border rounded px-2 py-1 w-32 dark:bg-gray-800 dark:border-gray-700"
      />
    </div>
  );
};
