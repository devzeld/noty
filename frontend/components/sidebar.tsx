"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Clock, Star, Settings, NotebookPen, Plus, Trash } from "lucide-react"

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

const mainItems = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Recenti", url: "/home/recent", icon: Clock },
  { title: "Preferiti", url: "/home/favorite", icon: Star },
  { title: "Cestino", url: "/home/trash", icon: Trash },
]

export default function SidebarPage() {
  return (
    <div className="flex h-screen w-full">
      <HomeSidebar />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Contenuto Principale</h1>
        <p className="mt-2 text-gray-600">Seleziona un elemento dalla sidebar per visualizzare il contenuto.</p>
      </div>
    </div>
  )
}

export function HomeSidebar() {
  const pathname = usePathname()

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
                asChild 
                isActive={pathname.startsWith("/home/settings")}
                variant="outline"
                //tooltip="Crea Documento"
              >
                  <Link href="/editor/new">
                    <Plus />
                    <span>Crea Documento</span>
                  </Link>
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
                    //tooltip={item.title}
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
              //tooltip="Impostazioni"
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