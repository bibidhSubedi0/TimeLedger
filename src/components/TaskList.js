import React, { useState } from 'react';
import { formatTime } from '../utils/timeUtils';
import { Trash2, Edit2, Download, Filter, X } from 'lucide-react';

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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Recent Tasks</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          {tasks.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-semibold text-gray-700 mb-2">Filter by Category</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                filterCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
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
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    filterCategory === cat.id
                      ? 'ring-2 ring-offset-2'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: filterCategory === cat.id ? cat.color + '20' : undefined,
                    color: filterCategory === cat.id ? cat.color : undefined,
                    ringColor: filterCategory === cat.id ? cat.color : undefined,
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
        <div className="text-center py-8 text-gray-500">
          {tasks.length === 0 
            ? 'No tasks tracked yet. Start tracking your first task!' 
            : 'No tasks found in this category.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const categoryInfo = getCategoryInfo(task.category);
            
            if (editingId === task.id) {
              return (
                <div key={task.id} className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 mb-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Notes..."
                    rows="2"
                    className="w-full px-3 py-2 mb-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={task.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: categoryInfo.color + '20',
                        color: categoryInfo.color,
                      }}
                    >
                      {categoryInfo.icon} {categoryInfo.name}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-800">{task.name}</div>
                  {task.notes && (
                    <div className="text-sm text-gray-600 mt-1 italic">"{task.notes}"</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(task.startTime).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    <div className="font-mono font-bold text-indigo-600">
                      {formatTime(task.duration)}
                    </div>
                    {!task.synced && (
                      <span className="text-xs text-gray-400" title="Not synced yet">⏳</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(task)}
                      className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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