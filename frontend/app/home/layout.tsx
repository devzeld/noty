'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { HomeSidebar } from '@/components/sidebar';

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
    <SidebarProvider className="flex h-screen bg-background">
      <HomeSidebar/>
      <main className="flex-1 overflow-y-auto">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}