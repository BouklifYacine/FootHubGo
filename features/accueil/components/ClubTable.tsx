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
import { ClubStats } from "@/features/club/services/club.service";
import Image from "next/image";
import TransferRequestToaClubButton from "@/features/requesttojoinclub/component/TransferRequestToaClubButton";

interface ClubTableProps {
  clubs: ClubStats[];
}

export function ClubTable({ clubs }: ClubTableProps) {
  if (clubs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-muted/10">
        <p className="text-muted-foreground text-lg font-medium">
          Aucun club trouvé
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Il n'y a actuellement aucun club inscrit sur la plateforme.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] font-bold text-center">#</TableHead>
            <TableHead className="font-bold">Club</TableHead>
            <TableHead className="font-bold text-center">Pts</TableHead>
            <TableHead className="font-bold text-center">MJ</TableHead>
            <TableHead className="font-bold text-center">V</TableHead>
            <TableHead className="font-bold text-center">N</TableHead>
            <TableHead className="font-bold text-center">D</TableHead>
            <TableHead className="font-bold text-center">BP</TableHead>
            <TableHead className="font-bold text-center">BC</TableHead>
            <TableHead className="font-bold text-center">Diff</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clubs.map((item, index) => (
            <TableRow key={item.equipe.id}>
              <TableCell className="text-center font-medium">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {item.equipe.logo ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src={item.equipe.logo}
                        alt={item.equipe.nom}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      {item.equipe.nom.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium">{item.equipe.nom}</span>
                </div>
              </TableCell>
              <TableCell className="text-center font-bold">
                {item.stats.points}
              </TableCell>
              <TableCell className="text-center">
                {item.stats.matchsJoues}
              </TableCell>
              <TableCell className="text-center text-green-600">
                {item.stats.victoires}
              </TableCell>
              <TableCell className="text-center text-gray-500">
                {item.stats.nuls}
              </TableCell>
              <TableCell className="text-center text-red-500">
                {item.stats.defaites}
              </TableCell>
              <TableCell className="text-center">
                {item.stats.butsMarques}
              </TableCell>
              <TableCell className="text-center">
                {item.stats.butsEncaisses}
              </TableCell>
              <TableCell className="text-center font-medium">
                {item.stats.differenceDeButsGlobale > 0 ? "+" : ""}
                {item.stats.differenceDeButsGlobale}
              </TableCell>
              <TableCell className="text-right">
                <TransferRequestToaClubButton TeamId={item.equipe.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
