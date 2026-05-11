'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, StickyNote, Trash, RefreshCw, FolderInput, Folder, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'; 
import { Table, TableRow, TableCell, TableHeader, TableBody, TableHead} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { 
  deleteDocumentAction, 
  toggleFavoriteAction, 
  restoreDocumentAction, 
  hardDeleteDocumentAction,
  moveDocumentAction 
} from '@/lib/actions/document-action';
import { getAllFoldersAction } from '@/lib/actions/folder-action';
import { FolderTreeSelector } from './folder-tree-selector';

type Document = {
  id: string | number;
  title: string;
  favorite: number | boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export function DocumentList({ 
  documents, 
  currentView,
  isTrash = false
}: { 
  documents: Document[]; 
  currentView: string;
  isTrash?: boolean;
}) {
  const router = useRouter();

  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | number | null>(null);
  const [folders, setFolders] = useState([]);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  function handleOpening(docId: string | number): void {
    if(!isTrash) router.push(`/editor/${docId}`);
  }

  const openMoveDialog = async (e: React.MouseEvent, docId: string | number) => {
    e.stopPropagation();
    setSelectedDoc(docId);
    const data = await getAllFoldersAction();
    setFolders(data);
    setIsMoveOpen(true);
  };

  const handleConfirmMove = async () => {
    if (selectedDoc) {
      await moveDocumentAction(selectedDoc, targetFolderId);
      setIsMoveOpen(false);
      router.refresh();
    }
  };

  async function handleDelete(e: React.MouseEvent, id: string | number) {
    e.stopPropagation();
    if(confirm('Vuoi spostare questo documento nel cestino?')) {
      await deleteDocumentAction(id);
      router.refresh();
    }
  }

  async function handleFavorite(e: React.MouseEvent, id: string | number, currentFavorite: boolean) {
    e.stopPropagation();
    await toggleFavoriteAction(id, currentFavorite);
    router.refresh();
  }

  async function handleRestore(e: React.MouseEvent, id: string | number) {
    e.stopPropagation();
    await restoreDocumentAction(id);
    router.refresh();
  }

  async function handleHardDelete(e: React.MouseEvent, id: string | number) {
    e.stopPropagation();
    if(confirm('Attenzione: questa azione è irreversibile. Vuoi eliminare definitivamente questo documento?')) {
      await hardDeleteDocumentAction(id);
      router.refresh();
    }
  }

  return (
    <>
      <div>
        {currentView === 'list' ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Ultima modifica</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {documents.map((doc) => (
                <TableRow 
                  key={doc.id}
                  onDoubleClick={() => handleOpening(doc.id)}
                  className={isTrash ? "opacity-75" : "cursor-pointer"}
                >
                  <TableCell><span>{doc.title || 'Senza Titolo'}</span></TableCell>
                  <TableCell>
                    <span>{new Date(doc.updated_at).toLocaleString('it-IT', { day: 'numeric', month: 'long'})}</span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {isTrash ? (
                      <>
                        <button onClick={(e) => handleRestore(e, doc.id)} title="Ripristina" className="p-2 hover:bg-green-100 hover:text-green-600 rounded-full transition-colors">
                          <RefreshCw size={18} />
                        </button>
                        <button onClick={(e) => handleHardDelete(e, doc.id)} title="Elimina definitivamente" className="p-2 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors">
                          <Trash size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => openMoveDialog(e, doc.id)} title="Sposta" className="p-2 hover:bg-muted rounded-full transition-colors">
                          <FolderInput size={18} />
                        </button>
                        <button onClick={(e) => handleFavorite(e, doc.id, !!doc.favorite)} className="p-2 hover:bg-muted rounded-full transition-colors">
                          <Star className={doc.favorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"} size={18} />
                        </button>
                        <button onClick={(e) => handleDelete(e, doc.id)} className="p-2 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors">
                          <Trash size={18} />
                        </button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {documents.map((doc) => (
              <Card 
                key={doc.id}
                onDoubleClick={() => handleOpening(doc.id)}
                className={`flex flex-col p-3 border rounded-lg hover:bg-muted/50 transition-all group bg-card shadow-sm hover:shadow-md relative ${isTrash ? 'opacity-80' : 'cursor-pointer'}`}
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isTrash ? (
                      <>
                        <button onClick={(e) => handleRestore(e, doc.id)} title="Ripristina" className="p-1.5 hover:bg-green-100 hover:text-green-600 rounded-md">
                          <RefreshCw size={16} />
                        </button>
                        <button onClick={(e) => handleHardDelete(e, doc.id)} title="Elimina definitivamente" className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-md">
                          <Trash size={16} />
                        </button>
                      </>
                  ) : (
                      <>
                        <button onClick={(e) => openMoveDialog(e, doc.id)} title="Sposta" className="p-1.5 hover:bg-muted rounded-md">
                          <FolderInput size={16} />
                        </button>
                        <button onClick={(e) => handleFavorite(e, doc.id, !!doc.favorite)} className="p-1.5 hover:bg-muted rounded-md">
                          <Star className={doc.favorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"} size={16} />
                        </button>
                        <button onClick={(e) => handleDelete(e, doc.id)} className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-md">
                          <Trash size={16} />
                        </button>
                      </>
                  )}
                </div>
                <CardHeader className="flex flex-col items-center space-y-0 pb-2 mt-4">
                  <StickyNote className='h-8 w-8 text-blue-500 fill-blue-500/20 shrink-0 mb-2'/>
                  <CardTitle>
                    <span className='font-medium truncate text-medium text-foreground'>{doc.title || 'Senza Titolo'}</span>
                  </CardTitle>
                </CardHeader>
                <CardFooter className="flex items-center justify-center pt-2 mt-auto border-t">
                  <CardDescription className="text-xs text-muted-foreground">
                    Ultima modifica: {new Date(doc.updated_at).toLocaleString('it-IT', { day: 'numeric', month: 'short'})}
                  </CardDescription>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sposta Documento</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Seleziona cartella di destinazione</label>
            <div className="border rounded-md max-h-[300px] overflow-y-auto p-2">
              <div 
                onClick={() => setTargetFolderId(null)}
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${targetFolderId === null ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}
              >
                <Folder size={16} />
                <span className="text-sm">Home (Radice)</span>
                {targetFolderId === null && <Check size={14} className="ml-auto" />}
              </div>
              <FolderTreeSelector 
                folders={folders} 
                selectedId={targetFolderId} 
                onSelect={setTargetFolderId} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveOpen(false)}>Annulla</Button>
            <Button onClick={handleConfirmMove}>Sposta Qui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}