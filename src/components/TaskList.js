import React, { useState } from 'react';
import { formatTime } from '../utils/timeUtils';
import { Trash2, Edit2, Download, Filter, Clock, Check, X } from 'lucide-react';

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
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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

  const handleDelete = (taskId) => {
    setDeleteConfirmId(taskId);
  };

  const confirmDelete = (taskId) => {
    onDelete(taskId);
    setDeleteConfirmId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
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

  // Filter tasks by date - only today's tasks by default
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayEnd = new Date().setHours(23, 59, 59, 999);
  
  const tasksToShow = showAllTasks 
    ? tasks 
    : tasks.filter(t => t.startTime >= todayStart && t.startTime <= todayEnd);

  const filteredTasks = filterCategory === 'all' 
    ? tasksToShow 
    : tasksToShow.filter(t => t.category === filterCategory);

  const getCategoryInfo = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const todayTasksCount = tasks.filter(t => t.startTime >= todayStart && t.startTime <= todayEnd).length;
  const allTasksCount = tasks.length;

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-100">Recent Tasks</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              showFilters 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          {tasks.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Toggle between Today and All Tasks */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setShowAllTasks(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !showAllTasks
              ? 'bg-purple-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Today ({todayTasksCount})
        </button>
        <button
          onClick={() => setShowAllTasks(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            showAllTasks
              ? 'bg-purple-600 text-white'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          All Time ({allTasksCount})
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
          <div className="text-sm font-medium text-slate-300 mb-3">Filter by Category</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All ({tasksToShow.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = tasksToShow.filter(t => t.category === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterCategory === cat.id
                      ? 'bg-slate-700 border-2'
                      : 'bg-slate-700/50 hover:bg-slate-700'
                  }`}
                  style={{
                    borderColor: filterCategory === cat.id ? cat.color : 'transparent',
                    color: filterCategory === cat.id ? cat.color : '#cbd5e1'
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
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">
            {tasks.length === 0 
              ? 'No tasks tracked yet. Start your first task!' 
              : showAllTasks 
                ? 'No tasks found in this category.'
                : 'No tasks tracked today. Start tracking!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const categoryInfo = getCategoryInfo(task.category);
            
            if (editingId === task.id) {
              return (
                <div key={task.id} className="p-4 bg-slate-700/40 rounded-xl border border-slate-600/50">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 mb-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-200"
                  />
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Notes..."
                    rows="2"
                    className="w-full px-3 py-2 mb-3 bg-slate-800/50 border border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none text-slate-200"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-600/50 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            // Show delete confirmation
            if (deleteConfirmId === task.id) {
              return (
                <div key={task.id} className="p-4 bg-red-500/10 rounded-xl border-2 border-red-500/50">
                  <div className="text-slate-200 font-medium mb-3">Delete this task?</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmDelete(task.id)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="flex-1 px-4 py-2 bg-slate-600/50 hover:bg-slate-600 text-slate-300 rounded-lg text-sm font-medium transition-all"
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-purple-500/50 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-1 rounded-lg text-xs font-medium"
                      style={{
                        backgroundColor: `${categoryInfo.color}20`,
                        color: categoryInfo.color,
                      }}
                    >
                      {categoryInfo.icon} {categoryInfo.name}
                    </span>
                  </div>
                  <div className="font-medium text-slate-100 mb-1">{task.name}</div>
                  {task.notes && (
                    <div className="text-sm text-slate-400 italic mb-2">"{task.notes}"</div>
                  )}
                  <div className="text-xs text-slate-500">
                    {new Date(task.startTime).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="font-mono font-semibold text-lg text-purple-400">
                    {formatTime(task.duration)}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(task)}
                      className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
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