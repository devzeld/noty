"use server"

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    const baseUrl = process.env.INTERNAL_API_URL || "http://backend/src";
    
    await fetch(`${baseUrl}/auth/logout.php`, {
      method: 'POST',
      headers: {
        'Cookie': `token=${token}`,
        'Authorization': `Bearer ${token}`
      }
    }).catch(() => console.error("Errore di rete durante il logout PHP"));
  }

  cookieStore.delete('token');

  redirect('/auth');
}