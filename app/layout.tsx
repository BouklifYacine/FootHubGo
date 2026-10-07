import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import QueryProvider from "./(providers)/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { NotificationListener } from "@/components/NotificationListener";
import { auth } from "@/auth";
import { headers } from "next/headers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "FootHubGo",
  description:
    "Avec FootHubGo, gérez votre club de football amateur de manière professionnelle",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <html lang="fr" className="relative" suppressHydrationWarning>
      <body className={clsx(dmSans.className, "antialiased ")}>
        <QueryProvider>
          <NotificationListener userId={session?.user?.id} />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
