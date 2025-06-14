import { Button } from "@/components/ui/button";
import {  Trash2 } from "lucide-react";

interface Props {
  supprimer : () => void
  disabled : boolean
}

function BoutonSupprimer({supprimer, disabled} : Props) {
  return (
    <Button className="bg-red-500 text-white hover:bg-red-600 cursor-pointer" onClick={supprimer} disabled={disabled}>
      <Trash2
       className=" text-white "
        size={16}
        strokeWidth={2}
        aria-hidden="true"
      />
    </Button>
  );
}

export { BoutonSupprimer };
