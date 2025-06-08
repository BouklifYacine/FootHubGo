import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma";
import FormulaireUpdateEvenement from "@/app/dashboardclient/evenements/(components)/FormulaireUpdateEvenement";

interface PageProps {
  params: {
    id: string;
    idevenement: string;
  };
}

export default async function ModifierEvenementPage({ params }: PageProps) {
  const { id: equipeId, idevenement: evenementId } = params;
  
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  
  // Vérification que l'utilisateur est bien un entraîneur de l'équipe
  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: {
      userId: session.user.id,
      equipeId,
      role: "ENTRAINEUR", // Seuls les entraîneurs peuvent modifier les événements
    },
    include: {
      equipe: {
        select: {
          nom: true,
        },
      },
    },
  });
  
  if (!membreEquipe) {
    redirect(`/dashboardclient/equipe/${equipeId}/evenements`);
  }
  
  // Récupération de l'événement à modifier
  const evenement = await prisma.evenement.findUnique({
    where: {
      id: evenementId,
      equipeId,
    },
  });
  
  if (!evenement) {
    redirect(`/dashboardclient/equipe/${equipeId}/evenements`);
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Modifier l&apos;événement pour {membreEquipe.equipe.nom}
        </h1>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <FormulaireUpdateEvenement 
          equipeId={equipeId}
          evenementId={evenementId}
          evenement={evenement}
        />
      </div>
    </div>
  );
} 