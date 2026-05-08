'use server';

import { cookies } from "next/headers";

const getBaseUrl = () => process.env.INTERNAL_API_URL || "http://backend/src";

export async function getTagsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return [];

  const res = await fetch(`${getBaseUrl()}/tag.php`, {
    method: 'GET',
    headers: {
      'Cookie': `token=${token}`,
      'Authorization': `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function createTagAction(name: string, color: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) throw new Error('No token found');

  const res = await fetch(`${getBaseUrl()}/tag.php`, {
    method: 'POST',
    headers: {
      'Cookie': `token=${token}`,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, color })
  });

  if (!res.ok) throw new Error('Failed to create tag');
  return await res.json();
}