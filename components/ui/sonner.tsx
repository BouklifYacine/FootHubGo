"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/** App toasts: themed with the design tokens (HSL triplets, see app/globals.css). */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(var(--popover))",
          "--normal-border": "hsl(var(--border))",
          "--normal-text": "hsl(var(--popover-foreground))",
        } as React.CSSProperties
      }
      theme={theme as ToasterProps["theme"]}
      closeButton
      toastOptions={{
        closeButton: true,
        classNames: {
          description: "text-muted-foreground!",
          closeButton: "border-border! bg-popover! text-popover-foreground!",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
