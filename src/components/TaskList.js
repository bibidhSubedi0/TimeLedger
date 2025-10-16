import React from 'react';
import { formatTime } from '../utils/timeUtils';

export const TaskList = ({ tasks }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Tasks</h2>
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tasks tracked yet. Start tracking your first task!
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{task.name}</div>
                <div className="text-xs text-gray-500">
                  {new Date(task.startTime).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-mono font-bold text-indigo-600">
                  {formatTime(task.duration)}
                </div>
                {!task.synced && (
                  <span className="text-xs text-gray-400" title="Not synced yet">⏳</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
