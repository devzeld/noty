import { useState, useEffect, useCallback } from 'react';
import { Document } from '../types';

const BASE = 'http://localhost/noty/backend/src';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  };
  let res = await fetch(`${BASE}${endpoint}`, config);
  if (res.status === 401) {
    const ref = await fetch(`${BASE}/auth/refresh.php`, { method: 'POST', credentials: 'include' });
    if (ref.ok) res = await fetch(`${BASE}${endpoint}`, config);
    else { window.location.href = '/auth/login'; throw new Error('Unauthorized'); }
  }
  return res;
}

export { apiFetch };

export function useDocuments(folderId?: number | null, search?: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (folderId !== undefined && folderId !== null) params.set('folder_id', String(folderId));
      if (search) params.set('q', search);
      const res = await apiFetch(`/document.php?${params}`);
      if (!res.ok) throw new Error('Errore caricamento documenti');
      const data = await res.json();
      setDocuments(data.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [folderId, search]);

  useEffect(() => { fetch(); }, [fetch]);

  return { documents, loading, error, refetch: fetch };
}

export function useDocument(id: number | null) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiFetch(`/document.php?id=${id}`)
      .then(r => r.json())
      .then(d => setDocument(d.data))
      .finally(() => setLoading(false));
  }, [id]);

  return { document, loading, setDocument };
}

export async function createDocument(data: { title?: string; content?: string; folder_id?: number | null; tag_ids?: number[] }) {
  const res = await apiFetch('/document.php', { method: 'POST', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Errore creazione documento');
  return res.json();
}

export async function updateDocument(id: number, data: { title?: string; content?: string; folder_id?: number | null; tag_ids?: number[] }) {
  const res = await apiFetch(`/document.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Errore aggiornamento documento');
  return res.json();
}

export async function deleteDocument(id: number) {
  const res = await apiFetch(`/document.php?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Errore eliminazione documento');
  return res.json();
}