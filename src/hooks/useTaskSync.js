import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../config/supabase';

export const useTaskSync = (isOnline, deviceId) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef(null);

  const syncData = useCallback(async () => {
    if (!supabase || !isOnline || isSyncing) return null;
    
    setIsSyncing(true);
    try {
      // Get current local task IDs
      const currentLocal = JSON.parse(localStorage.getItem('timeTasks') || '[]');
      
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
          return updated;
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
        return uniqueTasks;
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
    return null;
  }, [isOnline, isSyncing, deviceId]);

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
  }, [isOnline, syncData]);

  return { syncData, isSyncing };
};
