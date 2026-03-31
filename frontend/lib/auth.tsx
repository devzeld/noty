"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost/noty/backend/src";

type User = { id: number; username: string; email: string };

type AuthCtx = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);   // true finché non verifichiamo il cookie
  const router = useRouter();

  // Al mount (e ad ogni refresh) verifica se il cookie è ancora valido
  useEffect(() => {
    async function rehydrate() {
      try {
        const res = await fetch(`${API}/auth/me.php`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(data.token);
        }
      } finally {
        setLoading(false);
      }
    }
    rehydrate();
  }, []);

  async function login(loginVal: string, password: string): Promise<string | null> {
    const res = await fetch(`${API}/auth/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: loginVal, password }),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Errore sconosciuto";

    setUser(data.user);
    setToken(data.token);
    return null;  // null = nessun errore
  }

  function logout() {
    // Chiama un endpoint di logout se vuoi invalidare la sessione lato DB
    fetch(`${API}/auth/logout.php`, { method: "POST", credentials: "include" });
    setUser(null);
    setToken(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve essere usato dentro AuthProvider");
  return ctx;
}