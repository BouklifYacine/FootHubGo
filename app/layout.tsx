import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import QueryProvider from "./(providers)/QueryProvider";
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const dmSans = DM_Sans({
  subsets: ["latin"], 
  weight: ["400", "500", "700"], 

});

export const metadata: Metadata = {
  title: "Foothubgo",
  description: "Avec Foothubgo gérez votre club de football amateur de manière professionnelle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="relative" suppressHydrationWarning> 
      <body className={clsx(
        dmSans.className, 
        "antialiased " 
      )}>
        <QueryProvider>

        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        <Toaster position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}