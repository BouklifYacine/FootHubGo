import type { NextConfig } from "next";

// Pas de output: "standalone" : l'app tourne via le serveur custom (server.ts + Socket.IO).
const nextConfig: NextConfig = {
  serverExternalPackages: ["@node-rs/argon2"],
  async redirects() {
    return [
      {
        source: "/dashboardfoothub/:path*",
        destination: "/app/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'boilerplategogo.s3.auto.amazonaws.com' },
      { protocol: 'https', hostname: 'boilerplategogo.fly.storage.tigris.dev' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'sportal.fr' },
      { protocol: 'https', hostname: 'icdn.empireofthekop.com' },
      { protocol: 'https', hostname: 'i.eurosport.com' },
      { protocol: 'https', hostname: 'cdn.vox-cdn.com' },
      { protocol: 'https', hostname: 'yop.l-frii.com' },
      { protocol: 'https', hostname: 'assets.goal.com' },
      { protocol: 'https', hostname: 't3.storage.dev' },
      { protocol: 'https', hostname: 'fly.storage.tigris.dev' }
    ],
  }
};

export default nextConfig;
