import { useState, useEffect, useCallback } from 'react';
import { Tag } from '../types';
import { apiFetch } from './useDocuments';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/tag.php');
      if (!res.ok) return;
      const data = await res.json();
      setTags(data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { tags, loading, refetch: fetch };
}

export async function createTag(data: { name: string; color?: string }) {
  const res = await apiFetch('/tag.php', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Errore creazione tag');
  }
  return res.json();
}

export async function updateTag(id: number, data: { name?: string; color?: string }) {
  const res = await apiFetch(`/tag.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Errore aggiornamento tag');
  return res.json();
}

export async function deleteTag(id: number) {
  const res = await apiFetch(`/tag.php?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Errore eliminazione tag');
  return res.json();
}