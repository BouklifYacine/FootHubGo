import type { NextConfig } from "next";

console.log("BUILD – DATABASE_URL:", process.env.DATABASE_URL);

const nextConfig: NextConfig = {
  serverExternalPackages: ["@node-rs/argon2"],
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
  },
  output: "standalone"
};

export default nextConfig;
