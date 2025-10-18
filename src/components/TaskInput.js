import React, { useState } from 'react';
import { Play, Square, Tag, FileText } from 'lucide-react';

const CATEGORIES = [
  { id: 'study', name: 'Study', color: '#1565c0', icon: '📚' },
  { id: 'work', name: 'Work', color: '#4a148c', icon: '💼' },
  { id: 'gaming', name: 'Gaming', color: '#c2185b', icon: '🎮'},
  { id: 'exercise', name: 'Exercise', color: '#2e7d32', icon: '💪' },
  { id: 'reading', name: 'Reading', color: '#f57c00', icon: '📖' },
  { id: 'coding', name: 'Coding', color: '#0277bd', icon: '💻' },
  { id: 'creative', name: 'Creative', color: '#d84315', icon: '🎨' },
  { id: 'other', name: 'Other', color: '#616161', icon: '📌' },
];

export const TaskInput = ({ activeTask, onStart, onStop }) => {
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState('study');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleStart = () => {
    if (!taskName.trim()) return;
    onStart(taskName, category, notes);
    setTaskName('');
    setNotes('');
    setShowAdvanced(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !activeTask && !e.shiftKey) {
      handleStart();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What are you working on?"
          disabled={!!activeTask}
          className="flex-1 px-4 py-3 border border-gray-300 rounded focus:border-gray-800 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
        />
        {!activeTask ? (
          <button
            onClick={handleStart}
            disabled={!taskName.trim()}
            className="px-6 py-3 bg-gray-800 text-white rounded font-medium hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start
          </button>
        ) : (
          <button
            onClick={onStop}
            className="px-6 py-3 bg-red-600 text-white rounded font-medium hover:bg-red-700 flex items-center gap-2"
          >
            <Square className="w-5 h-5" />
            Stop
          </button>
        )}
      </div>

      {!activeTask && (
        <>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            {showAdvanced ? '▼' : '▶'} {showAdvanced ? 'Hide' : 'Show'} category & notes
          </button>

          {showAdvanced && (
            <div className="space-y-3 p-4 bg-gray-50 rounded border border-gray-200">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4" />
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded text-sm font-medium transition-all ${
                        category === cat.id
                          ? 'bg-white border-2 border-gray-800'
                          : 'bg-white border border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <span className="mr-1">{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional details..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-gray-800 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};