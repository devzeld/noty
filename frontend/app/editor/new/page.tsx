import { cookies } from "next/headers";

export async function createDocument(): Promise<any> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return Promise.reject(new Error('No token found'));  

  const res = await fetch(`http://localhost/noty/backend/src/document.php`, {
    method: 'POST',
    headers: {
      'Cookie': `token=${token}`,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store',
    body: JSON.stringify({ title: "Nuovo Documento", content: "" })
  });

  if (!res.ok) throw new Error('Failed to create document');

    const json = await res.json();
    return json.data;
}

export default async function NewDocumentPage() {
  const newDoc = await createDocument();
  if (!newDoc || !newDoc.id) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-500">Errore nella creazione del documento</h1>
        <p className="mt-4 text-muted-foreground">Si è verificato un errore durante la creazione del documento. Riprova più tardi.</p>
      </div>
   );
  }
}
