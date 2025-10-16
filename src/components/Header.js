import React from 'react';
import { Clock, RefreshCw, BarChart3, Target, List } from 'lucide-react';
import { supabase } from '../config/supabase';

export const Header = ({ isOnline, isSyncing, view, setView }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" style={{ flexShrink: 0 }} />
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontSize: 'clamp(1.125rem, 5vw, 1.5rem)' }}>
            Time Tracker Pro
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isSyncing && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" style={{ flexShrink: 0 }} />}
          <div 
            className={`px-3 py-1 rounded-full text-sm ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
            style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', whiteSpace: 'nowrap' }}
          >
            {isOnline ? '🟢' : '⚫'}
            <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>
              {isOnline ? ' Online' : ' Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        <button
          onClick={() => setView('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            view === 'tasks' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={{ flex: '1 1 auto', minWidth: '90px', justifyContent: 'center' }}
        >
          <List className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span style={{ display: window.innerWidth < 380 ? 'none' : 'inline' }}>Tasks</span>
        </button>
        <button
          onClick={() => setView('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            view === 'analytics' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={{ flex: '1 1 auto', minWidth: '90px', justifyContent: 'center' }}
        >
          <BarChart3 className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span style={{ display: window.innerWidth < 380 ? 'none' : 'inline' }}>Analytics</span>
        </button>
        <button
          onClick={() => setView('goals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            view === 'goals' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          style={{ flex: '1 1 auto', minWidth: '90px', justifyContent: 'center' }}
        >
          <Target className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span style={{ display: window.innerWidth < 380 ? 'none' : 'inline' }}>Goals</span>
        </button>
      </div>

      {!supabase && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
          ⚠️ Supabase not configured. Add your credentials to enable cloud sync.
        </div>
      )}
    </>
  );
};