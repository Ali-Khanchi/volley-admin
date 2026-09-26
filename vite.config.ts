import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on the LAN interface so devices on your VPN/home network can reach it.
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
