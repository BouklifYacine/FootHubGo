"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchJson, withQuery } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import type { Serialized } from "@/lib/types";
import { changeUserRole, deleteUsers } from "../actions";
import type { AdminUsersFilters } from "../schemas";
import type { getAdminStats, getAdminUsers } from "../server/queries";

export type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;
export type AdminUsersPage = Serialized<Awaited<ReturnType<typeof getAdminUsers>>>;
export type AdminUser = AdminUsersPage["users"][number];

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => fetchJson<AdminStats>("/api/admin/stats"),
  });
}

export function useAdminUsers(filters: AdminUsersFilters) {
  return useQuery({
    queryKey: queryKeys.admin.users(filters),
    queryFn: () => fetchJson<AdminUsersPage>(withQuery("/api/admin/users", filters)),
    placeholderData: keepPreviousData,
  });
}

export function useChangeUserRole() {
  return useActionMutation(changeUserRole, { invalidate: [queryKeys.admin.all] });
}

export function useDeleteUsers(onSuccess?: () => void) {
  return useActionMutation(deleteUsers, { invalidate: [queryKeys.admin.all], onSuccess });
}
