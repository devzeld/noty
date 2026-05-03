'use server';

import { cookies } from "next/headers";

export async function createFolderAction(name: string, parent_folder_id: string | null): Promise<string | number> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) throw new Error('No token found');  

  const baseUrl = process.env.INTERNAL_API_URL || "http://backend/src";

  const res : Response = await fetch(`${baseUrl}/folder.php`, {
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

  const baseUrl = process.env.INTERNAL_API_URL || "http://backend/src";

  const res = await fetch(`${baseUrl}/folder.php`, {
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