import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Credential } from '@/types/credential';
import { useAuth } from './useAuth';

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCredentials = useCallback(async () => {
    if (!user) {
      setCredentials([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching credentials:', error);
    } else {
      setCredentials(data?.map(cred => ({
        id: cred.id,
        websiteName: cred.website_name,
        websiteUrl: cred.website_url || '',
        username: cred.username,
        password: cred.password,
        tags: (cred as Record<string, unknown>).tags as string[] || [],
        createdAt: cred.created_at,
        updatedAt: cred.updated_at,
      })) || []);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const syncToGoogleSheets = async (credential: Record<string, unknown>) => {
    // This is a background sync - it should never block or fail the main operation
    // Credentials are ALWAYS stored in Supabase first, this is just an optional backup
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session for Google Sheets sync - skipping');
        return;
      }

      const result = await supabase.functions.invoke('sync-google-sheets', {
        body: { credential, action: credential.action || 'add' },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (result.data?.success) {
        console.log('Credential synced to Google Sheets successfully');
      } else {
        console.log('Google Sheets sync skipped or failed gracefully:', result.data?.message || 'Unknown reason');
      }
    } catch (error) {
      // Silently fail - Google Sheets sync is optional
      // The credential is already safely stored in Supabase
      console.log('Google Sheets sync failed (non-blocking):', error);
    }
  };

  const addCredential = useCallback(async (credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('credentials')
      .insert({
        user_id: user.id,
        website_name: credential.websiteName,
        website_url: credential.websiteUrl || null,
        username: credential.username,
        password: credential.password,
        tags: credential.tags || [],
      } as Record<string, unknown>)
      .select()
      .single();

    if (error) {
      console.error('Error adding credential:', error);
      return null;
    }

    // Sync to Google Sheets
    await syncToGoogleSheets(data);

    const newCredential: Credential = {
      id: data.id,
      websiteName: data.website_name,
      websiteUrl: data.website_url || '',
      username: data.username,
      password: data.password,
      tags: (data as Record<string, unknown>).tags as string[] || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setCredentials(prev => [newCredential, ...prev]);
    return newCredential;
  }, [user]);

  const updateCredential = useCallback(async (id: string, updates: Partial<Omit<Credential, 'id' | 'createdAt'>>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.websiteName) dbUpdates.website_name = updates.websiteName;
    if (updates.websiteUrl !== undefined) dbUpdates.website_url = updates.websiteUrl;
    if (updates.username) dbUpdates.username = updates.username;
    if (updates.password) dbUpdates.password = updates.password;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

    const { error } = await supabase
      .from('credentials')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating credential:', error);
      return;
    }

    const updatedCredential = credentials.find(c => c.id === id);
    if (updatedCredential) {
      const fullUpdatedCredential = { ...updatedCredential, ...updates };
      
      // Sync to Google Sheets
      await syncToGoogleSheets({
        id: fullUpdatedCredential.id,
        website_name: fullUpdatedCredential.websiteName,
        website_url: fullUpdatedCredential.websiteUrl,
        username: fullUpdatedCredential.username,
        password: fullUpdatedCredential.password,
        created_at: fullUpdatedCredential.createdAt,
        updated_at: new Date().toISOString(),
        action: 'update'
      });
    }

    setCredentials(prev => prev.map(cred =>
      cred.id === id
        ? { ...cred, ...updates, updatedAt: new Date().toISOString() }
        : cred
    ));
  }, [credentials]);

  const deleteCredential = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('credentials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting credential:', error);
      return;
    }

    // Sync to Google Sheets
    await syncToGoogleSheets({
      id: id,
      action: 'delete'
    });

    setCredentials(prev => prev.filter(cred => cred.id !== id));
  }, []);

  const searchCredentials = useCallback((query: string) => {
    if (!query.trim()) return credentials;
    const lowerQuery = query.toLowerCase();
    return credentials.filter(cred =>
      cred.websiteName.toLowerCase().includes(lowerQuery) ||
      cred.websiteUrl.toLowerCase().includes(lowerQuery) ||
      cred.username.toLowerCase().includes(lowerQuery)
    );
  }, [credentials]);

  const getRecentCredentials = useCallback((count: number = 5) => {
    return [...credentials]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, count);
  }, [credentials]);

  const getAllTags = useCallback(() => {
    const tagsSet = new Set<string>();
    credentials.forEach(cred => {
      cred.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [credentials]);

  const filterByTags = useCallback((tags: string[]) => {
    if (tags.length === 0) return credentials;
    return credentials.filter(cred =>
      tags.some(tag => cred.tags?.includes(tag))
    );
  }, [credentials]);

  return {
    credentials,
    isLoading,
    addCredential,
    updateCredential,
    deleteCredential,
    searchCredentials,
    getRecentCredentials,
    getAllTags,
    filterByTags,
    totalCount: credentials.length,
    refetch: fetchCredentials,
  };
}
