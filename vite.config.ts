import { defineConfig, loadEnv, type PluginOption } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
import path from 'path';
import { mkdirSync, writeFileSync } from 'node:fs';

function firebaseMessagingConfigPlugin(mode: string): PluginOption {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    name: 'firebase-messaging-config',
    closeBundle() {
      const config = {
        apiKey: env.VITE_FIREBASE_API_KEY ?? '',
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
        projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
        appId: env.VITE_FIREBASE_APP_ID ?? '',
        vapidKey: env.VITE_FIREBASE_VAPID_KEY ?? '',
      };

      mkdirSync(path.resolve(__dirname, 'dist'), { recursive: true });
      writeFileSync(
        path.resolve(__dirname, 'dist/firebase-messaging-config.json'),
        `${JSON.stringify(config, null, 2)}\n`,
      );
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    firebaseMessagingConfigPlugin(mode),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        importScripts: ['/firebase-messaging-sw.js'],
      },
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
          { src: '/logo-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/logo-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
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
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://skala3-cloud1-team3.cloud.skala-ai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  }
}));
