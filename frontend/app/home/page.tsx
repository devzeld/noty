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
      {documents.length === 0 && (
        <p className="text-gray-500">Nessun documento trovato. Prova a creare un nuovo documento!</p>
      )}
      {documents.map((doc: any) => (
        <div key={doc.id} className="p-4 mb-4 border rounded">
          <h2 className="text-xl font-semibold">{doc.title}</h2>
          <p className="text-gray-500 overflow-hidden text-ellipsis">{doc.description}</p>
        </div>
      ))}
    </div>
  );
}