import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function BoutonLogoPlus() {
  return (
    <Button className="rounded-full cursor-pointer" variant="outline" size="icon" aria-label="Add new item">
      <Plus size={16} strokeWidth={2} aria-hidden="true" />
    </Button>
  );
}

export { BoutonLogoPlus };
