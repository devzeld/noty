'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { HomeSidebar } from '@/components/sidebar';
import { ThemeSwitcher } from '@/components/theme-provider';
import { TopSearch } from '@/components/search';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 

  useEffect(() => {
    const refreshSession = async () => {
      try {
        const response = await fetch('http://localhost/noty/backend/src/auth/refresh.php', { 
          method: 'POST',
          credentials: 'include', 
        });

        if (!response.ok) {
            console.warn("Refresh fallito: sessione probabilmente scaduta.");
        }
      } catch (error) {
        console.error("Errore di rete nel refresh:", error);
      }
    };

    refreshSession();
  }, [pathname]);

  return (
    <TooltipProvider>
      <SidebarProvider className="flex h-screen bg-background">
        <HomeSidebar/>
        <main className="flex-1 overflow-hidden flex flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden justify-between">
            <SidebarTrigger variant="outline"/>
    
            <ThemeSwitcher/>
          </header>
    
          <header className='sticky top-0 z-10 flex h-14 justify-between items-center gap-4 border-b bg-background px-4'>
            <TopSearch/>
    
            <Link className="ml-auto" href="/home/profile">
              <Avatar className="cursor-pointer">
                <AvatarImage src="/avatars/01.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Link>
          </header>
    
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}