import { Button } from "@/components/ui/button";
import { Plus, Send } from "lucide-react";

interface Props {
    texte : string
}

function BoutonPersonnalisable({texte} : Props) {
  return (
    <Button variant="outline" className="aspect-square max-sm:p-0">
        <Send />
      {/* <Plus className="opacity-60 sm:-ms-1 sm:me-2" size={16} strokeWidth={2} aria-hidden="true" /> */}
      <span className="max-sm:sr-only">{texte}</span>
    </Button>
  );
}

export { BoutonPersonnalisable };


