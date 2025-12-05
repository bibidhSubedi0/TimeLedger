import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Tag, FileText, ChevronDown, ChevronUp, Zap, Clock } from 'lucide-react';
import { getAllCategories } from '../utils/categoryUtils';

const QUICK_TEMPLATES = [
  { name: 'Extra Study', category: 'extra_study', icon: '🎯' },
  { name: 'Course Study Session', category: 'college_work_and_study', icon: '📖' },
  { name: 'Exercise', category: 'exercise', icon: '🏃' },
  { name: 'Project', category: 'projects', icon: '📽️' },
];

export const TaskInput = ({ activeTask, onStart, onStop, customCategories = [] }) => {
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState('study');
  const [notes, setNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentTasks, setRecentTasks] = useState([]);
  const inputRef = useRef(null);

  const CATEGORIES = getAllCategories(customCategories);

  // OPTIMIZATION: Load recent tasks for quick restart
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      const tasks = JSON.parse(localStorage.getItem(`timeTasks_${user.id}`) || '[]');
      // Get unique task names from last 20 tasks
      const unique = [...new Set(tasks.slice(0, 20).map(t => ({
        name: t.name,
        category: t.category,
        notes: t.notes || ''
      })))].slice(0, 5);
      setRecentTasks(unique);
    }
  }, []);

  // OPTIMIZATION: Auto-focus input for quick access
  useEffect(() => {
    if (!activeTask && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTask]);

  // OPTIMIZATION: Remember last category used
  useEffect(() => {
    const lastCategory = localStorage.getItem('lastUsedCategory');
    if (lastCategory) {
      setCategory(lastCategory);
    }
  }, []);

  const handleStart = () => {
    if (!taskName.trim()) return;
    localStorage.setItem('lastUsedCategory', category);
    onStart(taskName, category, notes);
    setTaskName('');
    setNotes('');
    setShowAdvanced(false);
  };

  const handleQuickStart = (template) => {
    localStorage.setItem('lastUsedCategory', template.category);
    onStart(template.name, template.category, '');
  };

  const handleRecentTaskStart = (task) => {
    setTaskName(task.name);
    setCategory(task.category);
    setNotes(task.notes);
    setTimeout(() => handleStart(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !activeTask && !e.shiftKey) {
      handleStart();
    }
  };

  // OPTIMIZATION: Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyPress = (e) => {
      // Cmd/Ctrl + K to focus input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Space to start quick task (only if no input focused)
      if (e.key === ' ' && document.activeElement === document.body && !activeTask) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  }, [activeTask]);

  return (
    <div className="space-y-4">
      {/* OPTIMIZATION: Show recent tasks for one-click restart */}
      {!activeTask && recentTasks.length > 0 && (
        <div className="p-4 bg-slate-700/20 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-slate-400 font-medium">Continue recent task:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentTasks.map((task, idx) => {
              const catInfo = CATEGORIES.find(c => c.id === task.category);
              return (
                <button
                  key={idx}
                  onClick={() => handleRecentTaskStart(task)}
                  className="px-3 py-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-600/50 hover:border-purple-500/50 text-slate-300 rounded-lg text-sm transition-all flex items-center gap-2"
                >
                  <span>{catInfo?.icon || '📌'}</span>
                  <span>{task.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Start Templates */}
      {!activeTask && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Zap className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span className="text-xs text-slate-400 flex-shrink-0">Quick start:</span>
          {QUICK_TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => handleQuickStart(template)}
              className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5"
            >
              <span>{template.icon}</span>
              <span>{template.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Input */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What are you working on? (⌘K to focus)"
            disabled={!!activeTask}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:bg-slate-800/30 disabled:text-slate-500 transition-all text-slate-200 placeholder:text-slate-500"
          />
          {/* OPTIMIZATION: Character counter for long names */}
          {taskName.length > 40 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              {taskName.length}/100
            </span>
          )}
        </div>
        {!activeTask ? (
          <button
            onClick={handleStart}
            disabled={!taskName.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600 flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={onStop}
            className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
          >
            <Square className="w-4 h-4" fill="currentColor" />
            <span>Stop</span>
          </button>
        )}
      </div>

      {!activeTask && (
        <>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-slate-400 hover:text-purple-400 flex items-center gap-2 transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAdvanced ? 'Hide' : 'Show'} category & notes
          </button>

          {showAdvanced && (
            <div className="p-5 bg-slate-800/30 rounded-xl border border-slate-700">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-300">
                  <Tag className="w-4 h-4" />
                  Category
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                        category === cat.id
                          ? 'bg-slate-700 border-purple-500 scale-105'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className={`text-xs font-medium ${
                        category === cat.id ? 'text-purple-400' : 'text-slate-400'
                      }`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-300">
                  <FileText className="w-4 h-4" />
                  Notes (optional)
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional details..."
                  rows="3"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none transition-all text-slate-200 placeholder:text-slate-500"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};