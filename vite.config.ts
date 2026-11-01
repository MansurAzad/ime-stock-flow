// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      // Offline support: generated SW only (never hand-written). Registration is
      // done solely by the guarded wrapper in src/lib/pwa-register.ts.
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        devOptions: { enabled: false },
        filename: "sw.js",
        manifest: {
          name: "প্রোডাক্ট ডিস্ট্রিবিউশন ম্যানেজমেন্ট — FIROZA ENTERPRISE",
          short_name: "FIROZA ENT.",
          description: "FIROZA ENTERPRISE — KONABARI, GAZIPUR. Product distribution and accounts.",
          theme_color: "#1f6f78",
          background_color: "#f8f6f0",
          display: "standalone",
          start_url: "/",
          icons: [
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          // Only same-origin hashed build assets are precached (CacheFirst).
          globPatterns: ["**/*.{js,css,svg,png,ico,woff2}"],
          runtimeCaching: [
            {
              // HTML navigations: network first, cache fallback when offline; OAuth excluded.
              urlPattern: ({ request, url }: { request: Request; url: URL }) =>
                request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
              handler: "NetworkFirst",
              options: {
                cacheName: "pages",
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,
              handler: "CacheFirst",
              options: { cacheName: "fonts", expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 } },
            },
          ],
        },
      }),
    ],
  },
});
