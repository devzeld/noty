import { cookies } from "next/headers";

type DocumentData = {
    id: string | number;
    title: string;
    favorite: number | boolean;
    created_at: string;
    updated_at: string;
    content?: string;
};

async function getDocument(id: string): Promise<DocumentData> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return Promise.reject(new Error('No token found'));  

  const res = await fetch(`http://localhost/noty/backend/src/document.php?id=${id}`, {
    method: 'GET',
    headers: {
      'Cookie': `token=${token}`,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch document');
  const json = await res.json();
  return json.data;
}

export default async function EditNote({
    params,
  }: {
    params: Promise<{ id: string }>
  }) {
  const { id } = await params
  const document : DocumentData = await getDocument(id)

  console.log("Document fetched:", document);
 
  return (
    <div>
      <h1>{document.title}</h1>
      <p>{document.content}</p>
    </div>
  )
}