import type { Metadata } from "next";
import { HomeDashboard } from "@/features/home/components/home-dashboard";

export const metadata: Metadata = { title: "Accueil" };

/** Signed-in check is done by app/app/layout.tsx. */
export default function HomePage() {
  return <HomeDashboard />;
}
