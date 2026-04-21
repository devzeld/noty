'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 

  useEffect(() => {
    const refreshSession = async () => {
      try {
        // Usa 'localhost' per matchare il dominio del browser
        const response = await fetch('http://localhost/noty/backend/src/auth/refresh.php', { 
          method: 'POST',
          credentials: 'include', 
        });

        if (!response.ok) {
            console.warn("Refresh fallito: sessione probabilmente scaduta.");
        }
      } catch (error) {
        // Logghiamo l'errore reale per il debug
        console.error("Errore di rete nel refresh:", error);
      }
    };

    refreshSession();
  }, [pathname]);

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r bg-card p-4 hidden md:block">
        <h2 className="font-bold mb-4">Noty Menu</h2>
        {/* Qui i tuoi link della sidebar */}
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}