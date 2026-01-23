import React from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const StatsDashboard = () => {
  const { activeProject } = useProjectStore();

  if (!activeProject) return <div>No project loaded.</div>;

  const totalWords = activeProject.chapters.reduce((acc, chap) => acc + (chap.wordCount || 0), 0);
  const characterCount = activeProject.characters.length;
  const locationCount = activeProject.locations.length;

  const data = activeProject.chapters.map(chap => ({
    name: chap.title,
    words: chap.wordCount || 0,
  }));

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
           <h3 className="text-sm font-medium text-gray-500 uppercase">Total Words</h3>
           <p className="text-3xl font-bold mt-2">{totalWords.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
           <h3 className="text-sm font-medium text-gray-500 uppercase">Characters</h3>
           <p className="text-3xl font-bold mt-2">{characterCount}</p>
        </div>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
           <h3 className="text-sm font-medium text-gray-500 uppercase">Locations</h3>
           <p className="text-3xl font-bold mt-2">{locationCount}</p>
        </div>
      </div>

      <div className="h-80 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-bold mb-4">Word Count per Chapter</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="words" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
