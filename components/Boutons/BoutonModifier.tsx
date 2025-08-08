import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface Props {
    disabled : boolean, 
    modifier : () => void 
}

function BoutonModifier({disabled , modifier} : Props) {
  return (
    <Button disabled={disabled} onClick={modifier} className="rounded-full cursor-pointer text-white dark:text-black background-bg-red-500 " size='icon'>
      <Pencil size={10}  />
    </Button>
  );
}

export { BoutonModifier };
