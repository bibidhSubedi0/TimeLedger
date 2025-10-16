import React from 'react';
import { formatTime } from '../utils/timeUtils';

export const StatsGrid = ({ tasks }) => {
  if (tasks.length === 0) return null;

  const getTotalTime = () => {
    return tasks.reduce((sum, task) => sum + task.duration, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-gray-600">Total Tracked</div>
          <div className="text-2xl font-bold text-gray-800">{formatTime(getTotalTime())}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Tasks Completed</div>
          <div className="text-2xl font-bold text-gray-800">{tasks.length}</div>
        </div>
      </div>
    </div>
  );
};
