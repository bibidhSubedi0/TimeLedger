import React, { useState } from 'react';
import { formatTime } from '../utils/timeUtils';
import { Trash2, Edit2, Download, Filter } from 'lucide-react';

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

export const TaskList = ({ tasks, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const exportToCSV = () => {
    const headers = ['Task Name', 'Category', 'Start Time', 'Duration', 'Notes'];
    const rows = filteredTasks.map(task => [
      task.name,
      task.category || 'other',
      new Date(task.startTime).toLocaleString(),
      formatTime(task.duration),
      task.notes || ''
    ]);

    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditName(task.name);
    setEditNotes(task.notes || '');
  };

  const saveEdit = () => {
    onUpdate(editingId, { name: editName, notes: editNotes });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditNotes('');
  };

  const filteredTasks = filterCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === filterCategory);

  const getCategoryInfo = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-slate-800">Recent Tasks</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-200 text-sm font-medium transition-all"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          {tasks.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg text-sm font-medium transition-all duration-300"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="mb-6 p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
          <div className="text-sm font-medium text-slate-700 mb-3">Filter by Category</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                filterCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              All ({tasks.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = tasks.filter(t => t.category === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filterCategory === cat.id
                      ? 'bg-white border-2 shadow-lg scale-105'
                      : 'bg-white border border-slate-200 hover:border-slate-300'
                  }`}
                  style={{
                    borderColor: filterCategory === cat.id ? cat.color : undefined
                  }}
                >
                  {cat.icon} {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          {tasks.length === 0 
            ? 'No tasks tracked yet. Start tracking your first task!' 
            : 'No tasks found in this category.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const categoryInfo = getCategoryInfo(task.category);
            
            if (editingId === task.id) {
              return (
                <div key={task.id} className="p-5 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 mb-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Notes..."
                    rows="2"
                    className="w-full px-4 py-3 mb-4 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg text-sm font-medium transition-all duration-300"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-5 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 text-sm font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={task.id} 
                className="flex justify-between items-start p-4 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-3 py-1 rounded-xl text-xs font-medium"
                      style={{
                        backgroundColor: `${categoryInfo.color}15`,
                        color: categoryInfo.color,
                      }}
                    >
                      {categoryInfo.icon} {categoryInfo.name}
                    </span>
                  </div>
                  <div className="font-medium text-slate-800 mb-1">{task.name}</div>
                  {task.notes && (
                    <div className="text-sm text-slate-600 italic mb-2">"{task.notes}"</div>
                  )}
                  <div className="text-xs text-slate-500">
                    {new Date(task.startTime).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <div className="font-mono font-semibold text-slate-800">
                      {formatTime(task.duration)}
                    </div>
                    {!task.synced && (
                      <span className="text-xs text-slate-400" title="Not synced yet">⏳</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(task)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};