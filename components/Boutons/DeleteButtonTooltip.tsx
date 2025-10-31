import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";

interface Props {
  supprimer : () => void
  disabled : boolean
  tooltip?: string; 
}

function DeleteButtonTooltip({ supprimer, disabled, tooltip }: Props) {
  const button = (
    <Button 
      className="bg-red-500 text-white hover:bg-red-600 cursor-pointer" 
      onClick={supprimer} 
      disabled={disabled}
    >
      <Trash2
        className="text-white"
        size={16}
        strokeWidth={2}
        aria-hidden="true"
      />
    </Button>
  );

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {button}
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export { DeleteButtonTooltip };
