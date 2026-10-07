import { z } from "zod";

export const ADMIN_PAGE_SIZE = 10;

/** Query string of `GET /api/admin/users` (all filters are applied server side). */
export const adminUsersFiltersSchema = z.object({
  page: z.coerce.number().int().min(0).catch(0),
  search: z.string().trim().max(50).optional(),
  plan: z.enum(["free", "pro"]).optional(),
  period: z.enum(["MONTH", "YEAR"]).optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

export type AdminUsersFilters = z.output<typeof adminUsersFiltersSchema>;

export const changeUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "USER"]),
});

export const deleteUsersSchema = z.array(z.string().min(1)).min(1, "Aucun utilisateur sélectionné").max(100);
