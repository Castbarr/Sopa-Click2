import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'assets/logo.png',], // ajusta según tus assets
      manifest: {
        name: 'Sopa-Click',
        short_name: 'Sopa-Click',
        description: 'Un juego hecho con Phaser y Vite',
        theme_color: '#1d1d1d',
        background_color: '#1d1d1d',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'assets/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
