import type { Metadata } from "next";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { JoinCodeCard } from "@/features/team/components/join-invite";

export const metadata: Metadata = { title: "J'ai un code" };

/** "J'ai un code" (landing): type the code given by the coach, then follow the invite link. */
export default function JoinPage() {
  return (
    <AuthLayout>
      <JoinCodeCard />
    </AuthLayout>
  );
}
