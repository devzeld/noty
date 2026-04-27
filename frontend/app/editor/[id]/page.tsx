import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, StarOff } from 'lucide-react';
import { EditorClient } from '@/components/editor-client';
import { Suspense } from 'react';

async function getSingleDocument(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

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

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null; 
  } catch (error) {
    return null;
  }
}

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const resolvedParams = await params;
  const document = await getSingleDocument(resolvedParams.id);

  if (!document) {
    notFound(); 
  }

  return (
    <Suspense fallback={<div className="p-8 text-center">Caricamento documento...</div>}>
      <div className="flex flex-col h-full bg-background overflow-hidden">
       <header className="flex h-14 items-center gap-4 border-b px-6 bg-card shrink-0">
         <Link href="/home" className="text-muted-foreground hover:text-foreground transition flex items-center gap-2 text-sm font-medium">
           <ArrowLeft className="h-4 w-4" />
           Indietro
         </Link>
         <div className="flex-1 flex justify-center">
           <p className="text-xs text-muted-foreground">
             Ultima modifica: {new Date(document.updated_at).toLocaleString('it-IT')}
           </p>
         </div>
       </header>
       <main className="flex-1 overflow-y-auto">
         <EditorClient initialDocument={document} />
       </main>
      </div>
    </Suspense>
  );
}