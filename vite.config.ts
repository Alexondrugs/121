import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  envPrefix: 'VITE_',
  base: process.env.GITHUB_ACTIONS ? '/121/' : '/'
})


