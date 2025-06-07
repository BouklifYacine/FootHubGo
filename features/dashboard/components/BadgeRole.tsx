import { Badge } from '@/components/ui/badge';
import React from 'react';

interface BadgeRoleProps {
    utilisateur: {
      role: 'Admin' | 'utilisateur';  
    };
}

const BadgeRole = ({utilisateur} : BadgeRoleProps) => {
  return (
    <> 
    <Badge
    className={`${  utilisateur.role === "Admin" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200" }
    hover:bg-opacity-80 cursor-default font-medium px-2 py-1
  `}
  >
    {utilisateur.role.charAt(0).toUpperCase() +
      utilisateur.role.slice(1)}
  </Badge></>
  )
}

export default BadgeRole;