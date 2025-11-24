import { Button } from "@/components/ui/button";

interface Props {
  onClick : () => void
  disabled : boolean,
  texte? : string
  icon? : React.ReactElement
  className? : string
}

function BoutonSupprimerTexte({onClick, disabled, texte, icon, className} : Props) {
  return (
    <Button 
      className={`bg-red-500 text-white hover:bg-red-600 cursor-pointer ${className || ''}`} 
      onClick={onClick} 
      disabled={disabled}
    >
    {texte}
    {icon}
    </Button>
  );
}


export { BoutonSupprimerTexte };
