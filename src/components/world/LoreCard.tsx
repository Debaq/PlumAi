import React from 'react';
import { LoreItem } from '@/types/domain';
import { ArrowLeft } from 'lucide-react';

interface LoreCardProps {
  loreItem: LoreItem;
  onBack: () => void;
}

export const LoreCard = ({ loreItem, onBack }: LoreCardProps) => {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center text-sm text-gray-500 hover:text-black dark:hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div>
        <h2 className="text-2xl font-bold">{loreItem.name}</h2>
        <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 capitalize mt-1">
          {loreItem.category}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 p-2"
            rows={8}
            defaultValue={loreItem.content}
          />
        </div>
      </div>
    </div>
  );
};
