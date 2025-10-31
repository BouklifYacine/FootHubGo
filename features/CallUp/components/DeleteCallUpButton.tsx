"use client";

import { useDeleteCallUp } from "../hooks/useDeleteCallUp";
import { DeleteCallUpParams } from "../interfaces/DeleteCallUpInterface";
import { DeleteButtonTooltip } from "@/components/Boutons/DeleteButtonTooltip";

function DeleteCallUpButton({ callUpId, eventId, teamId }: DeleteCallUpParams) {
  const { mutate, isPending } = useDeleteCallUp();

  const OnClickDeleteCallUp = () => {
    if (!callUpId) return;
    mutate({ callUpId, eventId, teamId });
  };
  return (
    <div>
      <DeleteButtonTooltip
        supprimer={OnClickDeleteCallUp}
        disabled={isPending}
        tooltip="Supprimer la convocation pour ce joueur"
      ></DeleteButtonTooltip>
    </div>
  );
}

export default DeleteCallUpButton;
