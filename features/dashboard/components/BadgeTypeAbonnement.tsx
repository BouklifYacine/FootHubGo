import { Badge } from '@/components/ui/badge'
import React from 'react'

interface BadgeTypeAbonnementProps {
    abonnement: 'mois' | 'année';
}

const BadgeTypeAbonnement = ({abonnement} : BadgeTypeAbonnementProps) => {
  return (
    <> <Badge
    className={`
    ${
        abonnement === "mois"
        ? "bg-green-100 text-green-800 border-green-200"
        : "bg-purple-600 text-white "
    }
    hover:bg-opacity-80 cursor-default font-medium px-2 py-1
  `}
  >
    {abonnement.charAt(0).toUpperCase() +
      abonnement.slice(1)}
  </Badge></>
  )
}

export default BadgeTypeAbonnement