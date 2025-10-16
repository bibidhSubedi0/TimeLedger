import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../config/supabase';

export const Header = ({ isOnline, isSyncing }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">Time Tracker</h1>
        </div>
        <div className="flex items-center gap-2">
          {isSyncing && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
          <div className={`px-3 py-1 rounded-full text-sm ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {isOnline ? '🟢 Online' : '⚫ Offline'}
          </div>
        </div>
      </div>

      {!supabase && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
          ⚠️ Supabase not configured. Add your credentials to src/App.js to enable sync.
        </div>
      )}
    </>
  );
};
