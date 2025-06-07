"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useStatistiqueEquipe } from "../hooks/useStatistiqueEquipe";
import Loading from "@/features/statistiquejoueur/components/Skeletonstatsjoueurs";
import { authClient } from "@/lib/auth-client";

const RadarGraphEquipe = () => {
const { data: session } = authClient.useSession()
  const sessionID = session?.user?.id || "";
  const { data, isPending, error } = useStatistiqueEquipe(sessionID);

  if (isPending) return <Loading />;
  if (error || !data) return <div>Les données sont indisponibles</div>;

  // Normalisation des données pour le graphique radar
  // Nous normalisons les valeurs entre 0 et 100 pour une meilleure visualisation
  const normaliserValeur = (valeur: number, max: number) => 
    Math.min(Math.round((valeur / max) * 100), 100);

  // Pour les buts encaissés et défaites, une valeur plus basse est meilleure, donc on inverse la normalisation
  const normaliserValeurInverse = (valeur: number, max: number) => 
    normaliserValeur(max - Math.min(valeur, max), max);
  
  // Pourcentage de clean sheets et victoires
  const pourcentageCleanSheets = data.totalMatchs > 0 
    ? Math.round((data.cleanSheets / data.totalMatchs) * 100) 
    : 0;
  
  // Sélection des statistiques les plus importantes pour une équipe de football
  const radarData = [
    {
      subject: "Taux de victoire",
      A: normaliserValeur(data.tauxVictoire, 100),
      fullMark: 100,
      valeurReelle: `${data.tauxVictoire}%`,
      importance: "haute",
    },
    {
      subject: "Efficacité offensive",
      A: normaliserValeur(data.moyenneButsMarques * 33.3, 100),
      fullMark: 100,
      valeurReelle: `${data.moyenneButsMarques.toFixed(2)} buts/match`,
      importance: "haute",
    },
    {
      subject: "Solidité défensive",
      A: normaliserValeurInverse(data.moyenneButsEncaisses * 33.3, 100),
      fullMark: 100,
      valeurReelle: `${data.moyenneButsEncaisses.toFixed(2)} buts/match`,
      importance: "haute",
    },
    {
      subject: "Clean Sheets",
      A: normaliserValeur(pourcentageCleanSheets, 100),
      fullMark: 100,
      valeurReelle: `${data.cleanSheets} (${pourcentageCleanSheets}%)`,
      importance: "haute",
    },
    {
      subject: "Différence de buts",
      A: normaliserValeur(data.differenceDeButsGlobale + 30, 60),
      fullMark: 100,
      valeurReelle: `${data.differenceDeButsGlobale > 0 ? '+' : ''}${data.differenceDeButsGlobale}`,
      importance: "haute",
    },
    {
      subject: "Points/match",
      A: normaliserValeur((data.points / (data.totalMatchs || 1)) * 33.3, 100),
      fullMark: 100,
      valeurReelle: (data.points / (data.totalMatchs || 1)).toFixed(2),
      importance: "haute",
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-300 rounded-2xl shadow-sm p-4 mt-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
        Indicateurs clés de performance
      </h3>
      <div className="w-full h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            <Radar
              name="Performance"
              dataKey="A"
              stroke="#10B981" // vert-500
              fill="#10B981"
              fillOpacity={0.6}
            />
            <Tooltip 
              formatter={(value, name, props) => {
                return [props.payload.valeurReelle, "Performance"];
              }} 
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RadarGraphEquipe; 