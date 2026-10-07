"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CreditCard, Landmark, UserPlus, UserRound, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminUsersFilters } from "../schemas";
import { useAdminStats, useAdminUsers, useDeleteUsers } from "../hooks/use-admin";
import { UsersTable } from "./users-table";

type Toggle = { label: string; filter: Partial<AdminUsersFilters> };

const toggles: Toggle[] = [
  { label: "Abonnés", filter: { plan: "pro" } },
  { label: "Admin", filter: { role: "ADMIN" } },
  { label: "Abo mensuel", filter: { period: "MONTH" } },
  { label: "Abo annuel", filter: { period: "YEAR" } },
];

function StatCard({ icon: Icon, title, value }: { icon: LucideIcon; title: string; value: string | number }) {
  return (
    <Card className="flex-1">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="size-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsRow() {
  const { data: stats } = useAdminStats();
  if (!stats) return <Skeleton className="h-28 w-full" />;
  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <StatCard icon={Users} title="Utilisateurs" value={stats.totalUsers} />
      <StatCard icon={UserPlus} title="Abonnés" value={stats.proUsers} />
      <StatCard icon={Landmark} title="Revenus" value={`${stats.revenue}€`} />
      <StatCard icon={CreditCard} title="MRR" value={`${stats.mrr}€`} />
      <StatCard icon={UserRound} title="Revenus / utilisateur" value={`${stats.revenuePerUser}€`} />
    </div>
  );
}

export function AdminDashboard() {
  const [filters, setFilters] = useState<AdminUsersFilters>({ page: 0 });
  const [selected, setSelected] = useState<string[]>([]);
  const { data, isPending, error } = useAdminUsers(filters);
  const deleteUsers = useDeleteUsers(() => setSelected([]));

  const { page } = filters;
  const update = (patch: Partial<AdminUsersFilters>) => {
    setSelected([]);
    setFilters((current) => ({ ...current, page: 0, ...patch }));
  };
  const isActive = ({ filter }: Toggle) =>
    Object.entries(filter).every(([key, value]) => filters[key as keyof AdminUsersFilters] === value);

  return (
    <div className="container mx-auto flex flex-col gap-6">
      <StatsRow />

      <div className="flex flex-wrap justify-end gap-2">
        {toggles.map((toggle) => (
          <Button
            key={toggle.label}
            variant={isActive(toggle) ? "default" : "outline"}
            onClick={() =>
              update(
                Object.fromEntries(
                  Object.entries(toggle.filter).map(([key, value]) => [key, isActive(toggle) ? undefined : value]),
                ),
              )
            }
          >
            {toggle.label}
          </Button>
        ))}
        <Input
          className="w-52"
          placeholder="Pseudo"
          value={filters.search ?? ""}
          onChange={(e) => update({ search: e.target.value })}
        />
      </div>

      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <p className="text-destructive">{error.message}</p>
      ) : (
        <>
          <UsersTable users={data.users} selected={selected} onSelectedChange={setSelected} />
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="destructive"
              disabled={!selected.length || deleteUsers.isPending}
              onClick={() => confirm(`Supprimer définitivement ${selected.length} utilisateur(s) ?`) && deleteUsers.mutate(selected)}
            >
              {deleteUsers.isPending ? "Suppression..." : `Supprimer (${selected.length})`}
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setFilters({ ...filters, page: page - 1 })}>
                <ChevronLeft />
              </Button>
              <span>
                Page {page + 1} sur {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= data.totalPages - 1}
                onClick={() => setFilters({ ...filters, page: page + 1 })}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
