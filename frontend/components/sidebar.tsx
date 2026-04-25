"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Star, Settings, NotebookPen, Plus, Trash, Loader } from "lucide-react"

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
import { Button } from "./ui/button"
import { createDocumentAction } from "@/lib/actions/document-action"
import { useState } from "react"

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

  const handleCreate = async () => {
    try {
      setIsPending(true);

      const newDocId = await createDocumentAction();
      
      router.push(`/editor/${newDocId}`);
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
              <SidebarMenuButton 
                  onClick={handleCreate} 
                  disabled={isPending} 
                  className="w-full justify-start gap-2" 
                  variant="outline" 
                  size="default"
                >
                  {isPending ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {isPending ? 'Creazione...' : 'Nuovo Documento'}
                </SidebarMenuButton>
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