import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface Props {
  texte: string;
  placeholder : string
}

export function InputBouton({ texte , placeholder}: Props) {
  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input type="email" placeholder={placeholder} />
      <Button type="submit" variant="outline">
        {texte}
        <Send className="ml-1"/>
      </Button>
    </div>
  );
}
