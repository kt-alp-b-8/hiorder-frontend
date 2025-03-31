import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import i18n from './plugins/i18n';

createApp(App)
  .use(router)
  .use(i18n)
  .mount('#app')
