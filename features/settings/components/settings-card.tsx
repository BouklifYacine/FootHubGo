import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SettingsCard({
  title,
  description,
  danger,
  children,
}: {
  title: string;
  description: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <Card className={cn(danger && "border-destructive")}>
      <CardHeader>
        <CardTitle className={cn("text-xl", danger && "text-destructive")}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
