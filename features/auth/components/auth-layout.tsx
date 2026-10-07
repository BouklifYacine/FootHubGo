import type { ReactNode } from "react";
import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";

/** Centered page frame of the sign-in / sign-up / forgot-password pages. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          FootHubGo
        </Link>
        {children}
      </div>
    </div>
  );
}

export function TermsNotice({ action }: { action: string }) {
  return (
    <p className="text-muted-foreground text-center text-xs text-balance">
      En cliquant sur {action}, vous acceptez nos{" "}
      <a href="#" className="underline underline-offset-4 hover:text-primary">
        Conditions d&apos;utilisation
      </a>{" "}
      et notre{" "}
      <a href="#" className="underline underline-offset-4 hover:text-primary">
        Politique de confidentialité
      </a>
      .
    </p>
  );
}

export function OrSeparator() {
  return (
    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
      <span className="bg-card text-muted-foreground relative z-10 px-2">Ou continuer avec</span>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return <p className="text-destructive text-center text-sm">{message}</p>;
}
