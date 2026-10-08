import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLayout } from "@/features/auth/components/auth-layout";

// better-auth redirects here (`onAPIError.errorURL` in auth.ts) with `?error=<code>`.
const messages: Record<string, string> = {
  account_not_linked:
    "Un compte existe déjà avec cet email. Connecte-toi avec la méthode utilisée lors de ton inscription.",
  unable_to_create_user: "Impossible de créer ton compte. Réessaie plus tard.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthLayout>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-destructive">Erreur de connexion</CardTitle>
          <CardDescription>
            {(error && messages[error]) || "Une erreur est survenue lors de la connexion."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/sign-in">Retour à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
