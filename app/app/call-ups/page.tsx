import { redirect } from "next/navigation";
import { requireTeamPage } from "@/features/auth/server/page-guards";
import { MyCallUps } from "@/features/call-ups/components/my-call-ups";

export default async function CallUpsPage() {
  const { user, membership } = await requireTeamPage();
  if (membership.role !== "PLAYER") redirect("/app");

  return (
    <div>
      <h1 className="text-xl tracking-tighter">Convocations de {user.name}</h1>
      <MyCallUps />
    </div>
  );
}
