import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info, Trophy } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { PodiumRank } from '@/components/Badge/BadgePodium'
import { ClassementEquipeReponse } from '../types/StatsEquipestypes'

interface ClassementEquipeProps {
  data?: ClassementEquipeReponse;
  isLoading: boolean;
  erreurequipes: Error | null;
}

const ClassementEquipe: React.FC<ClassementEquipeProps> = ({ data, isLoading, erreurequipes }) => {

    if(erreurequipes){
        return (
          <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 flex items-center gap-2">
            <Info className="h-5 w-5" />
            <span>Erreur: {erreurequipes.message}</span>
          </div>
        );
      }
      
  return (
    <Card className="border-t-4 border-t-green-500 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-green-600" />
          <CardTitle>Classement des Équipes</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Classement officiel de la ligue
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="p-3 text-left font-medium">Pos</th>
                  <th className="p-3 text-left font-medium">Équipe</th>
                  <th className="p-3 text-right font-medium">MJ</th>
                  <th className="p-3 text-right font-medium">V</th>
                  <th className="p-3 text-right font-medium">N</th>
                  <th className="p-3 text-right font-medium">D</th>
                  <th className="p-3 text-right font-medium">BP</th>
                  <th className="p-3 text-right font-medium">BC</th>
                  <th className="p-3 text-right font-medium">Diff</th>
                  <th className="p-3 text-right font-medium bg-green-50 text-green-700">Pts</th>
                  <th className="p-3 text-center font-medium hidden md:table-cell">Forme</th>
                </tr>
              </thead>
              <tbody>
                {data?.classement.map((equipe, index) => (
                  <tr
                    key={equipe.equipe.id}
                    className={`
                      border-b hover:bg-green-50/40 transition-colors
                      ${index < 3 ? "bg-green-50/20" : ""}
                    `}
                  >
                    <td className="p-3">
                      <PodiumRank rank={index + 1} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {equipe.equipe.logo ? (
                          <div className="rounded-full border border-slate-200 p-1">
                            <Image
                              src={equipe.equipe.logo}
                              alt={equipe.equipe.nom}
                              width={28}
                              height={28}
                              className="h-7 w-7"
                            />
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium">
                            {equipe.equipe.nom.substring(0, 1)}
                          </div>
                        )}
                        <span className="font-medium">{equipe.equipe.nom}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {equipe.stats.matchsJoues}
                    </td>
                    <td className="p-3 text-right font-medium text-green-600">
                      {equipe.stats.victoires}
                    </td>
                    <td className="p-3 text-right font-medium text-amber-600">
                      {equipe.stats.nuls}
                    </td>
                    <td className="p-3 text-right font-medium text-red-600">
                      {equipe.stats.defaites}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {equipe.stats.butsMarques}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {equipe.stats.butsEncaisses}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {equipe.stats.differenceDeButsGlobale > 0 ? "+" : ""}
                      {equipe.stats.differenceDeButsGlobale}
                    </td>
                    <td className="p-3 text-right font-bold text-green-700 bg-green-50/50">
                      {equipe.stats.points}
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex justify-center gap-1">
                        {equipe.stats.formeRecente.map((resultat, i) => (
                          <div 
                            key={i} 
                            className={`
                              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                              ${resultat === "VICTOIRE" ? "bg-green-500" : 
                                resultat === "MATCH_NUL" ? "bg-amber-500" : "bg-red-500"}
                            `}
                          >
                            {resultat === "VICTOIRE" ? "V" : 
                             resultat === "MATCH_NUL" ? "N" : "D"}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ClassementEquipe