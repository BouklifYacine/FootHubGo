import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/prisma";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import FormulaireEvenements from "@/app/dashboardclient/evenements/(components)/FormulaireEvenement";

interface PropsID {
    params : {id : string}
}

export default async function NouvelEvenementPage({params} : PropsID) {
  const equipeId = await params.id;
  
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  
  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: {
      userId: session.user.id,
      equipeId,
      role: "ENTRAINEUR",
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
    redirect(`/dashboardclient/equipe/${equipeId}`);
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center mb-6">
        <Link href={`/dashboardclient/equipe/${equipeId}/evenements`}>
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour aux événements
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">
          Nouvel événement pour {membreEquipe.equipe.nom}
        </h1>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <FormulaireEvenements equipeId={equipeId} />
      </div>
    </div>
  );
}