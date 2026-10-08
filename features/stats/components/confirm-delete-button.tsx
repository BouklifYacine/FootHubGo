"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { useConfirm } from "@/components/app/confirm-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  onConfirm: () => void;
  disabled?: boolean;
  /** Button content (an icon only by default). */
  children?: ReactNode;
};

/** A delete button that asks first (shared ConfirmDialog). */
export function ConfirmDeleteButton({ title, description, onConfirm, disabled, children }: Props) {
  const confirm = useConfirm();
  return (
    <Button
      variant={children ? "destructive" : "outline"}
      size={children ? "default" : "icon"}
      disabled={disabled}
      aria-label={title}
      onClick={async () => {
        if (await confirm({ title, description, confirmLabel: "Supprimer" })) onConfirm();
      }}
    >
      {children ?? <Trash2 className="text-destructive" aria-hidden="true" />}
    </Button>
  );
}
