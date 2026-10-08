import type { Metadata } from "next";
import { MoreMenu } from "@/components/app-shell/more-menu";

export const metadata: Metadata = { title: "Plus" };

export default function MorePage() {
  return <MoreMenu />;
}
