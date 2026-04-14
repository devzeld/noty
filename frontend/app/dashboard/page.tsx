"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Dashboard() {
  const router = useRouter()
  
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <p className="text-muted-foreground animate-pulse">Verifica credenziali in corso...</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center pb-6 border-b">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Button variant="destructive" onClick={logout}>
            Esci dall'account
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Profilo Utente</CardTitle>
            <CardDescription>
              Questi sono i dati che il backend ha estratto validando il tuo cookie HttpOnly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                <p className="text-lg font-semibold">{user.name || "Nessun nome inserito"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Indirizzo Email</p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">ID Utente</p>
                <p className="text-sm font-mono text-muted-foreground mt-1">{user.id}</p>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  )
}