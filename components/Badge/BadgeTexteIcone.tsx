"use client";

import { Badge } from "../ui/badge";

interface Props {
  texte: number | string;
  icon?: React.ReactElement;
  classname? : string
  classnameBadge?: string
}

const BadgeTexteIcone = ({ texte, icon, classname, classnameBadge }: Props) => (
  <>
    <Badge className={`${classnameBadge}`}>
     <div className="flex items-center gap-1.5">
       <p className={`${classname}`}>  {texte} </p>  {icon}
     </div>
    </Badge>
  </>
);

export { BadgeTexteIcone };
