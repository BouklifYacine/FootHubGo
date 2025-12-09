import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface Props {
    alt : string, 
    src : string, 
    Fallback? : string , 
    classname? : string

}

const AvatarSimple = ({Fallback,alt,src, classname} : Props) => {
  return (
    <>
      <div>
        <Avatar className={`${classname} "border border-purple-600 cursor-pointer hover:scale-125 transition-transform"`}>
          <AvatarImage
            src={src}
            alt={alt}
          />
          <AvatarFallback>{Fallback}</AvatarFallback>
        </Avatar>
      </div>
    </>
  );
};

export default AvatarSimple;
