import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../config/supabase';

export const useTaskSync = (isOnline, deviceId, user) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef(null);
  const syncAttemptedRef = useRef(false);

  const syncData = useCallback(async () => {
    if (!supabase || !isOnline || isSyncing || !user) return null;
    
    setIsSyncing(true);
    try {
      const userKey = `timeTasks_${user.id}`;
      const currentLocal = JSON.parse(localStorage.getItem(userKey) || '[]');
      
      // Upload local tasks that aren't synced yet
      const unsynced = currentLocal.filter(t => !t.synced);
      
      if (unsynced.length > 0) {
        console.log(`Syncing ${unsynced.length} unsynced tasks...`);
        
        // Try to upsert all unsynced tasks
        const { error: uploadError } = await supabase
          .from('tasks')
          .upsert(unsynced.map(t => ({
            id: t.id,
            name: t.name,
            category: t.category || 'other',
            notes: t.notes || null,
            start_time: t.startTime,
            end_time: t.endTime,
            duration: t.duration,
            device_id: deviceId,
            user_id: user.id,
            synced: true
          })), { onConflict: 'id' });
        
        if (uploadError) {
          console.error('Error uploading tasks:', uploadError);
          // Don't mark as synced if upload failed
        } else {
          console.log('Successfully synced tasks');
          // Mark all as synced only if upload succeeded
          const updated = currentLocal.map(t => 
            unsynced.find(u => u.id === t.id) ? { ...t, synced: true } : t
          );
          localStorage.setItem(userKey, JSON.stringify(updated));
        }
      }

      // Download tasks for this user only
      const { data: remoteTasks, error: downloadError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (!downloadError && remoteTasks) {
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
        
        // Merge with local unsynced tasks (in case upload failed)
        const localUnsynced = currentLocal.filter(t => !t.synced);
        const merged = [...localUnsynced, ...allTasks];
        
        const uniqueTasks = Array.from(
          new Map(merged.map(t => [t.id, t])).values()
        ).sort((a, b) => b.startTime - a.startTime);
        
        localStorage.setItem(userKey, JSON.stringify(uniqueTasks));
        
        return uniqueTasks;
      }
    } catch (error) {
      console.error('Sync error:', error);
      // Don't throw - we'll retry later
    } finally {
      setIsSyncing(false);
    }
    return null;
  }, [isOnline, isSyncing, deviceId, user]);

  const syncGoals = useCallback(async () => {
    if (!supabase || !isOnline || !user) return null;
    
    try {
      const goalsKey = `timeGoals_${user.id}`;
      const currentGoals = JSON.parse(localStorage.getItem(goalsKey) || '[]');
      
      // Upload local goals that aren't synced yet
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
            synced: true
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

      // Download goals for this user only
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
        
        // Merge with local unsynced goals
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

  // Trigger sync immediately when coming back online
  useEffect(() => {
    if (isOnline && supabase && user && !syncAttemptedRef.current) {
      syncAttemptedRef.current = true;
      console.log('Device came online - triggering immediate sync...');
      
      // Give a small delay to ensure connection is stable
      setTimeout(() => {
        syncData().then(syncedTasks => {
          if (syncedTasks) {
            console.log('Online sync completed');
          }
        });
        syncGoals().then(syncedGoals => {
          if (syncedGoals) {
            console.log('Goals online sync completed');
          }
        });
        syncAttemptedRef.current = false;
      }, 1000);
    }
  }, [isOnline, syncData, syncGoals, user]);

  // Periodic sync every 30 seconds (when online)
  useEffect(() => {
    if (isOnline && supabase && user) {
      syncTimeoutRef.current = setInterval(() => {
        syncData();
        syncGoals();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current);
      }
    };
  }, [isOnline, syncData, syncGoals, user]);

  return { syncData, syncGoals, isSyncing };
};