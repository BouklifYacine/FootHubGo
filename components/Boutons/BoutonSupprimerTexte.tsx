import { Button } from "@/components/ui/button";

interface Props {
  onClick : () => void
  disabled : boolean,
  texte? : string
}

function BoutonSupprimerTexte({onClick, disabled, texte} : Props) {
  return (
    <Button className="bg-red-500 text-white hover:bg-red-600 cursor-pointer" onClick={onClick} disabled={disabled}>
    {texte}
    </Button>
  );
}

export { BoutonSupprimerTexte };
