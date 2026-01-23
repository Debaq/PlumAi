import React from 'react';
import { Location } from '@/types/domain';
import { ArrowLeft } from 'lucide-react';
import { MediaManager } from './MediaManager';

interface LocationCardProps {
  location: Location;
  onBack: () => void;
}

export const LocationCard = ({ location, onBack }: LocationCardProps) => {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center text-sm text-gray-500 hover:text-black dark:hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{location.name}</h2>
          <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 capitalize mt-1">
            {location.type}
          </span>
        </div>
        <MediaManager imageUrl={location.imageUrl} />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 p-2"
            rows={5}
            defaultValue={location.description}
          />
        </div>
         <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Significance</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 p-2"
            rows={3}
            defaultValue={location.significance}
          />
        </div>
      </div>
    </div>
  );
};
