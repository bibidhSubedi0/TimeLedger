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
import './App.css';

function App() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [deviceId] = useState(() => getDeviceId());
  const [view, setView] = useState('tasks');
  const [goals, setGoals] = useState([]);
  
  const isOnline = useOnlineStatus();
  const { elapsedTime, resetTimer } = useTimer(activeTask);
  const { syncData, syncGoals, isSyncing } = useTaskSync(isOnline, deviceId, user);

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

  useEffect(() => {
    if (isOnline && supabase && user) {
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
  }, [isOnline, user]);

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
      synced: false
    };
    
    setTasks(prev => [completedTask, ...prev]);
    setActiveTask(null);
    resetTimer();

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

  const deleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates, synced: false } : t));
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

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onSignIn={signInWithGoogle} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded shadow-lg p-6 mb-4 border border-gray-200">
          <Header 
            isOnline={isOnline} 
            isSyncing={isSyncing} 
            view={view} 
            setView={setView}
            user={user}
            onSignOut={signOut}
          />
          
          {view === 'tasks' && (
            <>
              <ActiveTimer activeTask={activeTask} elapsedTime={elapsedTime} />
              <TaskInput 
                activeTask={activeTask} 
                onStart={startTask} 
                onStop={stopTask} 
              />
            </>
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
  );
}

export default App;