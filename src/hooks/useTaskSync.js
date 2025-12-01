import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../config/supabase';

export const useTaskSync = (isOnline, deviceId, user) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const syncTimeoutRef = useRef(null);
  const syncAttemptedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  // OPTIMIZATION: Exponential backoff for retries
  const getRetryDelay = (attemptNumber) => {
    return Math.min(1000 * Math.pow(2, attemptNumber), 30000); // Max 30 seconds
  };

  const syncData = useCallback(async (forceSync = false) => {
    if (!supabase || !user) return null;
    
    // OPTIMIZATION: Skip sync if recently synced (unless forced)
    if (!forceSync && lastSyncTime && Date.now() - lastSyncTime < 5000) {
      console.log('Skipping sync - too soon after last sync');
      return null;
    }

    // OPTIMIZATION: Skip if offline and not forced
    if (!isOnline && !forceSync) {
      console.log('Offline - sync will happen when online');
      return null;
    }

    if (isSyncing) {
      console.log('Sync already in progress');
      return null;
    }
    
    setIsSyncing(true);
    console.log(`Starting sync attempt ${retryCountRef.current + 1}...`);
    
    try {
      const userKey = `timeTasks_${user.id}`;
      const currentLocal = JSON.parse(localStorage.getItem(userKey) || '[]');
      
      // Upload local tasks that aren't synced yet
      const unsynced = currentLocal.filter(t => !t.synced);
      
      if (unsynced.length > 0) {
        console.log(`Syncing ${unsynced.length} unsynced tasks...`);
        
        // OPTIMIZATION: Batch upload with conflict resolution
        const tasksToUpload = unsynced.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category || 'other',
          notes: t.notes || null,
          start_time: t.startTime,
          end_time: t.endTime,
          duration: t.duration,
          device_id: deviceId,
          user_id: user.id,
          synced: true,
          updated_at: new Date().toISOString()
        }));

        const { error: uploadError, data: uploadedData } = await supabase
          .from('tasks')
          .upsert(tasksToUpload, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })
          .select();
        
        if (uploadError) {
          console.error('Error uploading tasks:', uploadError);
          throw uploadError;
        } else {
          console.log(`Successfully synced ${tasksToUpload.length} tasks`);
          // Mark all as synced only if upload succeeded
          const updated = currentLocal.map(t => 
            unsynced.find(u => u.id === t.id) ? { ...t, synced: true } : t
          );
          localStorage.setItem(userKey, JSON.stringify(updated));
          
          // Reset retry counter on success
          retryCountRef.current = 0;
        }
      }

      // Download tasks from server with conflict resolution
      const { data: remoteTasks, error: downloadError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (downloadError) {
        console.error('Error downloading tasks:', downloadError);
        throw downloadError;
      }

      if (remoteTasks) {
        const allTasks = remoteTasks.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category || 'other',
          notes: t.notes || '',
          startTime: t.start_time,
          endTime: t.end_time,
          duration: t.duration,
          synced: true
        }));
        
        // OPTIMIZATION: Merge with local unsynced tasks (conflict resolution)
        const localUnsynced = currentLocal.filter(t => !t.synced);
        const merged = [...localUnsynced, ...allTasks];
        
        // Remove duplicates, preferring synced versions
        const uniqueTasks = Array.from(
          new Map(merged.map(t => [t.id, t])).values()
        ).sort((a, b) => b.startTime - a.startTime);
        
        localStorage.setItem(userKey, JSON.stringify(uniqueTasks));
        setLastSyncTime(Date.now());
        
        return uniqueTasks;
      }
    } catch (error) {
      console.error('Sync error:', error);
      
      // OPTIMIZATION: Implement retry with exponential backoff
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        const delay = getRetryDelay(retryCountRef.current);
        console.log(`Retry ${retryCountRef.current}/${maxRetries} in ${delay}ms`);
        
        setTimeout(() => {
          syncData(true);
        }, delay);
      } else {
        console.log('Max retries reached. Will try again later.');
        retryCountRef.current = 0; // Reset for next sync cycle
      }
    } finally {
      setIsSyncing(false);
    }
    return null;
  }, [isOnline, isSyncing, deviceId, user, lastSyncTime]);

  const syncGoals = useCallback(async () => {
    if (!supabase || !isOnline || !user) return null;
    
    try {
      const goalsKey = `timeGoals_${user.id}`;
      const currentGoals = JSON.parse(localStorage.getItem(goalsKey) || '[]');
      
      // Upload unsynced goals
      const unsyncedGoals = currentGoals.filter(g => !g.synced);
      
      if (unsyncedGoals.length > 0) {
        console.log(`Syncing ${unsyncedGoals.length} unsynced goals...`);
        
        const { error: uploadError } = await supabase
          .from('goals')
          .upsert(unsyncedGoals.map(g => ({
            id: g.id,
            name: g.name,
            type: g.type,
            target_seconds: g.targetSeconds,
            category: g.category || 'all',
            device_id: deviceId,
            user_id: user.id,
            created_at: g.createdAt,
            completed_at: g.completedAt || null,
            synced: true,
            updated_at: new Date().toISOString()
          })), { onConflict: 'id' });
        
        if (uploadError) {
          console.error('Error uploading goals:', uploadError);
        } else {
          console.log('Successfully synced goals');
          const updated = currentGoals.map(g => 
            unsyncedGoals.find(u => u.id === g.id) ? { ...g, synced: true } : g
          );
          localStorage.setItem(goalsKey, JSON.stringify(updated));
        }
      }

      // Download goals
      const { data: remoteGoals, error: downloadError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!downloadError && remoteGoals) {
        const allGoals = remoteGoals.map(g => ({
          id: g.id,
          name: g.name,
          type: g.type,
          targetSeconds: g.target_seconds,
          category: g.category || 'all',
          createdAt: g.created_at,
          completedAt: g.completed_at,
          synced: true
        }));
        
        const localUnsynced = currentGoals.filter(g => !g.synced);
        const merged = [...localUnsynced, ...allGoals];
        
        const uniqueGoals = Array.from(
          new Map(merged.map(g => [g.id, g])).values()
        ).sort((a, b) => b.createdAt - a.createdAt);
        
        localStorage.setItem(goalsKey, JSON.stringify(uniqueGoals));
        
        return uniqueGoals;
      }
    } catch (error) {
      console.error('Goals sync error:', error);
    }
    return null;
  }, [isOnline, deviceId, user]);

  // OPTIMIZATION: Immediate sync when coming back online
  useEffect(() => {
    if (isOnline && supabase && user && !syncAttemptedRef.current) {
      syncAttemptedRef.current = true;
      console.log('Device came online - triggering immediate sync...');
      
      // Small delay to ensure connection is stable
      setTimeout(() => {
        syncData(true).then(() => {
          console.log('Online sync completed');
        });
        syncGoals().then(() => {
          console.log('Goals online sync completed');
        });
        syncAttemptedRef.current = false;
      }, 1000);
    }
    
    // Reset sync attempt flag when going offline
    if (!isOnline) {
      syncAttemptedRef.current = false;
    }
  }, [isOnline, syncData, syncGoals, user]);

  // OPTIMIZATION: Smart periodic sync - only when online and tab is visible
  useEffect(() => {
    if (!isOnline || !supabase || !user) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && isOnline) {
        console.log('Tab became visible - syncing...');
        syncData();
        syncGoals();
      }
    };

    // Sync when tab becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic sync every 60 seconds when tab is visible
    syncTimeoutRef.current = setInterval(() => {
      if (!document.hidden) {
        syncData();
        syncGoals();
      }
    }, 60000); // 60 seconds
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current);
      }
    };
  }, [isOnline, syncData, syncGoals, user]);

  // OPTIMIZATION: Sync before page unload to prevent data loss
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isOnline && supabase && user) {
        const userKey = `timeTasks_${user.id}`;
        const tasks = JSON.parse(localStorage.getItem(userKey) || '[]');
        const hasUnsynced = tasks.some(t => !t.synced);
        
        if (hasUnsynced) {
          // Mark that we need to sync on next load
          localStorage.setItem(`needsSync_${user.id}`, 'true');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isOnline, user]);

  return { syncData, syncGoals, isSyncing, lastSyncTime };
};