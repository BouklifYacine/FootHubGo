import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

function BoutonSupprimer() {
  return (
    <Button variant="destructive">
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
