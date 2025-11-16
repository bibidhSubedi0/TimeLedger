import React, { useState, useEffect } from 'react';
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
import './App.css';

function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [deviceId] = useState(() => getDeviceId());
  const [view, setView] = useState('tasks');
  const [goals, setGoals] = useState([]);
  const [showManualLogger, setShowManualLogger] = useState(false);
  
  const isOnline = useOnlineStatus();
  const { elapsedTime, isPaused, resetTimer, togglePause } = useTimer(activeTask);
  const { syncData, syncGoals, isSyncing } = useTaskSync(isOnline, deviceId, user);

  // Check for unsynced tasks on mount and when coming online
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
  }, [isOnline, user]);

  useEffect(() => {
    if (!user) return;

    const userKey = `timeTasks_${user.id}`;
    const goalsKey = `timeGoals_${user.id}`;

    const saved = localStorage.getItem(userKey);
    if (saved) {
      setTasks(JSON.parse(saved));
    }
    const savedGoals = localStorage.getItem(goalsKey);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }

    if (isOnline && supabase) {
      syncData().then(syncedTasks => {
        if (syncedTasks) {
          setTasks(syncedTasks);
        }
      });
      syncGoals().then(syncedGoals => {
        if (syncedGoals) {
          setGoals(syncedGoals);
        }
      });
    }
  }, [user]);

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

  const startTask = (taskName, category, notes) => {
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
  };

  const stopTask = () => {
    if (!activeTask) return;
    
    const completedTask = {
      ...activeTask,
      endTime: Date.now(),
      duration: elapsedTime,
      synced: false,
      isManualLog: false
    };
    
    // Add to tasks immediately
    setTasks(prev => [completedTask, ...prev]);
    setActiveTask(null);
    resetTimer();

    // Try to sync to Supabase if online
    if (isOnline && supabase && user) {
      console.log('Task stopped, triggering sync...');
      setTimeout(() => {
        syncData().then(syncedTasks => {
          if (syncedTasks) {
            setTasks(syncedTasks);
          } else {
            console.log('Sync failed or offline - task will sync later');
          }
        });
      }, 500);
    } else {
      console.log('Offline - task will sync when connection is restored');
    }
  };

  const addManualTask = (task) => {
    // Add to tasks immediately
    setTasks(prev => [task, ...prev]);
    setShowManualLogger(false);

    // Sync to Supabase if online
    if (isOnline && supabase && user) {
      setTimeout(() => {
        syncData().then(syncedTasks => {
          if (syncedTasks) {
            setTasks(syncedTasks);
          }
        });
      }, 500);
    }
  };

  const deleteTask = async (taskId) => {
    // Delete from local state immediately for instant feedback
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    // Delete from Supabase if online
    if (isOnline && supabase && user) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error deleting task from Supabase:', error);
          // Optionally: re-sync to restore the task if deletion failed
          syncData().then(syncedTasks => {
            if (syncedTasks) {
              setTasks(syncedTasks);
            }
          });
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates, synced: false } : t));
    
    // Trigger sync to update Supabase
    if (isOnline && supabase && user) {
      setTimeout(() => {
        syncData().then(syncedTasks => {
          if (syncedTasks) {
            setTasks(syncedTasks);
          }
        });
      }, 1000);
    }
  };

  const addGoal = (goal) => {
    setGoals(prev => [...prev, { ...goal, id: Date.now(), synced: false }]);
    
    if (isOnline && supabase && user) {
      setTimeout(() => {
        syncGoals().then(syncedGoals => {
          if (syncedGoals) {
            setGoals(syncedGoals);
          }
        });
      }, 1000);
    }
  };

  const deleteGoal = async (goalId) => {
    // Delete from local state immediately
    setGoals(prev => prev.filter(g => g.id !== goalId));
    
    // Delete from Supabase if online
    if (isOnline && supabase && user) {
      try {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', goalId)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error deleting goal from Supabase:', error);
          // Optionally: re-sync to restore the goal if deletion failed
          syncGoals().then(syncedGoals => {
            if (syncedGoals) {
              setGoals(syncedGoals);
            }
          });
        }
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const updateGoal = (goalId, updates) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updates, synced: false } : g));
    
    if (isOnline && supabase && user) {
      setTimeout(() => {
        syncGoals().then(syncedGoals => {
          if (syncedGoals) {
            setGoals(syncedGoals);
          }
        });
      }, 1000);
    }
  };

  // Calculate unsynced count
  const unsyncedCount = tasks.filter(t => !t.synced).length + goals.filter(g => !g.synced).length;

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
        />
      )}

      <ActiveTimer 
        activeTask={activeTask} 
        elapsedTime={elapsedTime}
        isPaused={isPaused}
        onTogglePause={togglePause}
        onStop={stopTask}
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
            />
            
            {view === 'tasks' && !activeTask && (
              <TaskInput 
                activeTask={activeTask} 
                onStart={startTask} 
                onStop={stopTask} 
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
              />
            </>
          )}

          {view === 'analytics' && (
            <Analytics tasks={tasks} />
          )}

          {view === 'goals' && (
            <Goals 
              goals={goals}
              tasks={tasks}
              onAddGoal={addGoal}
              onDeleteGoal={deleteGoal}
              onUpdateGoal={updateGoal}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default App;