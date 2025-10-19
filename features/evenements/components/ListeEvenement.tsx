"use client";
import CardEvenement from "./CardEvenement";
import { BoutonCreerEvenement } from "./BoutonCreerEvenement";
import { useSupprimerEvenement } from "../hooks/useSupprimerEvenement";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { useEvenements } from "../hooks/useEvenements";
import FiltersEvents from "./FiltersEvents";

function ListeEvenement() {
  const { data, isLoading } = useEvenements();
  const { data: infosdata, isLoading: isLoadingInfosClub } = useInfosClub();
  const { mutate, isPending } = useSupprimerEvenement();

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <BoutonCreerEvenement></BoutonCreerEvenement>
        <FiltersEvents></FiltersEvents>
      </div>
      <div className="flex gap-7 flex-wrap items-center ">
        <CardEvenement
          data={data}
          infosdata={infosdata}
          isPending={isPending}
          mutate={mutate}
        ></CardEvenement>
      </div>
    </div>
  );
}

export default ListeEvenement;
