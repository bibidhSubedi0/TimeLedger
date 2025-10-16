import React, { useState } from 'react';
import { Play, Square, Tag, FileText } from 'lucide-react';

const CATEGORIES = [
  { id: 'study', name: 'Study', color: '#6366f1', icon: '📚' },
  { id: 'work', name: 'Work', color: '#8b5cf6', icon: '💼' },
  { id: 'gaming', name: 'Gaming', color: '#ec4899', icon: '🎮' },
  { id: 'exercise', name: 'Exercise', color: '#10b981', icon: '💪' },
  { id: 'reading', name: 'Reading', color: '#f59e0b', icon: '📖' },
  { id: 'coding', name: 'Coding', color: '#3b82f6', icon: '💻' },
  { id: 'creative', name: 'Creative', color: '#f97316', icon: '🎨' },
  { id: 'other', name: 'Other', color: '#6b7280', icon: '📌' },
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

      {!activeTask && (
        <>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            {showAdvanced ? '▼' : '▶'} {showAdvanced ? 'Hide' : 'Show'} category & notes
          </button>

          {showAdvanced && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Tag className="w-4 h-4" />
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-lg text-sm font-medium transition-all ${
                        category === cat.id
                          ? 'ring-2 ring-offset-2'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                      style={{
                        backgroundColor: category === cat.id ? cat.color + '20' : undefined,
                        color: category === cat.id ? cat.color : undefined,
                        ringColor: category === cat.id ? cat.color : undefined,
                      }}
                    >
                      <span className="mr-1">{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4" />
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional details..."
                  rows="2"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};