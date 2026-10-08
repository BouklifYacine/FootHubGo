import type { MetadataRoute } from "next";

/** Web app manifest (served at /manifest.webmanifest): installable app opening on the home. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "FootHubGo : ton club de foot",
    short_name: "FootHubGo",
    description: "Matchs, entraînements, convocations et messages de ton club de foot amateur.",
    lang: "fr",
    dir: "ltr",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // --background (light) of app/globals.css, like the theme-color meta of the root layout.
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["sports", "social"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Agenda", url: "/app/events", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Messages", url: "/app/chat", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
