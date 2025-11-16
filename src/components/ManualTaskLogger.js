import React, { useState } from 'react';
import { Plus, Clock, Calendar, Tag, FileText, Save, X } from 'lucide-react';

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

export const ManualTaskLogger = ({ onAddTask, onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState('study');
  const [notes, setNotes] = useState('');
  
  // Date and time states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  
  // Duration presets
  const [usePreset, setUsePreset] = useState(false);
  const [durationHours, setDurationHours] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(0);

  const handlePresetChange = (hours, minutes) => {
    setDurationHours(hours);
    setDurationMinutes(minutes);
    setUsePreset(true);
  };

  const calculateDuration = () => {
    if (usePreset) {
      return (durationHours * 3600) + (durationMinutes * 60);
    } else {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      
      // If end is before start, assume it's next day
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }
      
      return Math.floor((end - start) / 1000);
    }
  };

  const handleSubmit = () => {
    if (!taskName.trim()) {
      alert('Please enter a task name');
      return;
    }

    const duration = calculateDuration();
    
    if (duration <= 0) {
      alert('Duration must be greater than 0');
      return;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + (duration * 1000));

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
    setUsePreset(false);
    setDurationHours(1);
    setDurationMinutes(0);
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

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-200"
            />
          </div>

          {/* Time Input Mode Toggle */}
          <div className="flex gap-2 p-1 bg-slate-900/50 rounded-lg">
            <button
              onClick={() => setUsePreset(false)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !usePreset
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Start & End Time
            </button>
            <button
              onClick={() => setUsePreset(true)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                usePreset
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Duration
            </button>
          </div>

          {/* Time Inputs - Start & End */}
          {!usePreset && (
            <div className="grid grid-cols-2 gap-4">
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
          )}

          {/* Duration Presets */}
          {usePreset && (
            <div>
              <label className="text-sm font-medium text-slate-300 mb-3 block">
                Quick Duration
              </label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { h: 0, m: 15, label: '15m' },
                  { h: 0, m: 30, label: '30m' },
                  { h: 1, m: 0, label: '1h' },
                  { h: 2, m: 0, label: '2h' },
                  { h: 3, m: 0, label: '3h' },
                  { h: 4, m: 0, label: '4h' },
                  { h: 6, m: 0, label: '6h' },
                  { h: 8, m: 0, label: '8h' },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetChange(preset.h, preset.m)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      durationHours === preset.h && durationMinutes === preset.m
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Hours
                  </label>
                  <input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    max="24"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Minutes
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    min="0"
                    max="59"
                    step="5"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-200"
                  />
                </div>
              </div>
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