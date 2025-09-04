import React from 'react'
import { Badge } from '@/components/ui/badge'
import { StatistiqueJoueur } from '../interface-types/interfacetype'

interface Props {
    statsJoueurData: StatistiqueJoueur | undefined
}

function FullStatsPlayer({ statsJoueurData }: Props) {
    const stats = statsJoueurData?.statsjoueur

    if (!stats) {
        return <div>Aucune donnée disponible</div>
    }

    return (
        <div className="flex gap-10">
            {/* Première colonne */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.totalmatch ?? "-"}
                    </Badge>
                    <p className="tracking-tight">Total matchs</p>
                </div>

                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.totalbuts ?? "-"}
                    </Badge>
                    <p className="tracking-tight">Total buts</p>
                </div>

                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.totalpassedecisive ?? "-"}
                    </Badge>
                    <p className="tracking-tight">Passes décisives</p>
                </div>

                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.totalcontribution ?? "-"}
                    </Badge>
                    <p className="tracking-tight">GA</p>
                </div>

                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.notemoyenne ?? "-"}
                    </Badge>
                    <p className="tracking-tight">Note moyenne</p>
                </div>

                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.nombrematchtitulaire ?? "-"}
                    </Badge>
                    <p className="tracking-tight">Matchs titulaire</p>
                </div>
            </div>

            {/* Deuxième colonne */}
            <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.pourcentageTitulaire}%
                    </Badge>
                    <p className="tracking-tight"> Titulaire</p>
                </div>

                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.pourcentagebutparmatch ?? "-"}
                    </Badge>
                    <p className="tracking-tight"> Buts/match</p>
                </div>

                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.pourcentagepassedeciviseparmatch ?? "-"}
                    </Badge>
                    <p className="tracking-tight"> Passes déc./match</p>
                </div>

                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.GA90 ?? "-"}
                    </Badge>
                    <p className="tracking-tight">GA90</p>
                </div>

                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.Buts90 ?? "-"}
                    </Badge>
                    <p className="tracking-tight">Buts90</p>
                </div>

                <div className="flex gap-2 items-center">
                    <Badge className="bg-zinc-800 rounded-sm text-white text-sm w-12 h-6 flex items-center justify-center">
                        {stats.PasseDecisives90 ?? "-"}
                    </Badge>
                    <p className="tracking-tight">Passes90</p>
                </div>
            </div>
        </div>
    )
}

export default FullStatsPlayer