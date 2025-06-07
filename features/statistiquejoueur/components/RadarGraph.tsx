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
} from "recharts";
import Loading from "./Skeletonstatsjoueurs";
import { useStatistiqueJoueur } from "../hooks/useStatistiquesjoueur";
import { authClient } from "@/lib/auth-client";


const RadarGraph = () => {
const { data: session } = authClient.useSession();
  const sessionID = session?.user?.id || "";
  const { data, isPending, error } = useStatistiqueJoueur(sessionID);

  if (isPending) return <Loading />;
  if (error || !data) return <div>Les données sont indisponibles</div>;

  // Normalisation des données pour le graphique radar
  // Nous normalisons les valeurs entre 0 et 100 pour une meilleure visualisation
  const normaliserValeur = (valeur: number, max: number) => 
    Math.min(Math.round((valeur / max) * 100), 100);

  // Valeurs maximales estimées pour chaque statistique
  const maxGAPar90 = 2; // Maximum estimé pour GA/90
  const maxButsPar90 = 1; // Maximum estimé pour buts/90
  const maxPassesPar90 = 1; // Maximum estimé pour passes/90
  const maxGA_Match = 3; // Maximum estimé pour GA/Match

  const radarData = [
    {
      subject: "GA/Match",
      A: normaliserValeur(parseFloat(data.GA_Match.toString()), maxGA_Match),
      fullMark: 100,
      valeurReelle: data.GA_Match,
    },
    {
      subject: "GA/90",
      A: normaliserValeur(parseFloat(data.GAPar90.toString()), maxGAPar90),
      fullMark: 100,
      valeurReelle: data.GAPar90,
    },
    {
      subject: "Buts/90",
      A: normaliserValeur(parseFloat(data.butsPar90.toString()), maxButsPar90),
      fullMark: 100,
      valeurReelle: data.butsPar90,
    },
    {
      subject: "Passes/90",
      A: normaliserValeur(parseFloat(data.passesPar90.toString()), maxPassesPar90),
      fullMark: 100,
      valeurReelle: data.passesPar90,
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-300 rounded-2xl shadow-sm p-4 mt-8">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
        Performance par 90 Minutes
      </h3>
      <div className="w-full h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Statistiques"
              dataKey="A"
              stroke="#10B981" // vert-500
              fill="#10B981"
              fillOpacity={0.6}
            />
            <Tooltip 
              formatter={(value, name, props) => {
                // Afficher la valeur réelle au lieu du pourcentage
                const unit = props.payload.subject.includes("90") ? "par 90 minutes" : "par match";
                return [`${props.payload.valeurReelle} ${unit}`, "Performance"];
              }} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-sm text-gray-500 mt-2">
        Mesures normalisées basées sur votre performance par 90 minutes de jeu
      </p>
    </div>
  );
};

export default RadarGraph; 