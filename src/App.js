import React, { useState, useEffect } from 'react';
import { supabase } from './config/supabase';
import { getDeviceId } from './utils/deviceUtils';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useTimer } from './hooks/useTimer';
import { useTaskSync } from './hooks/useTaskSync';
import { Header } from './components/Header';
import { ActiveTimer } from './components/ActiveTimer';
import { TaskInput } from './components/TaskInput';
import { StatsGrid } from './components/StatsGrid';
import { TaskList } from './components/TaskList';
import { Analytics } from './components/Analytics';
import { Goals } from './components/Goals';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [deviceId] = useState(() => getDeviceId());
  const [view, setView] = useState('tasks'); // 'tasks', 'analytics', 'goals'
  const [goals, setGoals] = useState([]);
  
  const isOnline = useOnlineStatus();
  const { elapsedTime, resetTimer } = useTimer(activeTask);
  const { syncData, isSyncing } = useTaskSync(isOnline, deviceId);

  // Load tasks and goals from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('timeTasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
    const savedGoals = localStorage.getItem('timeGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    // Initial sync if online
    if (isOnline && supabase) {
      syncData().then(syncedTasks => {
        if (syncedTasks) {
          setTasks(syncedTasks);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timeTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timeGoals', JSON.stringify(goals));
  }, [goals]);

  // Monitor online status and sync when coming online
  useEffect(() => {
    if (isOnline && supabase) {
      syncData().then(syncedTasks => {
        if (syncedTasks) {
          setTasks(syncedTasks);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

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

    // Trigger sync if online
    if (isOnline && supabase) {
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
    setGoals(prev => [...prev, { ...goal, id: Date.now() }]);
  };

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const updateGoal = (goalId, updates) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updates } : g));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <Header isOnline={isOnline} isSyncing={isSyncing} view={view} setView={setView} />
          
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