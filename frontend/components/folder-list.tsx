'use client';

import { useState } from 'react';
import { Folder, Trash2, FolderInput, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { deleteFolderAction, getAllFoldersAction, moveFolderAction } from '@/lib/actions/folder-action';
import { FolderTreeSelector } from './folder-tree-selector'; // Assicurati che il file creato prima sia in questa cartella

type FolderType = {
  id: string | number;
  name: string;
  updated_at?: string;
};

export function FolderList({ folders }: { folders: FolderType[] }) {
  const router = useRouter();

  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [selectedFolderToMove, setSelectedFolderToMove] = useState<string | number | null>(null);
  const [allFolders, setAllFolders] = useState([]);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  function handleOpening(folderId: string | number): void {
      router.push(`?folder_id=${folderId}`);
  }

  const openMoveDialog = async (e: React.MouseEvent, folderId: string | number) => {
    e.stopPropagation();
    setSelectedFolderToMove(folderId);
    try {
      const data = await getAllFoldersAction();

      setAllFolders(data.filter((f: any) => f.id.toString() !== folderId.toString()));
      setIsMoveOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmMove = async () => {
    if (selectedFolderToMove) {
      try {
        await moveFolderAction(selectedFolderToMove, targetFolderId);
        setIsMoveOpen(false);
        router.refresh();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  async function handleDelete(e: React.MouseEvent, id: string | number) {
    e.stopPropagation();
    if(confirm('Vuoi eliminare questa cartella? I documenti al suo interno non verranno eliminati.')) {
      await deleteFolderAction(id);
      router.refresh();
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {folders.map((f) => (
          <Card
            key={f.id}
            onDoubleClick={() => handleOpening(f.id)}
            className="flex flex-col p-3 border rounded-lg hover:bg-muted/50 transition-all group bg-card shadow-sm hover:shadow-md cursor-pointer relative"
          >
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={(e) => openMoveDialog(e, f.id)} 
                title="Sposta cartella"
                className="p-1.5 hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-foreground"
              >
                <FolderInput size={14} />
              </button>
              <button 
                onClick={(e) => handleDelete(e, f.id)} 
                className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-md transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            <CardHeader className="flex flex-col items-center space-y-0 pb-2">
              <Folder className="h-6 w-6 text-blue-500 fill-blue-500/20 shrink-0 mb-1" />
              <CardTitle>
                <span className="font-medium truncate text-sm text-foreground">{f.name}</span>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sposta Cartella</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Seleziona destinazione</label>
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
                folders={allFolders} 
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