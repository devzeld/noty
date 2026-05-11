'use server';

import { cookies } from "next/headers";

const getBaseUrl = () => process.env.INTERNAL_API_URL || "http://backend/src";

export async function createDocumentAction(name: string, folder_id: string | null): Promise<string | number> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('No token found');  

  const res = await fetch(`${getBaseUrl()}/document.php`, {
    method: 'POST',
    headers: {
      'Cookie': `token=${token}`,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store',
    body: JSON.stringify({ title: name, content: "", folder_id: folder_id})
  });

  if (!res.ok) throw new Error('Failed to create document');
  const json = await res.json();
  return json.id; 
}

export async function updateDocumentAction(id: string | number, data: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('No token found');

  const res = await fetch(`${getBaseUrl()}/document.php?id=${id}`, {
    method: 'PUT',
    headers: {
      'Cookie': `token=${token}`,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error('Failed to update document');
  return await res.json();
}

export async function deleteDocumentAction(id: string | number) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('No token found');

  const res = await fetch(`${getBaseUrl()}/document.php?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Cookie': `token=${token}`,
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error('Failed to delete document');
  return true;
}

export async function restoreDocumentAction(id: string | number) {
  return updateDocumentAction(id, { restore: true });
}

export async function hardDeleteDocumentAction(id: string | number) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('No token found');

  const res = await fetch(`${getBaseUrl()}/document.php?id=${id}&permanent=1`, {
    method: 'DELETE',
    headers: {
      'Cookie': `token=${token}`,
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error('Failed to hard delete document');
  return true;
}

export async function toggleFavoriteAction(id: string | number, isFavorite: boolean) {
  return updateDocumentAction(id, { favorite: !isFavorite });
}

export async function moveDocumentAction(docId: string | number, folderId: string | number | null) {
  return updateDocumentAction(docId, { folder_id: folderId });
}