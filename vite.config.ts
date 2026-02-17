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
        theme_color: '#FF6B8A',
        background_color: '#ffffff',
        icons: [
          { src: '/logo-icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/logo-icon.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: '/logo-icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
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
    port: 3001,
    proxy: {
      '/api/payments': {
        target: 'http://202.30.16.217:8078',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/api': {
        target: 'https://baeminjun.store',
        changeOrigin: true,
      },
    },
  }
});
