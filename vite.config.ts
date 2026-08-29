import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        disable: isCapacitorBuild,
        registerType: 'autoUpdate',
        injectRegister: 'script',
        scope: '/',
        base: '/',
        devOptions: {
          enabled: false,
        },
        includeAssets: [
          'favicon.ico',
          'favicon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-192x192.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          name: 'إدارة حلقة التحفيظ',
          short_name: 'حلقة التحفيظ',
          description: 'إدارة ومتابعة طلاب حلقة تحفيظ القرآن الكريم',
          lang: 'ar',
          dir: 'rtl',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#ffffff',
          theme_color: '#176b35',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [
            /^\/__/,
            /^\/api/,
            /firestore\.googleapis\.com/,
            /identitytoolkit\.googleapis\.com/,
            /securetoken\.googleapis\.com/,
            /googleapis\.com/,
            /firebaseio\.com/,
          ],
          runtimeCaching: [
            {
              // Crucial: Exclude Firebase Authentication, Firestore, and Google Identity APIs from Service Worker cache.
              // Firestore uses its own IndexedDB persistentLocalCache.
              urlPattern: /^https:\/\/(.*\.)?(firestore\.googleapis\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com|googleapis\.com|firebaseio\.com)/i,
              handler: 'NetworkOnly',
            },
            {
              // Cache Google Fonts stylesheets
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
            {
              // Cache Google Fonts webfont files
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
