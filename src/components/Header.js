import React from 'react';
import { Clock, RefreshCw, BarChart3, Target, List, LogOut, User } from 'lucide-react';
import { supabase } from '../config/supabase';

export const Header = ({ isOnline, isSyncing, view, setView, user, onSignOut }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center rounded-xl shadow-lg" style={{ flexShrink: 0 }}>
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Time Tracker
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">Track your productivity</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg border border-indigo-100">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full shadow"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
              <span className="text-xs text-gray-700 hidden md:inline font-medium max-w-[80px] truncate">
                {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
              <button
                onClick={onSignOut}
                className="p-1 hover:bg-red-50 rounded transition-colors group"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5 text-gray-500 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          )}
          {isSyncing && (
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ flexShrink: 0 }} />
            </div>
          )}
          <div 
            className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center ${
              isOnline 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" style={{ backgroundColor: isOnline ? '#10b981' : '#9ca3af' }}></span>
            <span className="hidden sm:inline">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setView('tasks')}
          className={`flex items-center rounded-lg font-medium transition-all ${
            view === 'tasks' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
          style={{ 
            padding: '10px 12px',
            fontSize: '14px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <List className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span>Tasks</span>
        </button>
        <button
          onClick={() => setView('analytics')}
          className={`flex items-center rounded-lg font-medium transition-all ${
            view === 'analytics' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
          style={{ 
            padding: '10px 12px',
            fontSize: '14px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <BarChart3 className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span>Stats</span>
        </button>
        <button
          onClick={() => setView('goals')}
          className={`flex items-center rounded-lg font-medium transition-all ${
            view === 'goals' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
          style={{ 
            padding: '10px 12px',
            fontSize: '14px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Target className="w-4 h-4" style={{ flexShrink: 0 }} />
          <span>Goals</span>
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