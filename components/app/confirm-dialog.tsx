"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

export type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  /** Label of the confirm button, e.g. "Supprimer" (default "Confirmer"). */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button, for irreversible actions (default true). */
  destructive?: boolean;
};

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

/**
 * Asks before a destructive action, instead of `window.confirm`:
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "Supprimer l'événement ?", confirmLabel: "Supprimer" })) remove.mutate(id);
 */
export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return confirm;
}

/** Mounted once in the root layout: renders the one confirmation dialog of the app. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<Confirm>((next) => {
    resolver.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  };

  const destructive = options?.destructive ?? true;
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={options !== null} onOpenChange={(open) => !open && settle(false)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{options?.title}</AlertDialogTitle>
            {options?.description ? (
              <AlertDialogDescription>{options.description}</AlertDialogDescription>
            ) : (
              <AlertDialogDescription className="sr-only">Confirme ou annule cette action.</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="mt-0">{options?.cancelLabel ?? "Annuler"}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: destructive ? "destructive" : "default" })}
              onClick={() => settle(true)}
            >
              {options?.confirmLabel ?? "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}
