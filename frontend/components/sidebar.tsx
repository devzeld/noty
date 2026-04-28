"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Star, Settings, NotebookPen, Plus, Trash, Loader, FolderPlus, StickyNote } from "lucide-react"

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
import { createDocumentAction } from "@/lib/actions/document-action"
import { useState } from "react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "./ui/dropdown-menu"
import { createFolderAction } from "@/lib/actions/folder-action"

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
  const pathname = usePathname()

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleCreateDocument = async () => {
    try {
      setIsPending(true);

      const newDocId = await createDocumentAction("Nuovo Documento");
      
      router.push(`/editor/${newDocId}`);
    } catch (error) {
      console.error("Errore durante la creazione:", error);
      alert("Impossibile creare il documento. Riprova.");
      setIsPending(false);
    }
  };

  const handleCreateFolder = async () => {
    try {
      setIsPending(true);

      const newFolderId = await createFolderAction("Nuova Cartella", "TODO");
      
      router.push(`?folder_id=${newFolderId}`);
    } catch (error) {
      console.error("Errore durante la creazione:", error);
      alert("Impossibile creare il documento. Riprova.");
      setIsPending(false);
    }
  };

  return (
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
                    <Loader className="h-4 w-4 animate-spin"/>
                  ) : (
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild className="w-full">
                        <SidebarMenuButton variant="outline" className="flex items-center w-full">
                          <Plus className="h-4 w-4" />
                          <span>Nuovo</span>
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-full">
                        <DropdownMenuItem onClick={handleCreateDocument}>
                          <StickyNote className="mr-2 h-4 w-4" />
                          <span>Nuovo Documento</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCreateFolder}>
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
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
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
            <SidebarMenuButton 
              asChild 
              isActive={pathname.startsWith("/home/settings")}
              tooltip="Impostazioni"
            >
              <Link href="/home/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}