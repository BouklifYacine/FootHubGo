"use client";

import { Button } from "@/components/ui/button";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export function BoutonCreerEvenement() {
  const router = useRouter();
  const { data } = useInfosClub();

  const estEntraineur = data?.role === "ENTRAINEUR";

  const handleClick = () => {
    router.push("/dashboardfoothub/evenements/creer");
  };

  if (!estEntraineur) return;

  return (
    <Button onClick={handleClick} className="flex items-center gap-2 mb-4">
      <Calendar size={16} />
      Créer un événement
    </Button>
  );
}
