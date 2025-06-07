import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface Props {
    texte : string
}

function BoutonRetourPage({texte} : Props) {
  return (
    <Button className="relative ps-12 cursor-pointer">
      {texte}
      <span className="pointer-events-none absolute inset-y-0 start-0 flex w-9 items-center justify-center bg-primary-foreground/15">
        <ChevronLeft className="opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
      </span>
    </Button>
  );
}

export { BoutonRetourPage };
