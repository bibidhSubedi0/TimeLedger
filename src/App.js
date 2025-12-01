import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './config/supabase';
import { useAuth } from './contexts/AuthContext';
import { getDeviceId } from './utils/deviceUtils';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useTimer } from './hooks/useTimer';
import { useTaskSync } from './hooks/useTaskSync';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { ActiveTimer } from './components/ActiveTimer';
import { TaskInput } from './components/TaskInput';
import { StatsGrid } from './components/StatsGrid';
import { TaskList } from './components/TaskList';
import { Analytics } from './components/Analytics';
import { Goals } from './components/Goals';
import { ManualTaskLogger } from './components/ManualTaskLogger';
import { CategoryManager } from './components/CategoryManager';
import { getDefaultCategories } from './utils/categoryUtils';
import { useCategorySync } from './hooks/useCategorySync';
import './App.css';

function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [deviceId] = useState(() => getDeviceId());
  const [view, setView] = useState('tasks');
  const [goals, setGoals] = useState([]);
  const [showManualLogger, setShowManualLogger] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  
  const isOnline = useOnlineStatus();
  const { elapsedTime, isPaused, resetTimer, togglePause } = useTimer(activeTask);
  const { syncData, syncGoals, isSyncing } = useTaskSync(isOnline, deviceId, user);
  const { syncCategories, isSyncing: isSyncingCategories } = useCategorySync(isOnline, user);

  // OPTIMIZATION 1: Persist active task to prevent data loss
  useEffect(() => {
    if (user && activeTask) {
      localStorage.setItem(`activeTask_${user.id}`, JSON.stringify({
        ...activeTask,
        persistedAt: Date.now()
      }));
    } else if (user && !activeTask) {
      localStorage.removeItem(`activeTask_${user.id}`);
    }
  }, [activeTask, user]);

  // OPTIMIZATION 2: Restore active task on mount (recovery from crashes/refreshes)
  useEffect(() => {
    if (user) {
      const savedActiveTask = localStorage.getItem(`activeTask_${user.id}`);
      if (savedActiveTask) {
        try {
          const parsed = JSON.parse(savedActiveTask);
          // Only restore if less than 24 hours old
          if (Date.now() - parsed.persistedAt < 24 * 60 * 60 * 1000) {
            setActiveTask(parsed);
          } else {
            // Auto-complete old task
            localStorage.removeItem(`activeTask_${user.id}`);
          }
        } catch (e) {
          console.error('Failed to restore active task:', e);
        }
      }
    }
  }, [user]);

  // OPTIMIZATION 3: Auto-sync periodically and save active task progress
  useEffect(() => {
    if (!user || !activeTask) return;

    const interval = setInterval(() => {
      // Save progress snapshot every 30 seconds
      const progressSnapshot = {
        ...activeTask,
        currentDuration: elapsedTime,
        lastSaved: Date.now()
      };
      localStorage.setItem(`activeTaskProgress_${user.id}`, JSON.stringify(progressSnapshot));
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [activeTask, elapsedTime, user]);

  // OPTIMIZATION 4: Aggressive sync retry on connection restore
  useEffect(() => {
    if (user && isOnline && supabase) {
      const userKey = `timeTasks_${user.id}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasUnsynced = parsed.some(t => !t.synced);
        if (hasUnsynced) {
          console.log('Found unsynced tasks, triggering sync...');
          syncData().then(syncedTasks => {
            if (syncedTasks) {
              setTasks(syncedTasks);
            }
          });
        }
      }
    }
  }, [isOnline, user, syncData]);

  // Load data from localStorage (works offline)
  useEffect(() => {
    if (!user) return;

    const userKey = `timeTasks_${user.id}`;
    const goalsKey = `timeGoals_${user.id}`;
    const categoriesKey = `timeCategories_${user.id}`;

    // Load tasks
    const saved = localStorage.getItem(userKey);
    if (saved) {
      setTasks(JSON.parse(saved));
    }

    // Load goals
    const savedGoals = localStorage.getItem(goalsKey);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }

    // Load categories
    const savedCategories = localStorage.getItem(categoriesKey);
    if (savedCategories) {
      const parsed = JSON.parse(savedCategories);
      // Migration: Add colors if missing
      const migratedCategories = parsed.map((cat, index) => {
        if (!cat.color) {
          const colors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', 
            '#06b6d4', '#f97316', '#ef4444', '#14b8a6', '#a855f7'
          ];
          return { ...cat, color: colors[index % colors.length] };
        }
        return cat;
      });
      setCustomCategories(migratedCategories);
    }

    // ONLY sync if online - app works fully offline
    if (isOnline && supabase) {
      Promise.all([
        syncData(),
        syncGoals(),
        syncCategories()
      ]).then(([syncedTasks, syncedGoals, syncedCategories]) => {
        if (syncedTasks) setTasks(syncedTasks);
        if (syncedGoals) setGoals(syncedGoals);
        if (syncedCategories) setCustomCategories(syncedCategories);
      });
    }
  }, [user, isOnline, syncData, syncGoals, syncCategories]);

  // Persist to localStorage whenever data changes (works offline)
  useEffect(() => {
    if (user) {
      const userKey = `timeTasks_${user.id}`;
      localStorage.setItem(userKey, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  useEffect(() => {
    if (user) {
      const goalsKey = `timeGoals_${user.id}`;
      localStorage.setItem(goalsKey, JSON.stringify(goals));
    }
  }, [goals, user]);

  useEffect(() => {
    if (user) {
      const categoriesKey = `timeCategories_${user.id}`;
      localStorage.setItem(categoriesKey, JSON.stringify(customCategories));
    }
  }, [customCategories, user]);

  const startTask = useCallback((taskName, category, notes) => {
    const newTask = {
      id: Date.now(),
      name: taskName,
      category: category || 'other',
      notes: notes || '',
      startTime: Date.now(),
      endTime: null,
      duration: 0
    };
    
    setActiveTask(newTask);
    resetTimer();
  }, [resetTimer]);

  const stopTask = useCallback(() => {
    if (!activeTask) return;
    
    const completedTask = {
      ...activeTask,
      endTime: Date.now(),
      duration: elapsedTime,
      synced: false,
      isManualLog: false
    };
    
    // Save immediately to localStorage
    setTasks(prev => {
      const updated = [completedTask, ...prev];
      if (user) {
        localStorage.setItem(`timeTasks_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    
    setActiveTask(null);
    resetTimer();
    
    // Clean up progress tracking
    if (user) {
      localStorage.removeItem(`activeTaskProgress_${user.id}`);
    }

    // Try to sync if online (but don't block)
    if (isOnline && supabase && user) {
      setTimeout(() => {
        syncData().then(syncedTasks => {
          if (syncedTasks) {
            setTasks(syncedTasks);
          }
        }).catch(err => {
          console.log('Sync failed, will retry later:', err);
        });
      }, 500);
    }
  }, [activeTask, elapsedTime, isOnline, resetTimer, syncData, user]);

  const addManualTask = useCallback((task) => {
    setTasks(prev => {
      const updated = [task, ...prev];
      if (user) {
        localStorage.setItem(`timeTasks_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    setShowManualLogger(false);

    // Sync if online
    if (isOnline && supabase && user) {
      setTimeout(() => {
        syncData().then(syncedTasks => {
          if (syncedTasks) setTasks(syncedTasks);
        }).catch(err => console.log('Sync failed, will retry later'));
      }, 500);
    }
  }, [isOnline, syncData, user]);

  const deleteTask = useCallback(async (taskId) => {
    // Delete from local state immediately
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== taskId);
      if (user) {
        localStorage.setItem(`timeTasks_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    
    // Delete from Supabase if online
    if (isOnline && supabase && user) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error deleting from server:', error);
        }
      } catch (error) {
        console.log('Deletion will sync later');
      }
    }
  }, [isOnline, user]);

  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => {
      const updated = prev.map(t => 
        t.id === taskId ? { ...t, ...updates, synced: false } : t
      );
      if (user) {
        localStorage.setItem(`timeTasks_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    
    // Sync if online
    if (isOnline && supabase && user) {
      setTimeout(() => {
        syncData().then(syncedTasks => {
          if (syncedTasks) setTasks(syncedTasks);
        }).catch(err => console.log('Update sync failed, will retry later'));
      }, 1000);
    }
  }, [isOnline, syncData, user]);

  const addGoal = useCallback((goal) => {
    setGoals(prev => {
      const updated = [...prev, { ...goal, id: Date.now(), synced: false }];
      if (user) {
        localStorage.setItem(`timeGoals_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    
    if (isOnline && supabase && user) {
      setTimeout(() => {
        syncGoals().then(syncedGoals => {
          if (syncedGoals) setGoals(syncedGoals);
        }).catch(err => console.log('Goal sync failed, will retry later'));
      }, 1000);
    }
  }, [isOnline, syncGoals, user]);

  const deleteGoal = useCallback(async (goalId) => {
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== goalId);
      if (user) {
        localStorage.setItem(`timeGoals_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    
    if (isOnline && supabase && user) {
      try {
        await supabase
          .from('goals')
          .delete()
          .eq('id', goalId)
          .eq('user_id', user.id);
      } catch (error) {
        console.log('Goal deletion will sync later');
      }
    }
  }, [isOnline, user]);

  const updateGoal = useCallback((goalId, updates) => {
    setGoals(prev => {
      const updated = prev.map(g => 
        g.id === goalId ? { ...g, ...updates, synced: false } : g
      );
      if (user) {
        localStorage.setItem(`timeGoals_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
    
    if (isOnline && supabase && user) {
      setTimeout(() => {
        syncGoals().then(syncedGoals => {
          if (syncedGoals) setGoals(syncedGoals);
        }).catch(err => console.log('Goal update sync failed, will retry later'));
      }, 1000);
    }
  }, [isOnline, syncGoals, user]);

  const handleUpdateCategories = useCallback((newCategories) => {
    const customOnly = newCategories.filter(cat => cat.isCustom);
    setCustomCategories(customOnly);
    
    if (user) {
      localStorage.setItem(`timeCategories_${user.id}`, JSON.stringify(customOnly));
    }
    
    if (isOnline && supabase && user) {
      syncCategories().catch(err => console.log('Category sync failed, will retry later'));
    }
  }, [isOnline, syncCategories, user]);

  const unsyncedCount = tasks.filter(t => !t.synced).length + 
                        goals.filter(g => !g.synced).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onSignIn={signInWithGoogle} />;
  }

  return (
    <>
      {showManualLogger && (
        <ManualTaskLogger 
          onAddTask={addManualTask}
          onClose={() => setShowManualLogger(false)}
          customCategories={customCategories}
        />
      )}

      {showCategoryManager && (
        <CategoryManager 
          categories={[...getDefaultCategories(), ...customCategories]}
          onUpdateCategories={handleUpdateCategories}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      <ActiveTimer 
        activeTask={activeTask} 
        elapsedTime={elapsedTime}
        isPaused={isPaused}
        onTogglePause={togglePause}
        onStop={stopTask}
        customCategories={customCategories}
      />
      
      <div className="min-h-screen bg-[#1a1d29] p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-6 md:p-8 mb-6">
            <Header 
              isOnline={isOnline} 
              isSyncing={isSyncing} 
              view={view} 
              setView={setView}
              user={user}
              onSignOut={signOut}
              unsyncedCount={unsyncedCount}
              onOpenManualLogger={() => setShowManualLogger(true)}
              onOpenCategoryManager={() => setShowCategoryManager(true)}
            />
            
            {view === 'tasks' && !activeTask && (
              <TaskInput 
                activeTask={activeTask} 
                onStart={startTask} 
                onStop={stopTask}
                customCategories={customCategories}
              />
            )}
            
            {view === 'tasks' && activeTask && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/10 rounded-full mb-4 border border-purple-500/20">
                  {isPaused ? (
                    <div className="text-3xl">⏸️</div>
                  ) : (
                    <div className="w-12 h-12 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
                  )}
                </div>
                <p className="text-slate-300 mb-6 text-lg">
                  {isPaused ? 'Timer paused' : 'Timer is running'}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={togglePause}
                    className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-all"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={stopTask}
                    className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-all"
                  >
                    Stop Task
                  </button>
                </div>
              </div>
            )}
          </div>

          {view === 'tasks' && (
            <>
              <StatsGrid tasks={tasks} goals={goals} />
              <TaskList 
                tasks={tasks} 
                onDelete={deleteTask}
                onUpdate={updateTask}
                customCategories={customCategories}
              />
            </>
          )}

          {view === 'analytics' && (
            <Analytics tasks={tasks} customCategories={customCategories} />
          )}

          {view === 'goals' && (
            <Goals 
              goals={goals}
              tasks={tasks}
              onAddGoal={addGoal}
              onDeleteGoal={deleteGoal}
              onUpdateGoal={updateGoal}
              customCategories={customCategories}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default App;