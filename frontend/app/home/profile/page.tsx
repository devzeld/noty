import { cookies } from "next/headers";

async function getUserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profile.php`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) {
    console.error("Errore nel recupero del profilo:", await response.text());
    return null;
  }
  const data = await response.json();
  return data;
}

export default function Profile() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Profilo utente</h1>
      <p className="text-gray-500">Questa sezione è in costruzione. Torna presto per gestire il tuo profilo!</p>
    </div>
  )
}

function getToken() {
  throw new Error("Function not implemented.");
}
