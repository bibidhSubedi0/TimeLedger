import React, { useState } from 'react';
import { Play, Square } from 'lucide-react';

export const TaskInput = ({ activeTask, onStart, onStop }) => {
  const [taskName, setTaskName] = useState('');

  const handleStart = () => {
    if (!taskName.trim()) return;
    onStart(taskName);
    setTaskName('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !activeTask) {
      handleStart();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="What are you working on?"
        disabled={!!activeTask}
        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
      />
      {!activeTask ? (
        <button
          onClick={handleStart}
          disabled={!taskName.trim()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Play className="w-5 h-5" />
          Start
        </button>
      ) : (
        <button
          onClick={onStop}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2"
        >
          <Square className="w-5 h-5" />
          Stop
        </button>
      )}
    </div>
  );
};
