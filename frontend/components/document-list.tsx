'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Star, Trash, X } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card'; 

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
  const [checkedNotes, setCheckedNotes] = useState<(string | number)[]>([]);

  const handleCheck = (docId: string | number) => {
      setCheckedNotes((prev) => {
          if (prev.includes(docId)) {
              return prev.filter((id) => id !== docId);
          } else {
              return [...prev, docId];
          }
      });
  };

  function handleToggleSelectAll(): void {
    if (checkedNotes.length === documents.length) {
        setCheckedNotes([]);
    } else {
        setCheckedNotes(documents.map((doc) => doc.id));
    }
  }

  function handleToggleDeselectAll(): void {
    setCheckedNotes([]);
  }

  function handleResetDeleteSelected(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setCheckedNotes([]);
    //TODO: Chiamata API per ripristinare i documenti eliminati selezionati
  }


  function handleDeleteSelected(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setCheckedNotes([]);
  }

  function handleOpening(docId: string | number): void {
    router.push(`/editor/${docId}`);
  }

  function handleToggleFavorite(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    alert(`Toggling favorite for document ID: ${checkedNotes.join(', ')}`);
  }

  return (
    <>
      {/* {!(checkedNotes.length > 0) && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between border animate-in fade-in slide-in-from-top-4">
          <div className="flex gap-2">
            {TODO: Filters}
          </div>
          <span className="text-sm font-medium">{checkedNotes.length} note selezionate</span>
        </div>
        ) 
      } */}

      {/* {checkedNotes.length > 0 && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between border animate-in fade-in slide-in-from-top-4">
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleDeleteSelected} size="icon">
              <X className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon">
              <Trash/>
            </Button>
            <Button variant="secondary" onClick={handleToggleFavorite} size="icon">
              <Star className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm font-medium">{checkedNotes.length} note selezionate</span>
        </div>
      )} */}

      {currentView === 'list' ? (
        <div className="flex flex-col gap-2">
          {documents.map((doc) => {
            const isSelected = checkedNotes.includes(doc.id);
            return (
              <Card
                key={doc.id}
                onClick={() => handleCheck(doc.id)}
                onDoubleClick={() => handleOpening(doc.id)}
                className={`group flex flex-row justify-between p-4 transition-all cursor-pointer shadow-sm hover:shadow ${
                  isSelected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <CardTitle className="text-base truncate m-0 font-semibold">
                    {doc.title || 'Senza Titolo'}
                  </CardTitle>
                  {!!doc.favorite && <span className="text-yellow-500">★</span>}
                </div>
                <div className="flex items-center gap-4">
                  <CardDescription className="hidden md:block m-0">
                    Ultima modifica: {new Date(doc.updated_at).toLocaleString('it-IT', { day: 'numeric', month: 'long'})}
                  </CardDescription>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {documents.map((doc) => {
            const isSelected = checkedNotes.includes(doc.id);
            return (
              <Card 
                key={doc.id} 
                onClick={() => handleCheck(doc.id)}
                onDoubleClick={() => handleOpening(doc.id)}
                className={`transition-all flex flex-col justify-between h-48 cursor-pointer shadow-sm hover:shadow-md ${
                  isSelected ? 'border-primary ring-2 ring-primary bg-primary/5' : ''
                }`}
              >
                <CardHeader className="flex flex-row items-start space-y-0 pb-2">
                  <CardTitle className="font-semibold text-lg truncate w-full text-left">
                    {doc.title || 'Senza Titolo'}
                  </CardTitle>
                  {!!doc.favorite && <span className="text-yellow-500 ml-2 text-xl drop-shadow-sm">★</span>}
                </CardHeader>

                <CardFooter className="text-xs text-muted-foreground pb-4 pt-0">
                  Ultima modifica: {new Date(doc.updated_at).toLocaleString('it-IT', { day: 'numeric', month: 'long'})}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}