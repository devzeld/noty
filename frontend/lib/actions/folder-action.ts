'use server';

import { cookies } from "next/headers";

const getBaseUrl = () => process.env.INTERNAL_API_URL || "http://backend/src";

export async function createFolderAction(name: string, parent_folder_id: string | null): Promise<string | number> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) throw new Error('No token found');  

  const res : Response = await fetch(`${getBaseUrl()}/folder.php`, {
    method: 'POST',
    headers: {
      'Cookie': `token=${token}`,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store',
    body: JSON.stringify({ name: name, parent_folder_id: parent_folder_id == "" ? null : parent_folder_id })
  });

  console.log("Request body:", JSON.stringify({ name: name, parent_folder_id: parent_folder_id == "" ? null : parent_folder_id }));

  if (!res.ok) throw new Error('Failed to create folder');

  const json : {message: string, id: string | number} = await res.json();
  
  return json.id; 
}

export async function getFoldersAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) throw new Error('No token found');  

  const res = await fetch(`${getBaseUrl()}/folder.php`, {
    method: 'GET',
    headers: {
      'Cookie': `token=${token}`,
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) throw new Error('Failed to fetch folders');

  const data = await res.json();
  return data; 
}

export async function deleteFolderAction(id: string | number) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('No token found');

  const res = await fetch(`${getBaseUrl()}/folder.php?id=${id}`, {
    method: 'DELETE',
    headers: { 'Cookie': `token=${token}`, 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) throw new Error('Failed to delete folder');
  return true;
}

export async function getAllFoldersAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('No token found');

  const res = await fetch(`${getBaseUrl()}/folder.php?all=1`, {
    method: 'GET',
    headers: { 'Cookie': `token=${token}`, 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });

  if (!res.ok) throw new Error('Failed to fetch all folders');
  const json = await res.json();
  return json.data || [];
}

export async function moveFolderAction(folderId: string | number, newParentId: string | number | null) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('No token found');

  const res = await fetch(`${getBaseUrl()}/folder.php?id=${folderId}`, {
    method: 'PUT',
    headers: { 
      'Cookie': `token=${token}`, 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ parent_folder_id: newParentId })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to move folder');
  }
  return await res.json();
}