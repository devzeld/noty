type Document = {
    id: string | number;
    title: string;
    favorite: number | boolean;
    created_at: string;
    updated_at: string;
  };

async function getDocument(id : string) {

}

export default async function EditNote({
    params,
  }: {
    params: Promise<{ id: string }>
  }) {
  const { id } = await params
  const document : Document = await getDocument(id)
 
  return (
    <div>
      <h1>{document.title}</h1>
      <p>{document.content}</p>
    </div>
  )
}