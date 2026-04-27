'use client';

import { Folder } from 'lucide-react';
import router from 'next/dist/shared/lib/router/router';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle } from './ui/card';

type FolderType = {
  id: string | number;
  name: string;
  updated_at?: string;
};

export function FolderList({ folders }: { folders: FolderType[] }) {

    const router = useRouter();
    
    function handleOpening(folderId: string | number): void {
        router.push(`/editor/${folderId}`);
    }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {folders.map((f) => (
        <Card
          key={f.id}
          onDoubleClick={() => handleOpening(f.id)}
          className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-all group bg-card shadow-sm hover:shadow-md"
        >
          <CardHeader className="flex flex-col items-center space-y-0 pb-2">
            <Folder className="h-5 w-5 text-blue-500 fill-blue-500/20 shrink-0" />
            <CardTitle>
              <span className="font-medium truncate text-sm text-foreground">{f.name}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}