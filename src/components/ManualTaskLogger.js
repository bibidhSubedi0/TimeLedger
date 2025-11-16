import React, { useState } from 'react';
import { Plus, Clock, Calendar, Tag, FileText, Save, X } from 'lucide-react';
import { getAllCategories } from '../utils/categoryUtils';

export const ManualTaskLogger = ({ onAddTask, onClose, customCategories = [] }) => {
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState('study');
  const [notes, setNotes] = useState('');
  
  // Date and time states - SEPARATE for cross-day support
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState('10:00');

  const CATEGORIES = getAllCategories(customCategories);

  const calculateDuration = () => {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    if (end <= start) {
      return 0;
    }
    
    return Math.floor((end - start) / 1000);
  };

  const handleSubmit = () => {
    if (!taskName.trim()) {
      alert('Please enter a task name');
      return;
    }

    const duration = calculateDuration();
    
    if (duration <= 0) {
      alert('End time must be after start time');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    const task = {
      id: Date.now(),
      name: taskName,
      category: category,
      notes: notes || '',
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      duration: duration,
      synced: false,
      calendarSynced: false,
      isManualLog: true
    };

    onAddTask(task);
    
    // Reset form
    setTaskName('');
    setNotes('');
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const currentDuration = calculateDuration();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Log Past Activity</h2>
              <p className="text-sm text-slate-400">Add a task you forgot to track</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Task Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <FileText className="w-4 h-4" />
              Task Name
            </label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="What did you work on?"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-200 placeholder:text-slate-500"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Tag className="w-4 h-4" />
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                    category === cat.id
                      ? 'bg-slate-700 border-purple-500 scale-105'
                      : 'bg-slate-900/30 border-slate-700 hover:border-slate-600 hover:bg-slate-900/50'
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

          {/* Start Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-200"
              />
            </div>
          </div>

          {/* End Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-200"
              />
            </div>
          </div>

          {/* Multi-day indicator */}
          {startDate !== endDate && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>This task spans multiple days</span>
            </div>
          )}

          {/* Duration Display */}
          {currentDuration > 0 && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total Duration</span>
                <span className="text-lg font-bold text-purple-400">
                  {formatDuration(currentDuration)}
                </span>
              </div>
            </div>
          )}

          {/* Validation Error */}
          {currentDuration <= 0 && startDate && endDate && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
              ⚠️ End time must be after start time
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <FileText className="w-4 h-4" />
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any details about this task..."
              rows="3"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!taskName.trim() || currentDuration <= 0}
            className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
};