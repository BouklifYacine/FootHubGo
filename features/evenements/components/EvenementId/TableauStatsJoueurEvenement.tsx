"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import Image from "next/image";
import { CircleCheck, CircleX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import City from "@/public/Logo_Manchester_City_2016.svg";

// FAKE DATA
const membres = [
  {
    id: "1",
    user: {
      name: "Kylian Mbappé",
      image: City,
    },
    role: "JOUEUR",
    poste: "ATTAQUANT",
    isLicensed: true,
    joinedAt: "2022-08-15",
  },
  {
    id: "2",
    user: {
      name: "Lionel Messi",
      image: City,
    },
    role: "JOUEUR",
    poste: "MILIEU",
    isLicensed: false,
    joinedAt: "2023-01-10",
  },
  {
    id: "3",
    user: {
      name: "Didier Deschamps",
      image: "",
    },
    role: "ENTRAINEUR",
    poste: "",
    isLicensed: true,
    joinedAt: "2021-05-20",
  },
];

function TableauStatsJoueurEvenement() {
  return (
    <div className="overflow-x-auto mt-10">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell className="p-4">
              <Checkbox />
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Avatar
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Nom
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Rôle
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Poste
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Licencié
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Rejoins le
            </TableHeadCell>
            <TableHeadCell className="text-black dark:text-white">
              Actions
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          {membres.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="p-4">
                <Checkbox />
              </TableCell>
              <TableCell>
                {m.user.image ? (
                  <Image
                    src={m.user.image}
                    width={35}
                    height={35}
                    alt={m.user.name}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700">
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {m.user.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-black dark:text-white">
                {m.user.name}
              </TableCell>
              <TableCell className="text-black dark:text-white">
                {m.role}
              </TableCell>
              <TableCell className="text-black dark:text-white">
                {m.poste || "Sans poste"}
              </TableCell>
              <TableCell>
                <Badge
                  className={`rounded-md border text-md  ${
                    m.isLicensed
                      ? "border-emerald-800 bg-emerald-100 text-emerald-800"
                      : "border-red-800 bg-red-200 text-red-800"
                  }`}
                >
                  {m.isLicensed ? (
                    <CircleCheck size={16} className="mr-1" />
                  ) : (
                    <CircleX size={16} className="mr-1" />
                  )}
                  {m.isLicensed ? "Oui" : "Non"}
                </Badge>
              </TableCell>
              <TableCell className="text-black dark:text-white">
                {m.joinedAt
                  ? new Date(m.joinedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </TableCell>
              <TableCell>
                {/* Actions vides pour l'instant */}
                <span className="text-gray-400 text-xs">-</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default TableauStatsJoueurEvenement;