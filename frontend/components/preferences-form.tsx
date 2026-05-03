'use client';

import { useState } from 'react';
import { Loader, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SettingsData = {
  theme_preference: string;
  language: string;
};

export function PreferencesForm({ initialData }: { initialData: SettingsData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    theme_preference: initialData.theme_preference || "light",
    language: initialData.language || "it",
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/settings.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Errore durante il salvataggio");
      
      setMessage({ text: "Preferenze aggiornate!", type: 'success' });
      setTimeout(() => setMessage(null), 4000);
    } catch (error) {
      setMessage({ text: "Impossibile aggiornare le preferenze.", type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Preferenze App</CardTitle>
        <CardDescription>Personalizza la tua esperienza su Noty.</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="theme_preference" className="text-sm font-medium leading-none">Tema dell'interfaccia</label>
              <select 
                id="theme_preference" name="theme_preference" 
                value={formData.theme_preference} onChange={handleChange}
                className={`${inputClass} mt-2`}
              >
                <option value="light">Chiaro</option>
                <option value="dark">Scuro</option>
                <option value="system">Usa impostazioni di sistema</option>
              </select>
            </div>

            <div>
              <label htmlFor="language" className="text-sm font-medium leading-none">Lingua</label>
              <select 
                id="language" name="language" 
                value={formData.language} onChange={handleChange}
                className={`${inputClass} mt-2`}
              >
                <option value="it">Italiano</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
              {message.text}
            </div>
          )}

          <div className='flex justify-end pt-4 border-t'>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? "Salvataggio..." : "Salva Preferenze"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}