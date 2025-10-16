import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Clock, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your Supabase credentials

const SUPABASE_URL = 'https://yffwlcerbdkpsyulakic.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZndsY2VyYmRrcHN5dWxha2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTM0OTksImV4cCI6MjA3NjA4OTQ5OX0.jRD_DnQOzNwfk7mKkMRMLtfKIlR2qjlKV2kFtiMMPOU';




const supabase = SUPABASE_URL !== 'YOUR_SUPABASE_URL' 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [activeTask, setActiveTask] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', id);
    }
    return id;
  });
  const intervalRef = useRef(null);
  const syncTimeoutRef = useRef(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('timeTasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
    // Initial sync if online
    if (isOnline && supabase) {
      syncData();
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timeTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Monitor online status and sync when coming online
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (supabase) {
        syncData();
      }
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [tasks]);

  // Auto-sync every 30 seconds when online
  useEffect(() => {
    if (isOnline && supabase) {
      syncTimeoutRef.current = setInterval(() => {
        syncData();
      }, 30000);
    }
    return () => {
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current);
      }
    };
  }, [isOnline, tasks]);

  // Timer effect
  useEffect(() => {
    if (activeTask) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTask]);

  const syncData = async () => {
    if (!supabase || !isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      // Get current local task IDs
      const currentLocal = JSON.parse(localStorage.getItem('timeTasks') || '[]');
      const localIds = new Set(currentLocal.map(t => t.id));
      
      // Upload local tasks that aren't synced yet
      const unsynced = currentLocal.filter(t => !t.synced);
      if (unsynced.length > 0) {
        const { error: uploadError } = await supabase
          .from('tasks')
          .upsert(unsynced.map(t => ({
            id: t.id,
            name: t.name,
            start_time: t.startTime,
            end_time: t.endTime,
            duration: t.duration,
            device_id: deviceId
          })));
        
        if (!uploadError) {
          // Mark as synced
          const updated = currentLocal.map(t => 
            unsynced.find(u => u.id === t.id) ? { ...t, synced: true } : t
          );
          localStorage.setItem('timeTasks', JSON.stringify(updated));
          setTasks(updated);
        }
      }

      // Download ALL tasks from database
      const { data: remoteTasks, error: downloadError } = await supabase
        .from('tasks')
        .select('*')
        .order('start_time', { ascending: false });

      if (!downloadError && remoteTasks) {
        // Convert remote tasks to local format
        const allTasks = remoteTasks.map(t => ({
          id: t.id,
          name: t.name,
          startTime: t.start_time,
          endTime: t.end_time,
          duration: t.duration,
          synced: true
        }));
        
        // Remove duplicates by ID
        const uniqueTasks = Array.from(
          new Map(allTasks.map(t => [t.id, t])).values()
        ).sort((a, b) => b.startTime - a.startTime);
        
        localStorage.setItem('timeTasks', JSON.stringify(uniqueTasks));
        setTasks(uniqueTasks);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTask = () => {
    if (!taskName.trim()) return;
    
    const newTask = {
      id: Date.now(),
      name: taskName,
      startTime: Date.now(),
      endTime: null,
      duration: 0
    };
    
    setActiveTask(newTask);
    setElapsedTime(0);
    setTaskName('');
  };

  const stopTask = () => {
    if (!activeTask) return;
    
    const completedTask = {
      ...activeTask,
      endTime: Date.now(),
      duration: elapsedTime,
      synced: false
    };
    
    setTasks(prev => [completedTask, ...prev]);
    setActiveTask(null);
    setElapsedTime(0);

    // Trigger sync if online
    if (isOnline && supabase) {
      setTimeout(() => syncData(), 1000);
    }
  };

  const getTotalTime = () => {
    return tasks.reduce((sum, task) => sum + task.duration, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
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

          {/* Active Timer */}
          {activeTask && (
            <div className="bg-indigo-50 rounded-lg p-4 mb-4 border-2 border-indigo-200">
              <div className="text-sm text-indigo-600 font-semibold mb-1">TRACKING</div>
              <div className="text-xl font-bold text-gray-800 mb-2">{activeTask.name}</div>
              <div className="text-3xl font-mono font-bold text-indigo-600">
                {formatTime(elapsedTime)}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !activeTask && startTask()}
              placeholder="What are you working on?"
              disabled={!!activeTask}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            />
            {!activeTask ? (
              <button
                onClick={startTask}
                disabled={!taskName.trim()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start
              </button>
            ) : (
              <button
                onClick={stopTask}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                Stop
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {tasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Total Tracked</div>
                <div className="text-2xl font-bold text-gray-800">{formatTime(getTotalTime())}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Tasks Completed</div>
                <div className="text-2xl font-bold text-gray-800">{tasks.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Tasks</h2>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks tracked yet. Start tracking your first task!
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{task.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(task.startTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-mono font-bold text-indigo-600">
                      {formatTime(task.duration)}
                    </div>
                    {!task.synced && (
                      <span className="text-xs text-gray-400" title="Not synced yet">⏳</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;