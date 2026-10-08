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
  title: { default: "FootHubGo", template: "%s · FootHubGo" },
  description: "FootHubGo : matchs, entraînements, convocations et messages de ton club de foot amateur, sur ton téléphone.",
  applicationName: "FootHubGo",
  // iOS "Sur l'écran d'accueil": full screen app with its own icon and name.
  appleWebApp: { capable: true, title: "FootHubGo", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
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
