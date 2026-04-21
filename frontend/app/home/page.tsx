import { cookies } from 'next/headers';

async function getDocuments() {
  const cookieStore = await cookies(); 
  const token = cookieStore.get('token')?.value;

  console.log("Token estratto in Next.js:", token); 

  if (!token) return [];

  try {
    const res = await fetch('http://localhost/noty/backend/src/document.php', {
      method: 'GET',
      headers: {
        'Cookie': `token=${token}`,
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json'
      },
      cache: 'no-store' 
    });

    if (!res.ok) {
      console.error("Errore dal PHP:", await res.text());
      return [];
    }
    
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Errore fetch documenti (Node.js):", error);
    return [];
  }
}

export default async function Home() {
  const documents = await getDocuments();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">I miei Documenti</h1>
      <pre>{JSON.stringify(documents, null, 2)}</pre>
      {/* Sostituisci il <pre> con il map() per renderizzare le card che avevamo fatto prima */}
    </div>
  );
}