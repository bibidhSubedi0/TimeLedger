import React from 'react';
import { Clock, RefreshCw, BarChart3, Target, List, LogOut, User } from 'lucide-react';
import { supabase } from '../config/supabase';

export const Header = ({ isOnline, isSyncing, view, setView, user, onSignOut }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center rounded-xl shadow-lg" style={{ flexShrink: 0 }}>
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" style={{ fontSize: 'clamp(1.25rem, 5vw, 1.75rem)' }}>
              Time Tracker
            </h1>
            <p className="text-xs text-gray-500">Track your productivity</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg border border-indigo-100">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-7 h-7 rounded-full shadow"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-sm text-gray-700 hidden sm:inline font-medium">
                {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
              <button
                onClick={onSignOut}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          )}
          {isSyncing && (
            <div className="p-2 bg-indigo-50 rounded-lg">
              <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" style={{ flexShrink: 0 }} />
            </div>
          )}
          <div 
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              isOnline 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
            style={{ fontSize: 'clamp(0.75rem, 3vw, 0.875rem)', whiteSpace: 'nowrap' }}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: isOnline ? '#10b981' : '#9ca3af' }}></span>
            <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6" style={{ flexWrap: 'wrap' }}>
        <button
          onClick={() => setView('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            view === 'tasks' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
          style={{ flex: '1 1 auto', minWidth: '100px', justifyContent: 'center' }}
        >
          <List className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span style={{ display: window.innerWidth < 380 ? 'none' : 'inline' }}>Tasks</span>
        </button>
        <button
          onClick={() => setView('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            view === 'analytics' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
          style={{ flex: '1 1 auto', minWidth: '100px', justifyContent: 'center' }}
        >
          <BarChart3 className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span style={{ display: window.innerWidth < 380 ? 'none' : 'inline' }}>Analytics</span>
        </button>
        <button
          onClick={() => setView('goals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            view === 'goals' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
          style={{ flex: '1 1 auto', minWidth: '100px', justifyContent: 'center' }}
        >
          <Target className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span style={{ display: window.innerWidth < 380 ? 'none' : 'inline' }}>Goals</span>
        </button>
      </div>

      {!supabase && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-3 mb-4 text-sm text-gray-700">
          ⚠️ Supabase not configured. Add credentials to enable sync.
        </div>
      )}
    </>
  );
};