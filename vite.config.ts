import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
        suppressWarnings: true,
      },
      manifest: {
        name: 'WayThing',
        short_name: 'WayThing',
        description: '어트랙션 줄서기 웹앱',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        icons: [
          { src: '/logo-basic.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo-basic.png', sizes: '512x512', type: 'image/png' },
          { src: '/logo-basic.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001
  }
});
