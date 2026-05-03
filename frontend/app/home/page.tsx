import { cookies } from 'next/headers';
import Link from 'next/link';
import { Suspense } from 'react';
import { ViewToggle } from '@/components/view-toggle';
import { DocumentList } from '@/components/document-list';
import { FolderList } from '@/components/folder-list';
import { ArrowLeft } from 'lucide-react';

async function getDirectoryContent(folderId: string | null, query: string = "") {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return { folders: [], documents: [] };

  const headers = { 'Cookie': `token=${token}`, 'Authorization': `Bearer ${token}` };

  try {
    if (query) {
      const res = await fetch(`${process.env.INTERNAL_API_URL }/document.php?q=${encodeURIComponent(query)}`, { headers, cache: 'no-store' });
      const json = await res.json();
      return { folders: [], documents: json.data || [] };
    }

    if (folderId) {
      const res = await fetch(`${process.env.INTERNAL_API_URL }/folder.php?id=${folderId}`, { headers, cache: 'no-store' });
      const json = await res.json();
      return {
        folders: json.data?.folders || [],
        documents: json.data?.documents || []
      };
    }
    
    const baseUrl = typeof window === 'undefined' 
      ? process.env.INTERNAL_API_URL 
      : process.env.NEXT_PUBLIC_API_BASE_URL;

    const [fRes, dRes] = await Promise.all([
      fetch(`${baseUrl}/folder.php`, { headers, cache: 'no-store' }),
      fetch(`${baseUrl}/document.php?folder_id=null`, { headers, cache: 'no-store' }) 
    ]);

    const fJson = await fRes.json();
    const dJson = await dRes.json();

    return {
      folders: fJson.data || [],
      documents: dJson.data || []
    };

  } catch (error) {
    console.error("Errore fetch dati:", error);
    return { folders: [], documents: [] };
  }
}

async function HomeContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const searchQuery = typeof resolvedParams.q === 'string' ? resolvedParams.q : "";
  const currentView = typeof resolvedParams.view === 'string' ? resolvedParams.view : "list";
  const folderId = typeof resolvedParams.folder_id === 'string' ? resolvedParams.folder_id : null;

  const { folders, documents } = await getDirectoryContent(folderId, searchQuery);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {folderId && !searchQuery && (
            <Link href="/home" className="p-2 border rounded-md hover:bg-muted transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {searchQuery ? `Risultati per "${searchQuery}"` : (folderId ? 'Contenuto Cartella' : 'I miei File')}
          </h1>
        </div>
        <div>
          <ViewToggle />
        </div>
      </div>

      {!searchQuery && folders.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Cartelle</h2>
          <FolderList folders={folders} />
        </div>
      )}

      <div>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Documenti</h2>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/20 border-dashed">
            <p className="text-muted-foreground">Nessun documento qui.</p>
          </div>
        ) : (
          <DocumentList documents={documents} currentView={currentView} />
        )}
      </div>
    </div>
  );
}

export default function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return (
    <div className="flex-1">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Caricamento esplora risorse...</div>}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}