'use server';

import { cookies } from "next/headers";

export async function createDocumentAction(name: string, folder_id: string | null): Promise<string | number> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) throw new Error('No token found');  

  const baseUrl = process.env.INTERNAL_API_URL || "http://backend/src";

  const res : Response = await fetch(`${baseUrl}/document.php`, {
    method: 'POST',
    headers: {
      'Cookie': `token=${token}`,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store',
    body: JSON.stringify({ title: name, content: "", folder_id: folder_id})
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Errore Backend:", errorText);
    throw new Error('Failed to create document');
  }

  const json : {message: string, id: string | number} = await res.json();
  
  return json.id; 
}