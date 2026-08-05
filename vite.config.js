import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path only needs to change for the production build — GitHub Pages
// serves this project from https://<user>.github.io/github-dashboard/,
// while local dev and `vite preview` both serve from the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/github-dashboard/' : '/',
  plugins: [react()],
}))
