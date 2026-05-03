import { cookies } from 'next/headers';
import { PreferencesForm } from '@/components/preferences-form'; // Adatta il percorso se necessario

async function getInitialSettings() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL}/settings.php`, {
      method: 'GET',
      headers: {
        'Cookie': `token=${token}`,
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (!res.ok) return null;

    const json = await res.json();

    return json.data || json; 
  } catch (error) {
    console.error("Errore fetch impostazioni:", error);
    return null;
  }
}

export default async function Settings() {
  const settingsData = await getInitialSettings();

  if (!settingsData) {
    return (
      <div className="p-8 text-center text-muted-foreground mt-20">
        <p>Impossibile caricare le impostazioni.</p>
        <p className="text-sm">Assicurati di essere loggato e che il backend sia attivo.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Impostazioni</h1>
        <p className="text-muted-foreground mt-2">Personalizza l'interfaccia e le notifiche di Noty.</p>
      </div>
      
      <PreferencesForm initialData={settingsData} />
    </div>
  );
}