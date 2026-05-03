'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { HomeSidebar } from '@/components/sidebar';
import { TopSearch } from '@/components/search';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, LogOut, User } from 'lucide-react';
import { logoutAction } from '@/lib/actions/auth-action';

type UserProfile = {
  username: string;
  display_name: string;
  avatar_url: string;
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isPending, setIsPending] = useState(false);
  const pathname = usePathname(); 

  useEffect(() => {
    const refreshSession = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh.php`, { 
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profile.php`, { 
          method: 'GET',
          credentials: 'include', 
        });
        
        if (!res.ok) throw new Error("Utente non autenticato");
        
        const json = await res.json();
        const data = json.data;

        setProfile({
          username: data.username,
          display_name: data.display_name,
          avatar_url: data.avatar_url
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

  const handleLogout = async () => {
      try {
        setIsPending(true);
        await logoutAction();
      } catch (error) {
        console.error("Errore durante il logout:", error);
        setIsPending(false);
      }
    };

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
    
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src={profile?.avatar_url} alt="User avatar" />
                <AvatarFallback>
                  {profile?.username ? profile.username[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">            
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/home/profile" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-950">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Esci</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </header>
    
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>

        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}

