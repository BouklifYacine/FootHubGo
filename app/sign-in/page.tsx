import { AuthLayout } from "@/features/auth/components/auth-layout";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { redirectIfSignedIn } from "@/features/auth/server/page-guards";

export default async function SignInPage() {
  await redirectIfSignedIn();
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}
