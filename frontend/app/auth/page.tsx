'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NotebookPen, ArrowLeft, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [identifier, setIdentifier] = useState('')
  const [username, setUsername] = useState('')    
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')

    const endpoint = isLogin ? 'login.php' : 'register.php'
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/${endpoint}`

    const payload = isLogin 
      ? { identifier, password } 
      : { username, email, password }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify(payload),
      })

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Errore durante la richiesta');
      }

      if (isLogin) {
        router.refresh(); 
        router.push('/home'); 
      } else {
        setSuccessMsg('Registrazione completata! Ora puoi accedere.');
        setIsLogin(true); 
        setPassword(''); 
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/40 text-foreground">
      
      {/* Header Minimalista per tornare indietro */}
      <header className="absolute top-0 w-full p-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Torna alla Home</span>
        </Link>
      </header>

      {/* Contenitore Principale */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-background rounded-xl shadow-lg border p-8 relative overflow-hidden">
          
          {/* Logo Centrale */}
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <NotebookPen className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              {isLogin ? 'Bentornato' : 'Crea un account'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin 
                ? 'Inserisci le tue credenziali per accedere' 
                : 'Inizia subito a prendere appunti in modo intelligente'}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md text-sm mb-6 font-medium">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-500/10 text-green-600 border border-green-500/20 p-3 rounded-md text-sm mb-6 font-medium dark:text-green-400">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Username o Email
                </label>
                <input
                  type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors" 
                  placeholder="Inserisci username o email"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Username</label>
                  <input
                    type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors" 
                    placeholder="Il tuo nome utente"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Email</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors" 
                    placeholder="nome@esempio.com"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Password</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors" 
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Attendere...
                </>
              ) : (
                isLogin ? 'Accedi' : 'Registrati'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? 'Non hai un account? ' : 'Hai già un account? '}
            </span>
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }} 
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              {isLogin ? 'Registrati' : 'Accedi'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}