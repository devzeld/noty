import { useState, useEffect, useCallback } from 'react';
import { Folder, FolderContents } from '../types';
import { apiFetch } from './useDocuments';

export function useFolders(parentId?: number | null) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = parentId ? `?id=${parentId}` : '';
      const res = await apiFetch(`/folder.php${params}`);
      if (!res.ok) return;
      const data = await res.json();
      if (parentId) {
        setFolders((data.data as FolderContents).folders);
      } else {
        setFolders(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [parentId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { folders, loading, refetch: fetch };
}

export function useFolderContents(folderId: number | null) {
  const [contents, setContents] = useState<FolderContents | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!folderId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/folder.php?id=${folderId}`);
      if (!res.ok) return;
      const data = await res.json();
      setContents(data.data);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { contents, loading, refetch: fetch };
}

// Recursive tree loader
export function useFolderTree() {
  const [tree, setTree] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/folder.php');
      if (!res.ok) return;
      const data = await res.json();
      setTree(data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { tree, loading, refetch: fetch };
}

export async function createFolder(data: { name: string; parent_folder_id?: number | null }) {
  const res = await apiFetch('/folder.php', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Errore creazione cartella');
  return res.json();
}

export async function updateFolder(id: number, data: { name?: string; parent_folder_id?: number | null }) {
  const res = await apiFetch(`/folder.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Errore aggiornamento cartella');
  return res.json();
}

export async function deleteFolder(id: number) {
  const res = await apiFetch(`/folder.php?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Errore eliminazione cartella');
  return res.json();
}