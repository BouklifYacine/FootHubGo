import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Props {
    alt : string, 
    src : string, 
    Fallback : string , 
    badge : number

}

function AvatarBadgeChiffre({Fallback,alt,src, badge} : Props) {
  return (
    <div className="relative">
      <Avatar>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback>{Fallback}</AvatarFallback>
      </Avatar>
      <Badge className="absolute -top-1 left-full rounded-4xl min-w-4 -translate-x-4 border-background px-1">
        {badge}
      </Badge>
    </div>
  );
}

export { AvatarBadgeChiffre };
