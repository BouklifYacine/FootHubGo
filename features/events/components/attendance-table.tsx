import { CheckCircle, Clock, Users, XCircle } from "lucide-react";
import type { AttendanceStatus } from "@/generated/prisma/browser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { attendanceStatusLabels, playerPositionLabels } from "@/lib/enum-labels";
import type { EventDetail } from "../types";

const statusConfig = {
  PRESENT: { icon: CheckCircle, badge: "bg-green-500 text-white", tile: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400", title: "Présents" },
  ABSENT: { icon: XCircle, badge: "bg-red-500 text-white", tile: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400", title: "Absents" },
  PENDING: { icon: Clock, badge: "bg-secondary text-secondary-foreground", tile: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", title: "En attente" },
} satisfies Record<AttendanceStatus, unknown>;

/** Who said they will (not) come to a training. */
export function AttendanceTable({ attendances }: { attendances: EventDetail["attendances"] }) {
  if (attendances.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Users className="mb-4 size-12 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune présence enregistrée pour cet entraînement.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(statusConfig) as AttendanceStatus[]).map((status) => {
          const { icon: Icon, tile, title } = statusConfig[status];
          return (
            <Card key={status}>
              <CardContent className="flex items-center gap-3 pt-6">
                <div className={`rounded-full p-2 ${tile}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{attendances.filter((a) => a.status === status).length}</p>
                  <p className="text-xs text-muted-foreground">{title}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" /> Liste des présences
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
              {attendances.map((attendance) => {
                const { icon: Icon, badge } = statusConfig[attendance.status];
                return (
                  <TableRow key={attendance.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={attendance.image ?? undefined} alt={attendance.name} />
                          <AvatarFallback className="text-xs">{attendance.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{attendance.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {attendance.position ? playerPositionLabels[attendance.position] : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={`gap-1 ${badge}`}>
                        <Icon className="size-3" /> {attendanceStatusLabels[attendance.status]}
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
