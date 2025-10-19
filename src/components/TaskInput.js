import React, { useState } from 'react';
import { Play, Square, Tag, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = [
  { id: 'study', name: 'Study', color: '#3b82f6', icon: '📚' },
  { id: 'work', name: 'Work', color: '#8b5cf6', icon: '💼' },
  { id: 'gaming', name: 'Gaming', color: '#ec4899', icon: '🎮' },
  { id: 'exercise', name: 'Exercise', color: '#10b981', icon: '💪' },
  { id: 'reading', name: 'Reading', color: '#f59e0b', icon: '📖' },
  { id: 'coding', name: 'Coding', color: '#06b6d4', icon: '💻' },
  { id: 'creative', name: 'Creative', color: '#f97316', icon: '🎨' },
  { id: 'other', name: 'Other', color: '#64748b', icon: '📌' },
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
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What are you working on?"
          disabled={!!activeTask}
          className="flex-1 px-5 py-4 border-2 border-slate-200 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500 transition-all text-base placeholder:text-slate-400"
        />
        {!activeTask ? (
          <button
            onClick={handleStart}
            disabled={!taskName.trim()}
            className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 transition-all duration-300"
          >
            <Play className="w-5 h-5" fill="currentColor" />
            <span className="hidden sm:inline">Start</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-medium hover:shadow-lg hover:scale-105 flex items-center gap-2 transition-all duration-300"
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
            className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAdvanced ? 'Hide' : 'Show'} category & notes
          </button>

          {showAdvanced && (
            <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-700">
                  <Tag className="w-4 h-4" />
                  Category
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
                        category === cat.id
                          ? 'bg-white border-blue-400 shadow-lg scale-105'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className={`text-xs font-medium ${
                        category === cat.id ? 'text-blue-600' : 'text-slate-600'
                      }`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-700">
                  <FileText className="w-4 h-4" />
                  Notes (optional)
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional details..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 resize-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};