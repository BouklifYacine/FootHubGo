"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useCallUpPlayer } from "../hooks/useCallUpPlayer";

interface Props {
  injured: boolean;
  playerId: string;
  eventId: string; 
  teamId: string | undefined;
  isCalled : boolean    

}

function CallUpButton({ injured, playerId, eventId, teamId, isCalled }: Props) {
  const { mutate, isPending } = useCallUpPlayer();

  const SendCallUp = () => {
    if (!teamId || !eventId) return;
    
    mutate({ eventId, playerId, teamId });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={SendCallUp}
          variant="outline"
          disabled={injured || isPending || isCalled}
          className="cursor-pointer hover:opacity-80 border border-gray-400 rounded-lg"
        >
          <Send />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Envoyez une convocation au joueur</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default CallUpButton;
