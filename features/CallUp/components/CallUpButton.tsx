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
  eventId: string | undefined;
}

function CallUpButton({ injured, playerId, eventId }: Props) {
  const { mutate, isPending } = useCallUpPlayer();

  const SendCallUp = () => {
    if (!eventId) return;

    mutate({ eventId, playerId });
  };
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={SendCallUp}
            variant="outline"
            disabled={injured || isPending || !eventId}
            className="cursor-pointer hover:opacity-80 border border-gray-400 d rounded-lg"
          >
            <Send />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Envoyez une convocation au joueur</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
}

export default CallUpButton;
