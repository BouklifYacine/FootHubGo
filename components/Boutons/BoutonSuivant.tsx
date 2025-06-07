import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Props {
    texte : string
}

function BoutonSuivant({texte} : Props) {
  return (
    <Button className="relative pe-12 cursor-pointer">
       {texte}
      <span className="pointer-events-none absolute inset-y-0 end-0 flex w-9 items-center justify-center bg-primary-foreground/15">
        <ChevronRight className="opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
      </span>
    </Button>
  );
}

export { BoutonSuivant };
