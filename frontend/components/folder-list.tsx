'use client';

import { Folder, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from './ui/card';
import { deleteFolderAction } from '@/lib/actions/folder-action';

type FolderType = {
  id: string | number;
  name: string;
  updated_at?: string;
};

export function FolderList({ folders }: { folders: FolderType[] }) {
  const router = useRouter();
  
  function handleOpening(folderId: string | number): void {
      router.push(`?folder_id=${folderId}`);
  }

  async function handleDelete(e: React.MouseEvent, id: string | number) {
    e.stopPropagation();
    if(confirm('Vuoi eliminare questa cartella? I documenti al suo interno non verranno eliminati.')) {
      await deleteFolderAction(id);
      router.refresh();
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {folders.map((f) => (
        <Card
          key={f.id}
          onDoubleClick={() => handleOpening(f.id)}
          className="flex flex-col p-3 border rounded-lg hover:bg-muted/50 transition-all group bg-card shadow-sm hover:shadow-md cursor-pointer relative"
        >
          <button 
            onClick={(e) => handleDelete(e, f.id)} 
            className="absolute top-1 right-1 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 rounded-md transition-all"
          >
            <Trash2 size={14} />
          </button>
          <CardHeader className="flex flex-col items-center space-y-0 pb-2">
            <Folder className="h-6 w-6 text-blue-500 fill-blue-500/20 shrink-0 mb-1" />
            <CardTitle>
              <span className="font-medium truncate text-sm text-foreground">{f.name}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}