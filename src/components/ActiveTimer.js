import React, { useState, useEffect } from 'react';
import { formatTime } from '../utils/timeUtils';
import { Maximize2, Minimize2 } from 'lucide-react';

const CATEGORIES = [
  { id: 'study', name: 'Study', color: '#3b82f6', icon: '📚' },
  { id: 'work', name: 'Work', color: '#8b5cf6', icon: '💼' },
  { id: 'gaming', name: 'Gaming', color: '#ec4899', icon: '🎮'},
  { id: 'exercise', name: 'Exercise', color: '#10b981', icon: '💪' },
  { id: 'reading', name: 'Reading', color: '#f59e0b', icon: '📖' },
  { id: 'coding', name: 'Coding', color: '#06b6d4', icon: '💻' },
  { id: 'creative', name: 'Creative', color: '#f97316', icon: '🎨' },
  { id: 'other', name: 'Other', color: '#64748b', icon: '📌' },
];

export const ActiveTimer = ({ activeTask, elapsedTime }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [milliseconds, setMilliseconds] = useState(0);

  useEffect(() => {
    if (!activeTask) {
      setIsFullscreen(false);
      return;
    }

    // Automatically go fullscreen when task starts
    setIsFullscreen(true);

    // Update milliseconds for smooth animation
    const msInterval = setInterval(() => {
      setMilliseconds(prev => (prev + 1) % 100);
    }, 10);

    return () => clearInterval(msInterval);
  }, [activeTask]);

  if (!activeTask) return null;

  const categoryInfo = CATEGORIES.find(c => c.id === activeTask.category) || CATEGORIES[CATEGORIES.length - 1];
  const hours = Math.floor(elapsedTime / 3600);
  const minutes = Math.floor((elapsedTime % 3600) / 60);
  const seconds = elapsedTime % 60;

  // Compact timer (when not fullscreen)
  if (!isFullscreen) {
    return (
      <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-blue-600 font-semibold mb-2 tracking-wide">TRACKING</div>
              <div className="text-lg font-medium text-slate-800 mb-3 truncate">{activeTask.name}</div>
              <div className="text-3xl font-mono font-semibold text-blue-600">
                {formatTime(elapsedTime)}
              </div>
            </div>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              title="Fullscreen timer"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen timer
  return (
    <div className="fullscreen-timer-overlay">
      {/* Floating particles */}
      {[...Array(9)].map((_, i) => (
        <div key={i} className="timer-particle" />
      ))}

      {/* Glow effect */}
      <div className="timer-glow" />

      <div className="timer-content">
        {/* Task name */}
        <h1 className="timer-task-name">{activeTask.name}</h1>

        {/* Category badge */}
        <div className="timer-category-badge">
          <span className="mr-2">{categoryInfo.icon}</span>
          {categoryInfo.name}
        </div>

        {/* Main timer display */}
        <div className="timer-display">
          <div className="timer-main">
            {String(hours).padStart(2, '0')}
            <span style={{ opacity: 0.4 }}>:</span>
            {String(minutes).padStart(2, '0')}
            <span style={{ opacity: 0.4 }}>:</span>
            {String(seconds).padStart(2, '0')}
            <span className="timer-subseconds">
              .{String(milliseconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="timer-actions">
          <button
            onClick={() => setIsFullscreen(false)}
            className="timer-btn"
          >
            <Minimize2 className="w-5 h-5" />
            Minimize
          </button>
        </div>

        {/* Notes if available */}
        {activeTask.notes && (
          <div className="timer-notes">
            <div className="timer-notes-label">Notes</div>
            <div className="timer-notes-text">{activeTask.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
};