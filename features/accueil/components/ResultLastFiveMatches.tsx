import React from "react";
import Logo from "@/public/Logo_Manchester_City_2016.svg";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { $Enums } from "@prisma/client";
import { RecentMatch } from "../interfaces/InterfaceApiAccueil";
import dayjs from "dayjs";
import 'dayjs/locale/fr';

dayjs.locale('fr');

interface Props {
    Role: $Enums.RoleEquipe;
    recentmatch: RecentMatch[] | undefined;
}

function ResultLastFiveMatches({ Role, recentmatch }: Props) {
    const IsAPlayer = Role === "JOUEUR";

    const getResultColor = (resultat: string) => {
        switch (resultat) {
            case "VICTOIRE":
                return "bg-emerald-400";
            case "DEFAITE":
                return "bg-red-500";
            case "NUL":
                return "bg-yellow-500";
            default:
                return "bg-gray-400";
        }
    };

    const getResultLetter = (resultat: string) => {
        switch (resultat) {
            case "VICTOIRE":
                return "V";
            case "DEFAITE":
                return "D";
            case "NUL":
                return "N";
            default:
                return "?";
        }
    };

  const prepareMatchesData = () => {
    const matches = [...(recentmatch || [])];
    
    while (matches.length < 5) {
        matches.push({
            id: `placeholder-${matches.length}`,
            dateDebut: "?",
            lieu: null,                    
            typeEvenement: "CHAMPIONNAT",  
            statEquipe: { 
                resultatMatch: "?",  
                adversaire: null,         
                butsMarques: null,           
                butsEncaisses: null        
            },
            statsJoueur: [{ note: null }]
        });
    }
    
    return matches;
};



    return (
        <div className="w-full max-w-4xl mx-auto rounded-2xl lg:rounded-3xl border border-gray-300 shadow-lg shadow-blue-600">
            <div className="flex justify-between items-center p-3 sm:p-4 lg:p-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-medium tracking-tighter">
                    Forme
                </h2>
                <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-lg sm:text-xl lg:text-2xl font-medium tracking-tighter">
                        Note Moyenne :
                    </span>
                    <span className="text-lg sm:text-xl lg:text-2xl rounded-lg font-medium tracking-tighter">
                        6.3
                    </span>
                </div>
            </div>

            <div className="px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
                <div className="flex flex-wrap justify-center sm:justify-between lg:justify-around gap-2 sm:gap-3 lg:gap-4">

                    {prepareMatchesData()?.map((match) => (
                        <div 
                            key={match.id}
                            className="flex flex-col items-center space-y-1 sm:space-y-2 p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]"
                        >
                            <div className="">
                                <Image 
                                    alt="Logo Club" 
                                    src={Logo} 
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300"
                                />
                            </div>
                            
                            <p className="text-xs sm:text-sm lg:text-base font-medium text-center">
                                  {match.dateDebut === "?" ? "?" : dayjs(match.dateDebut).format("D MMM")}
                            </p>
                            
                            <div className="flex items-center gap-1 sm:gap-2">
                                <Badge className={`${getResultColor(match.statEquipe.resultatMatch)} rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300`}>
                                    {getResultLetter(match.statEquipe.resultatMatch)}
                                </Badge>
                                {IsAPlayer && (
                                    <>
                                        <span className="text-white text-sm sm:text-lg lg:text-2xl opacity-60">|</span>
                                        <Badge className="bg-blue-500 rounded-full w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300">
                                            {match.statsJoueur?.[0]?.note || "?"}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}

export default ResultLastFiveMatches;
