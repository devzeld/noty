'use client';

import { useRouter } from 'next/navigation';
import { StickyNote } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card'; 
import { Table, TableRow, TableCell, TableHeader, TableBody, TableFooter, TableHead} from '@/components/ui/table';

type Document = {
  id: string | number;
  title: string;
  favorite: number | boolean;
  updated_at: string;
};

export function DocumentList({ 
  documents, 
  currentView 
}: { 
  documents: Document[]; 
  currentView: string;
}) {
  const router = useRouter();

  function handleOpening(docId: string | number): void {
    router.push(`/editor/${docId}`);
  }

  return (
    <div className="flex flex-col gap-4">
      {currentView === 'list' ? (
        <Table className="flex flex-col gap-2">
          <TableHeader>
            <TableRow className="flex flex-row justify-between">
              <TableHead>Tipo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Preferito</TableHead>
              <TableHead>Ultima modifica</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="flex flex-col gap-2">
          {documents.map((doc) => {
            return (
              <TableRow 
                key={doc.id}
                onDoubleClick={() => handleOpening(doc.id)}
                className={`group flex flex-row justify-between p-4 transition-all cursor-pointer shadow-sm hover:shadow`}
              >
                <TableCell>
                  <StickyNote className='h-5 w-5 text-blue-500 fill-blue-500/20 shrink-0'/>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4 overflow-hidden">
                    <span className="text-base truncate m-0 font-semibold">
                      {doc.title || 'Senza Titolo'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {doc.favorite ? (
                    <span className="text-sm text-yellow-500">Sì</span>
                  ) : (
                    <span className="text-sm text-red-500">No</span>
                  )}
                </TableCell>
                <TableCell>
                  <span>
                    Ultima modifica: {new Date(doc.updated_at).toLocaleString('it-IT', { day: 'numeric', month: 'long'})}
                  </span>
                </TableCell>
              </TableRow>
            
            );
          })}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {documents.map((doc) => {
            return (
              <Card 
                key={doc.id}
                onDoubleClick={() => handleOpening(doc.id)}
                className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all group bg-card shadow-sm hover:shadow-md"
              >
                <CardHeader className="flex flex-col items-center space-y-0 pb-2">
                  <StickyNote className='h-5 w-5 text-blue-500 fill-blue-500/20 shrink-0'/>
                  <CardTitle>
                    <span className='font-medium truncate text-medium text-foreground'>{doc.title || 'Senza Titolo'}</span>
                  </CardTitle>
                </CardHeader>
              
                <CardFooter className="flex items-center justify-center">
                  <CardDescription className="text-xs text-muted-foreground">
                    Ultima modifica: {new Date(doc.updated_at).toLocaleString('it-IT', { day: 'numeric', month: 'long'})}
                  </CardDescription>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}