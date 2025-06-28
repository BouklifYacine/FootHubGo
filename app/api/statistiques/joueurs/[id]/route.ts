import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;

  const statsjoueur = await prisma.statistiqueJoueur.findMany({
    where: { userId: id },
  });

  if (!statsjoueur)
    return NextResponse.json({
      message: "Vous n'avez pas encore de stats",
    });

  const totalmatch = statsjoueur.length;
  const totalbuts = statsjoueur.reduce((sum, stats) => sum + stats.buts, 0);
  const totalpassedecisive = statsjoueur.reduce(
    (sum, stats) => sum + stats.passesdecisive,
    0
  );
  const totalcontribution = totalbuts + totalpassedecisive;
  const notetotal = statsjoueur.reduce((sum, stats) => sum + stats.note, 0);
  const notemoyenne = notetotal / totalmatch;
  const tempsjouer = statsjoueur.reduce(
    (sum, stats) => sum + stats.minutesJouees,
    0
  );
  const nombrematchtitulaire = statsjoueur.filter(
    (s) => s.titulaire === true
  ).length;
  const pourcentageTitulaire =
    nombrematchtitulaire > 0
      ? ((nombrematchtitulaire / totalmatch) * 100).toFixed(2)
      : 0;
  const pourcentagebutparmatch =
    totalbuts > 0 ? ((totalbuts / totalmatch) * 100).toFixed(2) : 0;
  const pourcentagepassedeciviseparmatch =
    totalpassedecisive > 0
      ? ((totalpassedecisive / totalmatch) * 100).toFixed(2)
      : 0;
  const GA90 =
    tempsjouer > 0 ? ((totalcontribution / tempsjouer) * 90).toFixed(2) : 0;
  const Buts90 =
    tempsjouer > 0 ? ((totalbuts / tempsjouer) * 90).toFixed(2) : 0;
  const PasseDecisives90 =
    tempsjouer > 0 ? ((totalpassedecisive / tempsjouer) * 90).toFixed(2) : 0;

  return NextResponse.json({
    statsjoueur: {
      totalmatch,
      totalbuts,
      totalpassedecisive,
      totalcontribution,
      notemoyenne,
      nombrematchtitulaire,
      pourcentageTitulaire,
      pourcentagebutparmatch,
      pourcentagepassedeciviseparmatch,
      GA90,
      Buts90,
      PasseDecisives90,
    },
  });
}
