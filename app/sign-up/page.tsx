import { AuthLayout } from "@/features/auth/components/auth-layout";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { redirectIfSignedIn } from "@/features/auth/server/page-guards";

export default async function SignUpPage() {
  await redirectIfSignedIn();
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
