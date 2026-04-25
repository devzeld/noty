import { cookies } from 'next/headers';
import Link from 'next/link';
import { ViewToggle } from '@/components/view-toggle';
import { DocumentList } from '@/components/document-list';

async function getDocuments(query: string = "") {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return [];

  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/noty/backend/src/' }document.php${query ? `?q=${encodeURIComponent(query)}` : ''}`;
    
    const res = await fetch(url, {
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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  
  const searchQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : "";
  const currentView = typeof resolvedParams.view === 'string' ? resolvedParams.view : "grid";

  const documents = await getDocuments(searchQuery);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {searchQuery ? `Risultati per "${searchQuery}"` : 'I miei Documenti'}
        </h1>
        <div><ViewToggle /></div>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/20 border-dashed">
          {searchQuery ? (
            <>
              <p className="text-muted-foreground mb-4">Nessun risultato trovato per "{searchQuery}".</p>
              <Link href="/home" className="text-primary text-sm hover:underline">
                Torna a tutti i documenti
              </Link>
            </>
          ) : (
             <p className="text-muted-foreground">Non hai ancora nessun documento.</p>
          )}
        </div>
      ) : (
        <DocumentList documents={documents} currentView={currentView} />
      )}
    </div>
  );
}