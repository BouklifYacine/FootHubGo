import type { NextConfig } from "next";

console.log("BUILD – DATABASE_URL:", process.env.DATABASE_URL);


const nextConfig: NextConfig = {
  
  serverExternalPackages: ["@node-rs/argon2"],
  images: {
    domains: ['avatars.githubusercontent.com', "boilerplategogo.s3.auto.amazonaws.com", "boilerplategogo.fly.storage.tigris.dev", 'github.com', 'lh3.googleusercontent.com', "sportal.fr", "icdn.empireofthekop.com","i.eurosport.com","cdn.vox-cdn.com","yop.l-frii.com","assets.goal.com", "t3.storage.dev", "fly.storage.tigris.dev"],
  },
  output : "standalone"
};

export default nextConfig;
