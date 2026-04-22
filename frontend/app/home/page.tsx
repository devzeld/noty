import { ViewToggle } from '@/components/view-toggle';
import { cookies } from 'next/headers';
import Link from 'next/link';

async function getDocuments(query: string = "") {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return [];

  try {
    const url = `http://localhost/noty/backend/src/document.php${query ? `?q=${encodeURIComponent(query)}` : ''}`;
    
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

export default async function HomePage({
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
        <div className=''><ViewToggle /></div>
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
        <>
          {currentView === 'list' ? (
            <div className="flex flex-col gap-2">
              {documents.map((doc: any) => (
                <Link
                  href={`/home/editor/${doc.id}`}
                  key={doc.id}
                  className="group flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors bg-card text-card-foreground shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <span className="text-xl opacity-80 group-hover:opacity-100 transition-opacity">
                      {doc.favorite ? '⭐' : '📄'}
                    </span>
                    <h2 className="font-semibold text-base truncate">
                      {doc.title || 'Senza Titolo'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-sm text-muted-foreground hidden md:block">
                      Modificato: {new Date(doc.updated_at).toLocaleDateString('it-IT')}
                    </p>
                    <span className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 transform duration-200">
                      Apri &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc: any) => (
                <div 
                  key={doc.id} 
                  className="border rounded-xl p-6 shadow-sm hover:shadow-md transition bg-card text-card-foreground flex flex-col justify-between h-48"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="font-semibold text-lg truncate pr-2">
                        {doc.title || 'Senza Titolo'}
                      </h2>
                      {!!doc.favorite && <span className="text-yellow-500">★</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Modificato il: {new Date(doc.updated_at).toLocaleDateString('it-IT')}
                    </p>
                  </div>

                  <Link
                    href={`/home/editor/${doc.id}`}
                    className="text-primary text-sm font-medium hover:underline inline-flex items-center mt-4"
                  >
                    Apri nell'editor &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}