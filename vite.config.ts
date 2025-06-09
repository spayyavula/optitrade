import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'OptionsWorld - Options Trading Platform',
        short_name: 'OptionsWorld',
        description: 'Advanced options trading platform with strategy building and portfolio tracking',
        theme_color: '#0ea5e9',
        background_color: '#171717',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});