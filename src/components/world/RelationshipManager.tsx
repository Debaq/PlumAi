import React from 'react';
import { Relationship } from '@/types/domain';
import { Plus, X } from 'lucide-react';

interface RelationshipManagerProps {
  characterId: string;
  relationships: Relationship[];
}

export const RelationshipManager = ({ relationships }: RelationshipManagerProps) => {
  return (
    <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm">Relationships</h3>
        <button className="text-xs flex items-center bg-black text-white px-2 py-1 rounded hover:bg-gray-800 dark:bg-white dark:text-black">
          <Plus className="w-3 h-3 mr-1" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {relationships.length === 0 ? (
          <p className="text-xs text-gray-500 italic">No relationships defined.</p>
        ) : (
          relationships.map(rel => (
            <div key={rel.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm">
               <div>
                  <span className="font-medium">Character ID: {rel.characterId2}</span>
                  <span className="text-xs text-gray-500 ml-2">({rel.type})</span>
               </div>
               <button className="text-gray-400 hover:text-red-500">
                 <X className="w-3 h-3" />
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
