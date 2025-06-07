'use client'

import { Card } from "@/components/ui/card"

import { Mail, User, CreditCard, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { authClient } from "@/lib/auth-client"
import { useProfil } from "../hooks/useProfil"
import { InfoCard } from "./InfoCard"
import { ProfilePictureUpload } from "./ProfilePictureUpload"

interface SectionProfilProps {
  userId: string
  
}

export function SectionProfil({ userId }: SectionProfilProps) {
  const { data: session } = authClient.useSession()
  const { data: userCompleteData, isLoading } = useProfil(userId)

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Chargement...</div>
      </div>
    )
  }

  if (!userCompleteData || !session?.user) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500">Aucune donnée disponible</div>
      </div>
    )
  }

  const estProviderExterne = userCompleteData.providerId.length > 0
  const premierProvider = userCompleteData.providerId[0] || ''

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card className="backdrop-blur-xs bg-white/90 dark:bg-gray-900/90 shadow-xl rounded-xl overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 h-32 bg-gradient-to-r from-purple-600 to-blue-600 opacity-90" />
          
          <div className="relative pt-16 px-6 pb-6">
            <div className="flex flex-col items-center text-center gap-6">
              {/* Remplacer l'Avatar par le composant ProfilePictureUpload */}
              <ProfilePictureUpload 
                userId={userId} 
                currentImage={userCompleteData.image || null} 
                userName={userCompleteData.pseudo ?? ""}
              />

              <div className="space-y-3">
                <h2 className="text-2xl font-bold">{userCompleteData.pseudo}</h2>
                {estProviderExterne && (
                  <Badge variant="outline" className="bg-white/90 dark:bg-gray-800/90">
                    <span className="flex items-center gap-1.5">
                      Connecté via {premierProvider}
                    </span>
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard
                icon={<Mail className="w-5 h-5" />}
                title="Email"
                content={userCompleteData.email ?? '-'}
              />

              <InfoCard
                icon={<User className="w-5 h-5" />}
                title="Pseudo"
                content={userCompleteData.pseudo ?? '-'}
              />

              <div className="md:col-span-2">
                <InfoCard
                  icon={<CreditCard className="w-5 h-5" />}
                  title="Abonnement"
                  content={
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge 
                          className={userCompleteData.plan === 'pro' 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          }
                        >
                          {userCompleteData.plan === 'pro' ? 'Premium' : 'Gratuit'}
                        </Badge>
                        {userCompleteData.abonnement && (
                          <Badge variant="outline">
                            {userCompleteData.abonnement.periode === 'mois' ? 'Mensuel' : 'Annuel'}
                          </Badge>
                        )}
                      </div>

                      {userCompleteData.abonnement && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>
                              Début: {new Date(userCompleteData.abonnement.datedebut).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>
                              Fin: {new Date(userCompleteData.abonnement.datefin).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  }
                  cardClassName="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
