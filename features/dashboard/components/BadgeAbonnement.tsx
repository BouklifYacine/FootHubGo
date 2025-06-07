import { Badge } from '@/components/ui/badge'
import React from 'react'

interface BadgeAbonnementProps {
  utilisateur: {
    plan: 'pro' | 'free';
  };
}

const BadgeAbonnement = ({utilisateur} : BadgeAbonnementProps) => {
  return (
    <> <Badge
    className={`
    ${
      utilisateur.plan === "pro"
        ? "bg-green-100 text-green-800 border-green-200"
        : "bg-red-100 text-red-800 border-red-200"
    }
    hover:bg-opacity-80 cursor-default font-medium px-2 py-1
  `}
  >
    {utilisateur.plan.charAt(0).toUpperCase() +
      utilisateur.plan.slice(1)}
  </Badge></>
  )
}

export default BadgeAbonnement