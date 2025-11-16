import React from 'react';
import { Clock, RefreshCw, BarChart3, Target, List, LogOut, User, CloudOff, AlertCircle, Plus, Tag } from 'lucide-react';
import { supabase } from '../config/supabase';

export const Header = ({ 
  isOnline, 
  isSyncing, 
  view, 
  setView, 
  user, 
  onSignOut, 
  unsyncedCount = 0,
  onOpenManualLogger,
  onOpenCategoryManager
}) => {
  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center rounded-xl">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
              Time Tracker
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">Track your productivity</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-xl border border-slate-600/50">
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-sm text-slate-300 hidden md:inline font-medium max-w-[100px] truncate">
                {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
              </span>
              <button
                onClick={onSignOut}
                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors group"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          )}
          
          {/* Unsynced Items Indicator */}
          {!isOnline && unsyncedCount > 0 && (
            <div className="px-3 py-2 bg-amber-500/20 rounded-xl text-xs font-medium flex items-center border border-amber-500/30 gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 hidden sm:inline">
                {unsyncedCount} unsynced
              </span>
            </div>
          )}
          
          {/* Syncing Indicator */}
          {isSyncing && (
            <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30" title="Syncing...">
              <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
            </div>
          )}
          
          {/* Online/Offline Status */}
          <div 
            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center border ${
              isOnline 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}
            title={isOnline ? 'Connected to internet' : 'No internet connection - data will sync when online'}
          >
            {isOnline ? (
              <>
                <span className="inline-block w-2 h-2 rounded-full mr-2 bg-emerald-400"></span>
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 mb-6 text-sm text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium mb-1">You're offline</div>
            <div className="text-amber-300/80">
              Your tasks are being saved locally and will automatically sync when you're back online.
              {unsyncedCount > 0 && ` You have ${unsyncedCount} task${unsyncedCount > 1 ? 's' : ''} waiting to sync.`}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => setView('tasks')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            view === 'tasks' 
              ? 'bg-purple-600 text-white' 
              : 'bg-slate-700/30 text-slate-400 border border-slate-600/50 hover:bg-slate-700/50'
          }`}
        >
          <List className="w-5 h-5" />
          <span className="hidden sm:inline">Tasks</span>
        </button>
        <button
          onClick={() => setView('analytics')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            view === 'analytics' 
              ? 'bg-purple-600 text-white' 
              : 'bg-slate-700/30 text-slate-400 border border-slate-600/50 hover:bg-slate-700/50'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="hidden sm:inline">Stats</span>
        </button>
        <button
          onClick={() => setView('goals')}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            view === 'goals' 
              ? 'bg-purple-600 text-white' 
              : 'bg-slate-700/30 text-slate-400 border border-slate-600/50 hover:bg-slate-700/50'
          }`}
        >
          <Target className="w-5 h-5" />
          <span className="hidden sm:inline">Goals</span>
        </button>
      </div>

      {/* Manual Task Logger & Category Manager Buttons */}
      {view === 'tasks' && (
        <div className="mb-6 space-y-3">
          <button
            onClick={onOpenManualLogger}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-purple-500/50 text-slate-300 hover:text-purple-300 rounded-xl font-medium transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Log Past Activity</span>
          </button>
          
          <button
            onClick={onOpenCategoryManager}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-purple-500/50 text-slate-300 hover:text-purple-300 rounded-xl font-medium transition-all group"
          >
            <Tag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>Manage Categories</span>
          </button>
        </div>
      )}

      {!supabase && (
        <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 mb-6 text-sm text-amber-200">
          ⚠️ Supabase not configured. Add credentials to enable sync.
        </div>
      )}
    </>
  );
};