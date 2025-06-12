import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface Props {
  supprimer : () => void
  disabled? : boolean
}

function BoutonSupprimer({supprimer, disabled} : Props) {
  return (
    <Button variant="destructive" onClick={supprimer} disabled={disabled}>
      <Trash
        className=" opacity-60"
        size={16}
        strokeWidth={2}
        aria-hidden="true"
      />
    </Button>
  );
}

export { BoutonSupprimer };
