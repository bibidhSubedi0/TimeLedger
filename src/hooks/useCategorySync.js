import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

export const useCategorySync = (isOnline, user) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncCategories = useCallback(async () => {
    if (!supabase || !isOnline || !user) return null;
    
    setIsSyncing(true);
    try {
      const categoriesKey = `timeCategories_${user.id}`;
      const currentLocal = JSON.parse(localStorage.getItem(categoriesKey) || '[]');
      
      // Upload local categories that aren't synced yet
      const unsynced = currentLocal.filter(c => !c.synced);
      
      if (unsynced.length > 0) {
        console.log(`Syncing ${unsynced.length} custom categories...`);
        
        const { error: uploadError } = await supabase
          .from('categories')
          .upsert(unsynced.map(c => ({
            id: c.id,
            user_id: user.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            is_custom: c.isCustom,
            created_at: c.createdAt || Date.now(),
            updated_at: Date.now()
          })), { onConflict: 'user_id,id' });
        
        if (uploadError) {
          console.error('Error uploading categories:', uploadError);
        } else {
          console.log('Successfully synced categories');
          const updated = currentLocal.map(c => 
            unsynced.find(u => u.id === c.id) ? { ...c, synced: true } : c
          );
          localStorage.setItem(categoriesKey, JSON.stringify(updated));
        }
      }

      // Download categories from server
      const { data: remoteCategories, error: downloadError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      if (!downloadError && remoteCategories) {
        const allCategories = remoteCategories.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          isCustom: c.is_custom,
          createdAt: c.created_at,
          synced: true
        }));
        
        // Merge with local unsynced
        const localUnsynced = currentLocal.filter(c => !c.synced);
        const merged = [...localUnsynced, ...allCategories];
        
        const uniqueCategories = Array.from(
          new Map(merged.map(c => [c.id, c])).values()
        );
        
        localStorage.setItem(categoriesKey, JSON.stringify(uniqueCategories));
        
        return uniqueCategories;
      }
    } catch (error) {
      console.error('Category sync error:', error);
    } finally {
      setIsSyncing(false);
    }
    return null;
  }, [isOnline, user]);

  // Sync when coming online
  useEffect(() => {
    if (isOnline && supabase && user) {
      syncCategories();
    }
  }, [isOnline, syncCategories, user]);

  return { syncCategories, isSyncing };
};