import React from 'react';
import { useProjectStore } from '@/stores/useProjectStore';

export const TimelineView = () => {
  const { activeProject } = useProjectStore();

  if (!activeProject) return <div>No project loaded.</div>;

  const events = activeProject.timelineEvents || [];

  // Simple sort by absoluteDate for now (assuming string date)
  const sortedEvents = [...events].sort((a, b) => {
      if(a.absoluteDate && b.absoluteDate) {
          return a.absoluteDate.localeCompare(b.absoluteDate);
      }
      return 0;
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Timeline</h2>
      <div className="relative border-l border-gray-200 dark:border-gray-700 ml-4">
        {sortedEvents.map((event) => (
          <div key={event.id} className="mb-10 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            </span>
            <div className="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:bg-gray-800 dark:border-gray-700">
              <div className="text-sm font-normal text-gray-500 dark:text-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{event.title}</h3>
                {event.absoluteDate && <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">{event.absoluteDate}</time>}
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                {event.participants.length > 0 && (
                     <div className="mt-2 text-xs text-gray-500">
                         Participants: {event.participants.join(', ')}
                     </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {sortedEvents.length === 0 && <p className="ml-6 text-gray-500">No events found.</p>}
      </div>
    </div>
  );
};
