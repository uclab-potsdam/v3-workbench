import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import resize from './assets/js/directives/resize'
import { VueSvgIconPlugin } from '@yzfe/vue3-svgicon'
import '@yzfe/svgicon/lib/svgicon.css'

createApp(App)
  .use(VueSvgIconPlugin, { tagName: 'icon' })
  .use(store)
  .use(router)
  .directive('resize', resize)
  .mount('#app')
