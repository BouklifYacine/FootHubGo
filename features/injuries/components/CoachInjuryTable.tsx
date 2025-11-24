"use client";

import { useClubInjuries } from "../hooks/UseGetClubInjuries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/fr";

dayjs.locale("fr");

export const CoachInjuryTable = ({ clubId }: { clubId: string }) => {
  const { data: players, isLoading } = useClubInjuries(clubId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Aucun joueur trouvé</h3>
          <p className="text-muted-foreground">
            Il n'y a pas encore de joueurs dans votre effectif.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            État de l'effectif
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{players.length}</span>
            <span>joueur{players.length > 1 ? "s" : ""}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-b">
                <TableHead className="w-[300px] h-12 font-semibold">
                  Joueur
                </TableHead>
                <TableHead className="h-12 font-semibold">Statut</TableHead>
                <TableHead className="h-12 font-semibold">
                  Détails Blessure
                </TableHead>
                <TableHead className="text-right h-12 font-semibold">
                  Total Blessures
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow
                  key={player.id}
                  className="hover:bg-muted/30 transition-colors border-b last:border-b-0"
                >
                  <TableCell className="font-medium py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-border/50">
                        <AvatarImage src={player.image || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {player.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-base">
                        {player.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {player.activeInjury ? (
                      <Badge
                        variant="destructive"
                        className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900 font-medium"
                      >
                        <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                        Blessé
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900 font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Apte
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-4">
                    {player.activeInjury ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-sm text-foreground">
                          {player.activeInjury.type}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="font-medium">Retour prévu:</span>
                          {dayjs(player.activeInjury.endDate).format(
                            "DD MMM YYYY"
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-3 rounded-md bg-muted font-semibold text-sm">
                      {player.totalInjuries}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
