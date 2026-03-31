"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, token, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user]);

  if (loading) return <p>Caricamento...</p>;
  if (!user)   return null;

  return (
    <div>
      <p>Ciao, {user.username}</p>
      <button onClick={logout}>Logout</button>
      
    </div>
  )  
};