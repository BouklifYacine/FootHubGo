import { redirect } from "next/navigation";
import { findMembership, getSession } from "@/lib/auth/session";
import { MyCallUps } from "@/features/call-ups/components/my-call-ups";

export default async function CallUpsPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const membership = await findMembership(session.user.id);
  if (membership?.role !== "PLAYER") redirect("/app");

  return (
    <div>
      <h1 className="text-xl tracking-tighter">Convocations de {session.user.name}</h1>
      <MyCallUps />
    </div>
  );
}
