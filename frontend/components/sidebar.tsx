"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Home, Star, Settings, NotebookPen, Plus, Trash, Loader, FolderPlus, StickyNote, Check } from "lucide-react"
import { useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "./ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { createDocumentAction } from "@/lib/actions/document-action"
import { createFolderAction, getFoldersAction } from "@/lib/actions/folder-action"

const mainItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Preferiti", url: "/home/favorite", icon: Star },
  { title: "Cestino", url: "/home/trash", icon: Trash },
]

export default function SidebarPage() {
  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Contenuto Principale</h1>
      </div>
    </div>
  )
}

export function HomeSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isPending, setIsPending] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creationType, setCreationType] = useState<'document' | 'folder' | null>(null);
  
  const [newItemName, setNewItemName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [availableFolders, setAvailableFolders] = useState<any[]>([]);

  const openCreationDialog = async (type: 'document' | 'folder') => {
    setCreationType(type);
    setNewItemName(type === 'document' ? "Nuovo Documento" : "Nuova Cartella");
    
    setSelectedFolderId(searchParams.get("folder_id"));
    setIsDialogOpen(true);

    setAvailableFolders([{ id: null, name: "Caricamento cartelle..." }]);

    try {
      const responseData = await getFoldersAction();
      
      let foldersArray = [];
      if (Array.isArray(responseData)) {
        foldersArray = responseData;
      } else if (responseData && typeof responseData === 'object') {
        foldersArray = responseData.data || responseData.folders || responseData.message || [];
      }
      
      if (!Array.isArray(foldersArray)) {
        foldersArray = [];
      }

      const formattedFolders = [
        { id: null, name: "Home (Radice)" },
        ...foldersArray.map((folder: any) => ({
          id: folder.id?.toString(),
          name: `${folder.name || folder.title || 'Senza nome'}` 
        }))
      ];
      
      setAvailableFolders(formattedFolders);
      
    } catch (error) {
      console.error("Errore nel recupero cartelle:", error);
      setAvailableFolders([{ id: null, name: "Home (Radice)" }]);
    }
  };

  const handleConfirmCreation = async () => {
    try {
      setIsPending(true);
      setIsDialogOpen(false); 

      if (creationType === 'document') {
        const newDocId = await createDocumentAction(newItemName, selectedFolderId);
        router.push(`/editor/${newDocId}`);
      } else if (creationType === 'folder') {
        const newFolderId = await createFolderAction(newItemName, selectedFolderId);
        router.push(`?folder_id=${newFolderId}`);
      }
    } catch (error) {
      console.error("Errore durante la creazione:", error);
      alert("Impossibile creare l'elemento. Riprova.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/home" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <NotebookPen className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl tracking-tight">Noty</span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
              <SidebarMenuItem>
                    {isPending ? (
                      <Loader className="h-4 w-4 animate-spin mx-auto my-2"/>
                    ) : (
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild className="w-full">
                          <SidebarMenuButton variant="outline" className="flex items-center w-full">
                            <Plus className="h-4 w-4" />
                            <span>Nuovo</span>
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-full">
                          <DropdownMenuItem onClick={() => openCreationDialog('document')} className="cursor-pointer">
                            <StickyNote className="mr-2 h-4 w-4" />
                            <span>Nuovo Documento</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openCreationDialog('folder')} className="cursor-pointer">
                            <FolderPlus className="mr-2 h-4 w-4" />
                            <span>Nuova Cartella</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/home/settings")} tooltip="Impostazioni">
                <Link href="/home/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent aria-describedby={undefined} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {creationType === 'document' ? 'Crea nuovo Documento' : 'Crea nuova Cartella'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input 
                value={newItemName} 
                onChange={(e) => setNewItemName(e.target.value)} 
                placeholder="Inserisci il nome..."
              />
            </div>

            <div className="space-y-2 mt-2">
              <label className="text-sm font-medium">Dove vuoi salvarlo?</label>
              <div className="border rounded-md max-h-[150px] overflow-y-auto p-1 space-y-1">
                {availableFolders.map((folder) => (
                  <button
                    key={folder.id || 'root'}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`flex items-center justify-between w-full p-2 text-sm rounded-sm transition-colors ${
                      selectedFolderId === folder.id ? 'bg-primary/10 font-medium' : 'hover:bg-muted'
                    }`}
                  >
                    <span>{folder.name}</span>
                    {selectedFolderId === folder.id && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annulla</Button>
            <Button onClick={handleConfirmCreation} disabled={!newItemName.trim()}>
              Crea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}