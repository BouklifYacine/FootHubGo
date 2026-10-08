import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { requireSignedOutPage } from "@/features/auth/server/page-guards";
import { safeNextPath } from "@/features/auth/next-url";

export const metadata: Metadata = { title: "Inscription" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  // Invite links send people here with ?next=/join/CODE: they come back to it once signed in.
  const next = safeNextPath((await searchParams).next);
  await requireSignedOutPage(next);
  return (
    <AuthLayout>
      <SignUpForm next={next} />
    </AuthLayout>
  );
}
