import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/images': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/owner': {             // 추가: '/owner' 경로에 대한 프록시 설정
        target: 'http://172.30.1.68:8080/',
        changeOrigin: true
      },
      'order': {
        target: 'http://172.30.1.68:8080/',
        changeOrigin: true
      },
      'restaurant': {
        target: 'http://172.30.1.68:8080/',
        changeOrigin: true
      },
    }
  },
})
