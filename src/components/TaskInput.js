import React, { useState } from 'react';
import { Play, Square, Tag, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = [
  { id: 'study', name: 'Study', color: '#667eea', icon: '📚' },
  { id: 'work', name: 'Work', color: '#764ba2', icon: '💼' },
  { id: 'gaming', name: 'Gaming', color: '#ec4899', icon: '🎮'},
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

  const selectedCategory = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];

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
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all"
          style={{ fontSize: '1rem' }}
        />
        {!activeTask ? (
          <button
            onClick={handleStart}
            disabled={!taskName.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            <Play className="w-5 h-5" fill="currentColor" />
            <span className="hidden sm:inline">Start</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center gap-2 transition-all"
          >
            <Square className="w-5 h-5" fill="currentColor" />
            <span className="hidden sm:inline">Stop</span>
          </button>
        )}
      </div>

      {!activeTask && (
        <>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-2 transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAdvanced ? 'Hide' : 'Show'} category & notes
          </button>

          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg border-2 border-indigo-100">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Tag className="w-4 h-4" />
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        category === cat.id
                          ? 'bg-white shadow-md scale-105'
                          : 'bg-white/60 hover:bg-white hover:shadow'
                      }`}
                      style={{
                        borderWidth: '2px',
                        borderColor: category === cat.id ? cat.color : 'transparent',
                      }}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div style={{ color: category === cat.id ? cat.color : '#4b5563' }}>
                        {cat.name}
                      </div>
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
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none transition-all"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};