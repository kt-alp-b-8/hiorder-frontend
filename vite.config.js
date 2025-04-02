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
      // '/images': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true
      // },
      // '/owner': {             // 추가: '/owner' 경로에 대한 프록시 설정
      //   target: 'http://localhost:8080/',
      //   changeOrigin: true
      // },
      '/order': {
        target: 'https://team08.kro.kr/order',
        changeOrigin: true
      },
      '/restaurant': {
        target: 'https://team08.kro.kr/restaurant',
        changeOrigin: true
      },
      '/payment': {
        target: 'https://team08.kro.kr/payment',
        changeOrigin: true
      },
      '/ocr': {
        target: 'https://team08.kro.kr/ocr',
        changeOrigin: true
      },
    }
  },
})
