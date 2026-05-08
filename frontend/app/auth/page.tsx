'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NotebookPen, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    identifier: '',
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!isLogin) {
      if (formData.username.length < 3) return "L'username deve avere almeno 3 caratteri.";
      if (!/\S+@\S+\.\S+/.test(formData.email)) return "Inserisci un'email valida.";
    }
    if (formData.password.length < 8) return "La password deve avere almeno 8 caratteri.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const endpoint = isLogin ? 'login.php' : 'register.php';
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/${endpoint}`;

    const payload = isLogin 
      ? { identifier: formData.identifier, password: formData.password } 
      : { username: formData.username, email: formData.email, password: formData.password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Errore durante la richiesta');
      }

      if (isLogin) {
        router.replace('/home');
      } else {
        setSuccessMsg('Registrazione completata! Ora puoi accedere.');
        setIsLogin(true); 
        setFormData(prev => ({ ...prev, password: '' })); 
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/40 text-foreground">
      <header className="absolute top-0 w-full p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Torna alla Home</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-background rounded-xl shadow-lg border p-8 relative">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <NotebookPen className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">{isLogin ? 'Bentornato' : 'Crea un account'}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isLogin ? 'Inserisci le tue credenziali' : 'Inizia subito a prendere appunti'}
            </p>
          </div>

          {error && <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md text-sm mb-6 font-medium animate-in fade-in zoom-in duration-200">{error}</div>}
          {successMsg && <div className="bg-green-500/10 text-green-600 border border-green-500/20 p-3 rounded-md text-sm mb-6 font-medium dark:text-green-400">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Username o Email</label>
                <input
                  name="identifier" type="text" required disabled={loading}
                  value={formData.identifier} onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
                  placeholder="Username o email"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <input
                    name="username" type="text" required disabled={loading}
                    value={formData.username} onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
                    placeholder="Minimo 3 caratteri"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    name="email" type="email" required disabled={loading}
                    value={formData.email} onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
                    placeholder="nome@esempio.com"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  name="password" required disabled={loading}
                  type={showPassword ? "text" : "password"}
                  value={formData.password} onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
                  placeholder="Minimo 8 caratteri"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full mt-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Caricamento...</> : (isLogin ? 'Accedi' : 'Registrati')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{isLogin ? 'Non hai un account? ' : 'Hai già un account? '}</span>
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); setFormData({identifier:'', username:'', email:'', password:''}); }} 
              className="font-medium text-primary hover:underline"
            >
              {isLogin ? 'Registrati' : 'Accedi'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}