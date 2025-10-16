import React from 'react';
import { formatTime } from '../utils/timeUtils';

export const ActiveTimer = ({ activeTask, elapsedTime }) => {
  if (!activeTask) return null;

  return (
    <div className="bg-indigo-50 rounded-lg p-4 mb-4 border-2 border-indigo-200">
      <div className="text-sm text-indigo-600 font-semibold mb-1">TRACKING</div>
      <div className="text-xl font-bold text-gray-800 mb-2">{activeTask.name}</div>
      <div className="text-3xl font-mono font-bold text-indigo-600">
        {formatTime(elapsedTime)}
      </div>
    </div>
  );
};
