import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { headers } from "next/headers";
import { QueryProvider } from "@/components/providers/query-provider";
import { ConfirmProvider } from "@/components/app/confirm-dialog";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { RealtimeProvider } from "@/lib/realtime/realtime-provider";
import { auth } from "@/auth";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "FootHubGo",
  description: "Avec FootHubGo, gérez votre club de football amateur de manière professionnelle",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the app draw under the notch / home indicator: the shell pads with env(safe-area-inset-*).
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <html lang="fr" className="relative" suppressHydrationWarning>
      <body className={clsx(dmSans.className, "antialiased")}>
        <QueryProvider>
          <RealtimeProvider userId={session?.user?.id}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <ConfirmProvider>{children}</ConfirmProvider>
              <Toaster position="top-center" richColors />
            </ThemeProvider>
          </RealtimeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
