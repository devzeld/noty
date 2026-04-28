'use server';

import { cookies } from "next/headers";

export async function createFolderAction(name: string, parent_folder_id: string): Promise<string | number> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) throw new Error('No token found');  

  const url = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/noty/backend/src/';

  const res : Response = await fetch(`${url}folder.php`, {
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