"use client";

import { formatNumericDate } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { subscriptionPeriodLabels, toOptions, userRoleLabels } from "@/lib/enum-labels";
import type { UserRole } from "@/generated/prisma/browser";
import { useChangeUserRole, type AdminUser } from "../hooks/use-admin";

const roleOptions = toOptions(userRoleLabels);

export function UsersTable({
  users,
  selected,
  onSelectedChange,
}: {
  users: AdminUser[];
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
}) {
  const changeRole = useChangeUserRole();
  const allSelected = users.length > 0 && users.every((user) => selected.includes(user.id));

  const toggle = (id: string, checked: boolean) =>
    onSelectedChange(checked ? [...selected, id] : selected.filter((selectedId) => selectedId !== id));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectedChange(checked ? users.map((user) => user.id) : [])}
              />
            </TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead>Abonnement</TableHead>
            <TableHead>Rôle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Checkbox
                  checked={selected.includes(user.id)}
                  onCheckedChange={(checked) => toggle(user.id, checked === true)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={user.image ?? undefined} alt={user.name} />
                    <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {user.name}
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{formatNumericDate(user.createdAt)}</TableCell>
              <TableCell>
                <Badge variant={user.plan === "pro" ? "default" : "outline"}>
                  {user.plan === "pro" ? "Pro" : "Gratuit"}
                  {user.subscription && ` · ${subscriptionPeriodLabels[user.subscription.period]}`}
                </Badge>
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  disabled={changeRole.isPending}
                  onValueChange={(role) => changeRole.mutate({ userId: user.id, role: role as UserRole })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
