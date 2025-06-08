

interface EquipeDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function EquipeDetailsPage({ params }: EquipeDetailsPageProps) {
  const { id } = await params;
  
  return (
        <MembreEquipe equipeId={id} />  
  );
}