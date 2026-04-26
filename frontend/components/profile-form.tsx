'use client';

import { useState } from 'react';
import { Loader, Save, User as UserIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ProfileData = {
  username: string;
  email: string;
  display_name: string;
  avatar_url: string;
  theme_preference: string;
  language: string;
  created_at: string;
};

export function ProfileForm({ initialData }: { initialData: ProfileData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    display_name: initialData.display_name || "",
    avatar_url: initialData.avatar_url || "",
    theme_preference: initialData.theme_preference || "light",
    language: initialData.language || "it",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('http://localhost/noty/backend/src/profile.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Errore durante il salvataggio");
      
      setMessage({ text: "Profilo aggiornato con successo!", type: 'success' });
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      setMessage({ text: "Impossibile aggiornare il profilo.", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Card className="max-w-2xl mx-auto mt-8 border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Impostazioni Profilo</CardTitle>
        <CardDescription>Gestisci le tue informazioni pubbliche e le preferenze dell'app.</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8 items-start mb-8 pb-8 border-b">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-24 h-24 border-2 border-primary/10">
              <AvatarImage src={formData.avatar_url} alt="Preview Avatar" />
              <AvatarFallback className="text-2xl bg-primary/5 text-primary">
                {initialData.username ? initialData.username[0].toUpperCase() : <UserIcon className="w-10 h-10" />}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground font-mono mt-2">@{initialData.username}</p>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="text-sm font-medium leading-none text-muted-foreground mb-2 block">Email (Non modificabile)</label>
              <input value={initialData.email} disabled className={`${inputClass} bg-muted/50`} />
            </div>
            <div>
              <label className="text-sm font-medium leading-none text-muted-foreground mb-2 block">Account creato il</label>
              <input value={new Date(initialData.created_at).toLocaleDateString('it-IT')} disabled className={`${inputClass} bg-muted/50`} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="display_name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nome visualizzato</label>
            <input 
              id="display_name" name="display_name" type="text" 
              value={formData.display_name} onChange={handleChange}
              placeholder="Il tuo nome" className={`${inputClass} mt-2`} required
            />
            <p className="text-[0.8rem] text-muted-foreground mt-1">Questo è il nome che apparirà nell'app.</p>
          </div>

          <div>
            <label htmlFor="avatar_url" className="text-sm font-medium leading-none">URL Avatar</label>
            <input 
              id="avatar_url" name="avatar_url" type="url" 
              value={formData.avatar_url} onChange={handleChange}
              placeholder="https://esempio.com/foto.jpg" className={`${inputClass} mt-2`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="theme_preference" className="text-sm font-medium leading-none">Tema</label>
              <select 
                id="theme_preference" name="theme_preference" 
                value={formData.theme_preference} onChange={handleChange}
                className={`${inputClass} mt-2`}
              >
                <option value="light">Chiaro</option>
                <option value="dark">Scuro</option>
                <option value="system">Sistema</option>
              </select>
            </div>

            <div>
              <label htmlFor="language" className="text-sm font-medium leading-none">Lingua</label>
              <select 
                id="language" name="language" 
                value={formData.language} onChange={handleChange}
                className={`${inputClass} mt-2`}
              >
                <option value="it">🇮🇹 Italiano</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? "Salvataggio..." : "Salva Modifiche"}
          </Button>
          
        </form>
      </CardContent>
    </Card>
  );
}