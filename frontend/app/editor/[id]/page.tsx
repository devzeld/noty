import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getSingleDocument(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  console.log(`\n--- DEBUG EDITOR ---`);
  console.log(`1. Cerco documento ID:`, id);

  if (!token) {
    console.log(`2. ERRORE: Token mancante nei cookie!`);
    return null;
  }

  try {
    const res = await fetch(`http://localhost/noty/backend/src/document.php?id=${id}`, {
      method: 'GET',
      headers: {
        'Cookie': `token=${token}`,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const text = await res.text();
    console.log(`2. Risposta HTTP Status:`, res.status);
    console.log(`3. Testo crudo dal PHP:`, text);

    if (!res.ok) return null;

    const json = JSON.parse(text);
    return json.data || null; 

  } catch (error) {
    console.error("ERRORE CRITICO in getSingleDocument:", error);
    return null;
  }
}

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const documentId = resolvedParams.id;

  const document = await getSingleDocument(documentId);

  if (!document) {
    console.log(`4. Esito: Documento non trovato o array vuoto. Scatta il 404.`);
    notFound(); 
  }

  console.log(`4. Esito: Documento caricato con successo! Titolo:`, document.title);

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex h-14 items-center gap-4 border-b px-6 bg-card">
        <Link href="/home" className="text-muted-foreground hover:text-foreground transition">
          &larr; Torna indietro
        </Link>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            Ultima modifica: {new Date(document.updated_at).toLocaleString('it-IT')}
          </p>
        </div>
      </header>
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-bold mb-8 outline-none">{document.title}</h1>
        <div className="text-lg whitespace-pre-wrap outline-none">
          {document.content || "Inizia a scrivere qui..."}
        </div>
      </main>
    </div>
  );
}