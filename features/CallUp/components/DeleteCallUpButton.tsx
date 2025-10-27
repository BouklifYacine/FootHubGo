"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CircleX } from "lucide-react";
import { useDeleteCallUp } from "../hooks/useDeleteCallUp";
import { DeleteCallUpParams } from "../interfaces/DeleteCallUpInterface";

function DeleteCallUpButton({callUpId, eventId, teamId} : DeleteCallUpParams) {
      const { mutate, isPending } = useDeleteCallUp();

      const OnClickDeleteCallUp = () => {
        if(!callUpId) return 
         mutate({ callUpId, eventId, teamId })
      }
  return (
    <div> <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={OnClickDeleteCallUp}
          variant="outline"
          disabled={isPending}
          className="cursor-pointer hover:opacity-80 border border-gray-400 rounded-lg"
        >
         <CircleX />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Supprimer la convocation pour ce joueur</p>
      </TooltipContent>
    </Tooltip></div>
  )
}

export default DeleteCallUpButton