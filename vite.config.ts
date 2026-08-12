import { seedDesignPlugin } from '@seed-design/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/certification/', // GitHub Pages 서브패스. 틀리면 배포 후 흰 화면
  plugins: [react(), seedDesignPlugin()],
})
