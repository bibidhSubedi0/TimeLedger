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
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [deviceId] = useState(() => getDeviceId());
  
  const isOnline = useOnlineStatus();
  const { elapsedTime, resetTimer } = useTimer(activeTask);
  const { syncData, isSyncing } = useTaskSync(isOnline, deviceId);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('timeTasks');
    if (saved) {
      setTasks(JSON.parse(saved));
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

  const startTask = (taskName) => {
    const newTask = {
      id: Date.now(),
      name: taskName,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <Header isOnline={isOnline} isSyncing={isSyncing} />
          <ActiveTimer activeTask={activeTask} elapsedTime={elapsedTime} />
          <TaskInput 
            activeTask={activeTask} 
            onStart={startTask} 
            onStop={stopTask} 
          />
        </div>

        <StatsGrid tasks={tasks} />
        <TaskList tasks={tasks} />
      </div>
    </div>
  );
}

export default App;
