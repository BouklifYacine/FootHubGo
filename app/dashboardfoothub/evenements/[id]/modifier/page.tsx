"use client";

import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import FormulaireModifierEvenement from "@/features/evenements/components/FormulaireModifierEvenement";
import { useGetEvenementUnique } from "@/features/evenements/hooks/useGetEvenementUnique";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function PageModifierEvenement() {
  const { data: session } = authClient.useSession();
  const { data, isPending: isLoadingClub } = useInfosClub();
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const { data: evenement, isLoading, error } = useGetEvenementUnique(id);

  if (session && (!session?.session.token || !session.user.id)) {
    router.push("/dashboardfoothub");
    return null;
  }

  if (!session || isLoadingClub || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  if (error || !evenement) {
    return (
      <div className="text-center p-10">
        <h1 className="text-xl font-bold">Erreur</h1>
        <p>L&apos;événement demandé n&apos;a pas pu être trouvé.</p>
      </div>
    );
  }

  const isCoach = data?.role === "ENTRAINEUR";
  if (!isCoach) {
    router.push("/dashboardfoothub/evenements");
    return null;
  }

  return <FormulaireModifierEvenement evenementInitial={evenement} id={id} />;
}
