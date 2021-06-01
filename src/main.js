import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import resize from './assets/js/directives/resize'

createApp(App)
  .use(store)
  .use(router)
  .directive('resize', resize)
  .mount('#app')
