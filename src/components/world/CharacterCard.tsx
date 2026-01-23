import React from 'react';
import { Character } from '@/types/domain';
import { ArrowLeft } from 'lucide-react';
import { RelationshipManager } from './RelationshipManager';
import { MediaManager } from './MediaManager';

interface CharacterCardProps {
  character: Character;
  onBack: () => void;
}

export const CharacterCard = ({ character, onBack }: CharacterCardProps) => {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center text-sm text-gray-500 hover:text-black dark:hover:text-white">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{character.name}</h2>
            <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-800 capitalize mt-1">
              {character.role}
            </span>
          </div>
          <MediaManager imageUrl={character.avatarUrl} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Physical Description</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 p-2"
                  rows={4}
                  defaultValue={character.physicalDescription}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Personality</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-700 p-2"
                  rows={4}
                  defaultValue={character.personality}
                />
             </div>
          </div>

          <div className="space-y-4">
            <RelationshipManager characterId={character.id} relationships={character.relationships} />
          </div>
        </div>
      </div>
    </div>
  );
};
