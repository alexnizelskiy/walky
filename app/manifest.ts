import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — выгул и передержка собак`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    lang: "ru",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: siteConfig.themeColor,
    categories: ["lifestyle", "pets", "utilities"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Заказать выгул",
        short_name: "Заказать",
        url: "/order",
      },
      {
        name: "Кабинет питомца",
        short_name: "Кабинет",
        url: "/cabinet",
      },
    ],
  };
}
