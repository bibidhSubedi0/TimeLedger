import React from 'react';
import { Clock, RefreshCw, BarChart3, Target, List, LogOut, User } from 'lucide-react';
import { supabase } from '../config/supabase';

export const Header = ({ isOnline, isSyncing, view, setView, user, onSignOut }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center rounded-2xl shadow-lg shadow-blue-500/30">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-light text-slate-800 tracking-tight">
              Time Tracker
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Track your productivity</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-7 h-7 rounded-full shadow"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-sm text-slate-700 hidden md:inline font-medium max-w-[100px] truncate">
                {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
              <button
                onClick={onSignOut}
                className="p-1.5 hover:bg-red-50 rounded-xl transition-colors group"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          )}
          {isSyncing && (
            <div className="p-2 bg-blue-50 rounded-xl">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
            </div>
          )}
          <div 
            className={`px-3 py-2 rounded-2xl text-xs font-medium flex items-center border ${
              isOnline 
                ? 'bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-700 border-emerald-200' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            <span className="hidden sm:inline">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => setView('tasks')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
            view === 'tasks' 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <List className="w-5 h-5" />
          <span className="hidden sm:inline">Tasks</span>
        </button>
        <button
          onClick={() => setView('analytics')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
            view === 'analytics' 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="hidden sm:inline">Stats</span>
        </button>
        <button
          onClick={() => setView('goals')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
            view === 'goals' 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="hidden sm:inline">Goals</span>
        </button>
      </div>

      {!supabase && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-slate-700">
          ⚠️ Supabase not configured. Add credentials to enable sync.
        </div>
      )}
    </>
  );
};