import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;
  try {
    const equipe = await prisma.equipe.findUnique({
      where: { id },
      select: {
        statsEquipe: true,
      },
    });

    if (!equipe)
      return NextResponse.json(
        {
          message: "Aucune stats équipe trouvée",
        },
        { status: 400 }
      );

    const statsgenerale = equipe.statsEquipe;
    const totalmatch = equipe.statsEquipe.length;
    
    // Gestion division par zéro
    const DivisionparZero = (num: number, den: number) => 
      den > 0 ? Number((num / den).toFixed(2)) : 0;

    // Calculs de base
    const nombrevictoires = statsgenerale.filter((stat) => stat.resultatMatch === "VICTOIRE").length;
    const nombredefaites = statsgenerale.filter((s) => s.resultatMatch === "DEFAITE").length;
    const nombrenuls = statsgenerale.filter((stat) => stat.resultatMatch === "NUL").length;

    // Stats domicile
    const nombrevictoiredomicile = statsgenerale.filter((s) => s.resultatMatch === "VICTOIRE" && s.domicile === true).length;
    const nombredefaitedomicile = statsgenerale.filter((s) => s.resultatMatch === "DEFAITE" && s.domicile === true).length;
    const nombrenuldomicile = statsgenerale.filter((s) => s.domicile === true && s.resultatMatch === "NUL").length;
    const nombrematchdomicile = statsgenerale.filter((s) => s.domicile === true).length;
    
    // Stats extérieur
    const nombrematchexterieur = statsgenerale.filter((s) => !s.domicile).length;
    const nombrevictoireexterieur = statsgenerale.filter((s) => s.resultatMatch === "VICTOIRE" && !s.domicile).length;
    const nombrenulexterieur = statsgenerale.filter((s) => !s.domicile && s.resultatMatch === "NUL").length;

    // Buts et différences
    const butsMarques = statsgenerale.reduce((sum, stat) => sum + stat.butsMarques, 0);
    const butsEncaisses = statsgenerale.reduce((sum, stat) => sum + stat.butsEncaisses, 0);
    const differenceDeButsGlobale = butsMarques - butsEncaisses;
    
    const nombrebutsencaissedomicile = statsgenerale.filter((s) => s.domicile == true).reduce((sum, stats) => sum + stats.butsEncaisses, 0);
    const nombrebutsmarquerdomicile = statsgenerale.filter((s) => s.domicile == true).reduce((sum, stats) => sum + stats.butsMarques, 0);
    const diffbutsadomicile = nombrebutsmarquerdomicile - nombrebutsencaissedomicile;
    
    const nombrebutsencaisseexterieur = statsgenerale.filter((s) => !s.domicile).reduce((sum, stats) => sum + stats.butsEncaisses, 0);
    const nombrebutsmarquerexterieur = statsgenerale.filter((s) => !s.domicile).reduce((sum, stats) => sum + stats.butsMarques, 0);
    const diffbutsexterieur = nombrebutsmarquerexterieur - nombrebutsencaisseexterieur;

    // Points et clean sheets
    const points = nombrevictoires * 3 + nombrenuls;
    const nombreCleanSheet = statsgenerale.filter((c) => c.cleanSheet === true).length;

    // Pourcentages
    const tauxVictoire = DivisionparZero(nombrevictoires, totalmatch) * 100;
    const tauxVictoiresDomicile = DivisionparZero(nombrevictoiredomicile, nombrematchdomicile) * 100;
    const tauxCleanSheet = DivisionparZero(nombreCleanSheet, totalmatch) * 100;
    
    const moyennebutmarquerparmatch = DivisionparZero(butsMarques, totalmatch);
    const moyennebutencaisserparmatch = DivisionparZero(butsEncaisses, totalmatch);
    
    const moyennepointsdomicile = DivisionparZero(
      nombrevictoiredomicile * 3 + nombrenuldomicile, 
      nombrematchdomicile
    );
    
    const moyennepointsexterieur = DivisionparZero(
      nombrevictoireexterieur * 3 + nombrenulexterieur, 
      nombrematchexterieur
    );

    return NextResponse.json({
      totalMatch: totalmatch,
      totalVictoires: nombrevictoires,
      totalDefaites: nombredefaites,
      totalButsMarques: butsMarques,
      differenceButsGlobale: differenceDeButsGlobale,
      totalPoints: points,

      totalCleanSheets: nombreCleanSheet,
      tauxCleanSheet: tauxCleanSheet,
      moyenneButsEncaissesParMatch: moyennebutencaisserparmatch,

      moyenneButsMarquesParMatch: moyennebutmarquerparmatch,
      
      victoiresDomicile: nombrevictoiredomicile,
      defaitesDomicile: nombredefaitedomicile,
      differenceButsDomicile: diffbutsadomicile,
      tauxVictoiresDomicile: tauxVictoiresDomicile,
      moyennePointsDomicile: moyennepointsdomicile,
      
      differenceButsExterieur: diffbutsexterieur,
      moyennePointsExterieur: moyennepointsexterieur,
      tauxVictoire: tauxVictoire
    });
    
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du classement des équipes:",
      error
    );
    return NextResponse.json(
      { message: "Erreur serveur lors de la récupération du classement" },
      { status: 500 }
    );
  }
}