import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";

// Pas de output: "standalone" : l'app tourne via le serveur custom (server.ts + Socket.IO).
const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@node-rs/argon2"],
  // Avatars are uploaded through a server action (max 2 Mo, checked in features/settings/actions.ts).
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  async headers() {
    const dev = process.env.NODE_ENV !== "production";
    return [{ source: "/:path*", headers: securityHeaders({ dev, appUrl: process.env.NEXT_PUBLIC_URL }) }];
  },
  async redirects() {
    return [
      {
        source: "/dashboardfoothub/:path*",
        destination: "/app/:path*",
        permanent: true,
      },
      // Old French URLs (routes were renamed to English)
      ...[
        ["/connexion/motdepasseoublie/:path*", "/forgot-password/:path*"],
        ["/connexion", "/sign-in"],
        ["/inscription", "/sign-up"],
        ["/parametres/:path*", "/app/settings"],
        // Settings always use the session user: the old per-user URL is dropped.
        ["/settings/:id", "/app/settings"],
        ["/app/blessures", "/app/injuries"],
        ["/app/calendrier", "/app/events?view=calendar"],
        ["/app/convocations", "/app/events"],
        ["/app/effectif", "/app/squad"],
        ["/app/evenements/:path*", "/app/events/:path*"],
        ["/app/statistiques", "/app/stats"],
        ["/app/transfert", "/app/join-requests"],
      ].map(([source, destination]) => ({ source, destination, permanent: true })),
      // Lot 3 (UX): settings moved inside the app shell, Événements + Calendrier merged into the
      // Agenda (call-ups are answered there and on the event page), "Transfert" renamed.
      ...[
        ["/settings", "/app/settings"],
        ["/app/calendar", "/app/events?view=calendar"],
        ["/app/call-ups", "/app/events"],
        ["/app/transfers", "/app/join-requests"],
      ].map(([source, destination]) => ({ source, destination, permanent: false })),
    ];
  },
  // Only the hosts of real avatars: the image optimizer must not proxy arbitrary sites.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.fly.storage.tigris.dev" },
      { protocol: "https", hostname: "*.t3.storage.dev" },
      { protocol: "https", hostname: "boilerplategogo.s3.auto.amazonaws.com" },
    ],
  },
};

export default nextConfig;
