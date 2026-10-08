import { AuthLayout } from "@/features/auth/components/auth-layout";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { requireSignedOutPage } from "@/features/auth/server/page-guards";
import { safeNextPath } from "@/features/auth/next-url";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  // Invite links send people here with ?next=/join/CODE: they come back to it once signed in.
  const next = safeNextPath((await searchParams).next);
  await requireSignedOutPage(next);
  return (
    <AuthLayout>
      <SignInForm next={next} />
    </AuthLayout>
  );
}
