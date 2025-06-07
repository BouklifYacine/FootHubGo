"use client";

import React, { useState } from "react";
// Header est maintenant dans le layout
import { TableauDeBordClient } from "./TableauDeBordClient";
import { useStats, useUtilisateurs } from "../hooks/UseDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const ComponentPage = () => {
  const [page, setPage] = useState(0);

  const {
    data: dataStats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useStats();

  const {
    data: dataUtilisateur,
    isLoading: isLoadingUtilisateur,
    error: utilisateurError,
  } = useUtilisateurs(page);

  if (isLoadingStats || isLoadingUtilisateur) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Skeleton pour les statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          
          {/* Skeleton pour le tableau */}
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          
          {/* Skeleton pour la pagination */}
          <div className="flex justify-center mt-4">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (statsError || utilisateurError || !dataStats || !dataUtilisateur) {
    return (
      <>
        <div className="flex justify-center items-center min-h-screen text-red-500">
          Une erreur est survenue lors du chargement des données
        </div>
      </>
    );
  }

  const utilisateurs = dataUtilisateur.data;
  const totalPages = dataUtilisateur.totalPages;
  const totalUtilisateurs = dataStats.data.users.total;
  const totalAbonnements = dataStats.data.users.pro;
  const statsAbonnements = {
    annuels: dataStats.data.abonnements.annuels,
    mensuels: dataStats.data.abonnements.mensuels,
  };
  const totalRevenus = Number(dataStats.data.abonnements.total.revenus);
  const MRR = Number(dataStats.data.abonnements.total.mrr);

  const RevenusParUtilisateurs = totalUtilisateurs > 0
    ? Number((totalRevenus / totalUtilisateurs).toFixed(2))
    : 0;

  const statistiques = {
    totalUtilisateurs,
    totalAbonnements,
    totalRevenus,
    statsAbonnements,
  };

  return (
    <>
      <TableauDeBordClient
        utilisateurs={utilisateurs}
        statistiques={statistiques}
        MRR={MRR}
        RevenusParUtilisateurs={RevenusParUtilisateurs}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
    </>
  );
};

export default ComponentPage;