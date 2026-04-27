'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { HomeSidebar } from '@/components/sidebar';
import { TopSearch } from '@/components/search';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { TooltipProvider } from '@/components/ui/tooltip';

type UserProfile = {
  username: string;
  display_name: string;
  avatar_url: string;
  theme_preference: string;
  language: string;
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const pathname = usePathname(); 

  useEffect(() => {
    const refreshSession = async () => {
      try {
        const res = await fetch('http://localhost/noty/backend/src/auth/refresh.php', { 
          method: 'POST',
          credentials: 'include', 
        });
        if (!res.ok) console.warn("Refresh fallito: sessione probabilmente scaduta.");
      } catch (error) {
        console.error(error);
      }
    };

    const getProfile = async () => {
      try {
        const res = await fetch('http://localhost/noty/backend/src/profile.php', { 
          method: 'GET',
          credentials: 'include', 
        });
        
        if (!res.ok) throw new Error("Utente non autenticato");
        
        const json = await res.json();
        const data = json.data;

        setProfile({
          username: data.username,
          display_name: data.display_name,
          avatar_url: data.avatar_url,
          theme_preference: data.theme_preference,
          language: data.language
        });
      } catch (error) {
        console.error(error);
        setProfile(null);
      }
    };

    const initializeLayout = async () => {
      await refreshSession();
      await getProfile();
    };

    initializeLayout();

  }, [pathname]);

  return (
    <TooltipProvider>
      <SidebarProvider className="flex h-screen bg-background">
        <HomeSidebar/>
        
        <main className="flex-1 overflow-hidden flex flex-col bg-background">
          
          <header className='sticky top-0 z-10 flex h-14 justify-between items-center gap-4 border-b bg-background px-4'>
            
            <div className="flex items-center gap-2 lg:hidden">
               <SidebarTrigger variant="outline"/>
            </div>
            
            <div className="flex-1 max-w-md hidden md:block">
              <Suspense fallback={<div className="h-9 w-full bg-muted/50 rounded-md animate-pulse"></div>}>
                <TopSearch/>
              </Suspense>
            </div>
    
            <Link className="ml-auto" href="/home/profile">
              <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src={profile?.avatar_url} alt="User avatar" />
                <AvatarFallback>
                  {profile?.username ? profile.username[0].toUpperCase() : 'U'}
                </AvatarFallback>
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