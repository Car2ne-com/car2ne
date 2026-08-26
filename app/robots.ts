import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/siteConfig";

/*
 * Le aree sotto disallow sono comunque protette da autenticazione
 * (vedi proxy.ts): questo evita solo di sprecare crawl budget su
 * pagine che un crawler anonimo non potrebbe comunque vedere.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/admin",
        "/chat",
        "/profile",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verifica-email",
        "/verifica-eta",
        "/mfa-challenge",
        "/auth/",
        "/api/",
      ],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
