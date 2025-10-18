import React from 'react';
import { Clock, RefreshCw, BarChart3, Target, List, LogOut, User } from 'lucide-react';
import { supabase } from '../config/supabase';

export const Header = ({ isOnline, isSyncing, view, setView, user, onSignOut }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-800 flex items-center justify-center rounded" style={{ flexShrink: 0 }}>
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-medium text-gray-800" style={{ fontSize: 'clamp(1.125rem, 5vw, 1.5rem)' }}>
            Time Tracker
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded border border-gray-200">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-6 h-6 rounded"
                />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-sm text-gray-700 hidden sm:inline">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={onSignOut}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}
          {isSyncing && <RefreshCw className="w-4 h-4 text-gray-600 animate-spin" style={{ flexShrink: 0 }} />}
          <div 
            className={`px-3 py-1 rounded text-sm border ${isOnline ? 'bg-white border-gray-300 text-gray-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', whiteSpace: 'nowrap' }}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: isOnline ? '#2e7d32' : '#9e9e9e' }}></span>
            <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        <button
          onClick={() => setView('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all ${
            view === 'tasks' 
              ? 'bg-gray-800 text-white border border-gray-800' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          style={{ flex: '1 1 auto', minWidth: '90px', justifyContent: 'center' }}
        >
          <List className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span style={{ display: window.innerWidth < 380 ? 'none' : 'inline' }}>Tasks</span>
        </button>
        <button
          onClick={() => setView('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all ${
            view === 'analytics' 
              ? 'bg-gray-800 text-white border border-gray-800' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          style={{ flex: '1 1 auto', minWidth: '90px', justifyContent: 'center' }}
        >
          <BarChart3 className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span style={{ display: window.innerWidth < 380 ? 'none' : 'inline' }}>Analytics</span>
        </button>
        <button
          onClick={() => setView('goals')}
          className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-all ${
            view === 'goals' 
              ? 'bg-gray-800 text-white border border-gray-800' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          style={{ flex: '1 1 auto', minWidth: '90px', justifyContent: 'center' }}
        >
          <Target className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span style={{ display: window.innerWidth < 380 ? 'none' : 'inline' }}>Goals</span>
        </button>
      </div>

      {!supabase && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm text-gray-700">
          ⚠️ Supabase not configured. Add credentials to enable sync.
        </div>
      )}
    </>
  );
};