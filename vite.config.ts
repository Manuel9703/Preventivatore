import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Il sito viene pubblicato come project page su GitHub Pages, quindi va
  // servito da /<nome-repo>/ e non dalla root del dominio.
  base: '/Preventivatore/',
})
