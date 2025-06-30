"use client";

import { Button } from "@/components/ui/button";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { Calendar, CirclePlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function BoutonCreerStatsEquipe() {
//   const router = useRouter();
//   const { data } = useInfosClub();

//   const estEntraineur = data?.role === "ENTRAINEUR";

//   const handleClick = () => {
//     router.push("/dashboardfoothub/evenements/creer");
//   };

//   if (!estEntraineur) return;

  return (
    <Button className="flex items-center gap-2 mb-4">
      <CirclePlus size={16} />
      Ajouter Stats
    </Button>
  );
}
