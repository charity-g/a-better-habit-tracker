import { defineConfig } from 'vite'
import { VitePWA, type ManifestOptions, type VitePWAOptions } from "vite-plugin-pwa";
import manifestObject from './manifest.json'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'


const manifestForPlugin : Partial<VitePWAOptions> = {
  registerType: "prompt",
  "includeAssets": [], //["favicon.ico", "robots.txt", "apple-touch-icon.png"],
  manifest: manifestObject as Partial<ManifestOptions>,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(manifestForPlugin )],
})
