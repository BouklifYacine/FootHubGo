
'use client' 

import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

interface Props {
    texte : string
    classnameButton : string
    classnameLoader:string
}

function BoutonDisabled({texte,classnameButton,classnameLoader} : Props) {
  return (
  
    <Button disabled className={classnameButton}>
      <LoaderCircle
        className={`${classnameLoader} animate-spin`} 
        aria-hidden="true"
      />
      {texte}
    </Button>
  );
}

export { BoutonDisabled };

