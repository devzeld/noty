'use client';

import { useState } from 'react';
import { Delete, Loader, Save, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ProfileData = {
  username: string;
  email: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
};

export function ProfileForm({ initialData }: { initialData: ProfileData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    display_name: initialData.display_name || "",
    avatar_url: initialData.avatar_url || "",
    bio: initialData.bio || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profile.php`, {
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

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
    setPassword('');
    setDeleteError(null);
  };

  const confirmDeleteAccount = async () => {
    if (!password) {
      setDeleteError("Inserisci la tua password per continuare.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/account.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }) 
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Errore durante l'eliminazione");
      }
      
      window.location.href = '/auth'; 
      
    } catch (error: any) {
      setDeleteError(error.message || "Impossibile eliminare l'account. Riprova più tardi.");
      setIsDeleting(false);
    }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Profilo Pubblico</CardTitle>
          <CardDescription>Informazioni visibili nell'app.</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-start mb-8 pb-8 border-b">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-24 h-24 border-2 border-primary/10">
                <AvatarImage src={formData.avatar_url} alt="Avatar" />
                <AvatarFallback className="text-2xl bg-primary/5 text-primary">
                  {initialData.username ? initialData.username[0].toUpperCase() : <UserIcon className="w-10 h-10" />}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground font-mono mt-2">@{initialData.username}</p>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="text-sm font-medium leading-none text-muted-foreground mb-2 block">Email</label>
                <input value={initialData.email} disabled className={`${inputClass} bg-muted/50`} />
              </div>
              <div>
                <label className="text-sm font-medium leading-none text-muted-foreground mb-2 block">Iscritto dal</label>
                <input value={new Date(initialData.created_at).toLocaleDateString('it-IT')} disabled className={`${inputClass} bg-muted/50`} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="display_name" className="text-sm font-medium leading-none">Nome visualizzato</label>
                <input 
                  id="display_name" name="display_name" type="text" 
                  value={formData.display_name} onChange={handleChange}
                  className={`${inputClass} mt-2`} required
                />
              </div>

              <div>
                <label htmlFor="avatar_url" className="text-sm font-medium leading-none">URL Avatar</label>
                <input 
                  id="avatar_url" name="avatar_url" type="url" 
                  value={formData.avatar_url} onChange={handleChange}
                  className={`${inputClass} mt-2`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="text-sm font-medium leading-none">Biografia</label>
              <textarea 
                id="bio" name="bio" rows={3}
                value={formData.bio} onChange={handleChange}
                placeholder="Racconta qualcosa di te..." 
                className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-2`}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                {message.text}
              </div>
            )}

            <div className='flex flex-col sm:flex-row w-full justify-between items-center gap-4 pt-4 border-t'>
              <Button type="button" variant="destructive" onClick={handleDeleteClick} disabled={isSaving}>
                 <Delete className="w-4 h-4 mr-2" />
                 Elimina Account
              </Button>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "Salvataggio..." : "Salva Profilo"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Elimina Account</DialogTitle>
            <DialogDescription>
              Questa azione è <strong>irreversibile</strong>. Tutti i tuoi documenti, cartelle e dati personali verranno eliminati permanentemente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Inserisci la tua password per confermare:</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="La tua password..."
              />
            </div>
            
            {deleteError && (
              <p className="text-sm text-destructive font-medium">{deleteError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAccount} disabled={isDeleting || !password}>
              {isDeleting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Delete className="w-4 h-4 mr-2" />}
              {isDeleting ? "Eliminazione in corso..." : "Conferma Eliminazione"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}