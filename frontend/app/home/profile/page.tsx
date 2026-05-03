import { cookies } from 'next/headers';
import { ProfileForm } from '@/components/profile-form';

async function getInitialProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL}/profile.php`, {
      method: 'GET',
      headers: {
        'Cookie': `token=${token}`,
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (!res.ok) return null;

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Errore fetch profilo:", error);
    return null;
  }
}

export default async function Profile() {
  const profileData = await getInitialProfile();

  if (!profileData) {
    return (
      <div className="p-8 text-center text-muted-foreground mt-20">
        <p>Impossibile caricare il profilo.</p>
        <p className="text-sm">Assicurati di essere loggato e che il backend sia attivo.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profilo</h1>
        <p className="text-muted-foreground mt-2">Personalizza il tuo profilo personale.</p>
      </div>

      <ProfileForm initialData={profileData} />
    </div>
  );
}