'use client';

import { useRouter } from 'next/navigation';
import { Star, StickyNote } from 'lucide-react';
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
    <div className="">
      {currentView === 'list' ? (
        <Table className="">
          <TableHeader>
            <TableRow className="">
              <TableHead>Tipo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Preferito</TableHead>
              <TableHead>Ultima modifica</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
          {documents.map((doc) => {
            return (
              <TableRow 
                key={doc.id}
                onDoubleClick={() => handleOpening(doc.id)}
                className=""
              >
                <TableCell>
                  <StickyNote className="text-blue-500 fill-blue-500/20"/>
                </TableCell>
                <TableCell>
                  <div className="">
                    <span className="">
                      {doc.title || 'Senza Titolo'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {doc.favorite ? (
                    <Star />
                  ) : (
                    <Star className="text-muted-foreground" />
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