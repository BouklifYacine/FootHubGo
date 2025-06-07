import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"

  interface Props {
    alt : string, 
    src : string, 
    Fallback : string , 
    span : string

}
  
  export default function AvatarOffline({Fallback,alt,src, span} : Props) {
    return (
      <div className="relative">
        <Avatar>
          <AvatarImage src={src} alt={alt} />
          <AvatarFallback>{Fallback}</AvatarFallback>
        </Avatar>
        <span className="border-background bg-muted-foreground absolute -end-0.5 -bottom-0.5 size-3 rounded-full border-2">
          <span className="sr-only">{span}</span>
        </span>
      </div>
    )
  }
  