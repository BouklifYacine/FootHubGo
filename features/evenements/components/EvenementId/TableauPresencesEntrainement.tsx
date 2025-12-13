"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, XCircle, Clock } from "lucide-react";

interface PresencePlayer {
  idUtilisateur: string;
  nom: string;
  image?: string | null;
  poste?: string | null;
  statut: "ATTENTE" | "PRESENT" | "ABSENT";
}

interface Props {
  presences: PresencePlayer[] | undefined;
}

const presenceStatusConfig = {
  PRESENT: {
    label: "Présent",
    variant: "default" as const,
    className: "bg-green-500 hover:bg-green-600",
    icon: CheckCircle,
  },
  ABSENT: {
    label: "Absent",
    variant: "destructive" as const,
    className: "",
    icon: XCircle,
  },
  ATTENTE: {
    label: "En attente",
    variant: "secondary" as const,
    className: "",
    icon: Clock,
  },
};

function TableauPresencesEntrainement({ presences }: Props) {
  if (!presences || presences.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Aucune présence enregistrée pour cet entraînement.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const presentCount = presences.filter((p) => p.statut === "PRESENT").length;
  const absentCount = presences.filter((p) => p.statut === "ABSENT").length;
  const pendingCount = presences.filter((p) => p.statut === "ATTENTE").length;

  return (
    <div className="space-y-6 mt-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{presentCount}</p>
              <p className="text-xs text-muted-foreground">Présents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{absentCount}</p>
              <p className="text-xs text-muted-foreground">Absents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Liste des présences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joueur</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead className="text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presences.map((player) => {
                const config = presenceStatusConfig[player.statut];
                const Icon = config.icon;
                return (
                  <TableRow key={player.idUtilisateur}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={player.image ?? undefined}
                            alt={player.nom}
                          />
                          <AvatarFallback className="text-xs">
                            {player.nom?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{player.nom}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {player.poste || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={config.variant}
                        className={`${config.className} gap-1`}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default TableauPresencesEntrainement;
