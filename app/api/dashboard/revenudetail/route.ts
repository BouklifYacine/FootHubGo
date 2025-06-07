import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

interface StatsAbonnement {
  nombre: number;
  revenus: number;
}

interface StatsResponse {
  data: {
    users: {
      total: number;
      pro: number;
    };
    abonnements: {
      mensuels: StatsAbonnement;
      annuels: StatsAbonnement;
      total: {
        revenus: string;
        mrr: string;
      };
    };
  };
}

interface StatsAccumulator {
  mensuels: StatsAbonnement;
  annuels: StatsAbonnement;
}
interface AbonnementResult {
  periode: string;
  _count: {
    periode: number;
  };
}

const PRIX = {
  MENSUEL: 5,
  ANNUEL: 50.0,
} as const;

export async function GET(): Promise<
  NextResponse<StatsResponse | { error: string }>
> {
  try {
  const session = await auth.api.getSession({
    headers: await headers() 
})
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez etre connecter" },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (admin?.role !== "Admin") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const [totalUsers, totalPro, abonnements] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: "pro" } }),
      prisma.abonnement.groupBy({
        by: ["periode"],
        _count: { periode: true },
        where: { datefin: { gte: new Date() } },
      }),
    ]);

    const initialStats: StatsAccumulator = {
      mensuels: { nombre: 0, revenus: 0 },
      annuels: { nombre: 0, revenus: 0 },
    };

    const stats = abonnements.reduce(
      (acc: StatsAccumulator, abo: AbonnementResult) => {
        if (abo.periode === "mois") {
          acc.mensuels.nombre = abo._count.periode;
          acc.mensuels.revenus = parseFloat(
            (abo._count.periode * PRIX.MENSUEL).toFixed(2)
          );
        } else if (abo.periode === "année") {
          acc.annuels.nombre = abo._count.periode;
          acc.annuels.revenus = parseFloat(
            (abo._count.periode * PRIX.ANNUEL).toFixed(2)
          );
        }
        return acc;
      },
      initialStats
    );

    const totalRevenus = stats.mensuels.revenus + stats.annuels.revenus;
    const mrr =
      stats.mensuels.nombre * PRIX.MENSUEL +
      (stats.annuels.nombre * PRIX.ANNUEL) / 12;

    return NextResponse.json({
      data: {
        users: {
          total: totalUsers,
          pro: totalPro,
        },
        abonnements: {
          ...stats,
          total: {
            revenus: totalRevenus.toFixed(2),
            mrr: mrr.toFixed(2),
          },
        },
      },
    });
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul des statistiques" },
      { status: 500 }
    );
  }
}