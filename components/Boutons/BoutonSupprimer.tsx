import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

function BoutonSupprimer() {
  return (
    <Button variant="destructive">
      <Trash className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
      Supprimer
    </Button>
  );
}

export { BoutonSupprimer };
