import { AuthLayout } from "@/features/auth/components/auth-layout";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { requireSignedOutPage } from "@/features/auth/server/page-guards";

export default async function SignUpPage() {
  await requireSignedOutPage();
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
