import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import { requireUserWithClub } from "@/app/(middleware)/requireUserWithClub";
import CallUpCard from "@/features/CallUp/components/CallUpCard";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";

async function ConvocationPage() {
  const session = await MiddlewareUtilisateurNonConnecte();
  await requireUserWithClub();

  const DataRoleUser = await prisma.membreEquipe.findFirst({
    where: { userId: session?.user.id },
    select: { role: true },
  });

  if (DataRoleUser?.role !== "JOUEUR") redirect("/dashboardfoothub");

  return (
    <div>
      <h1 className="text-xl tracking-tighter">
        Convocations pour {session?.user.name}{" "}
      </h1>
      <CallUpCard></CallUpCard>
    </div>
  );
}

export default ConvocationPage;
