import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import resize from './assets/js/directives/resize'
import { VueSvgIconPlugin, setOptions } from '@yzfe/vue3-svgicon'
import '@yzfe/svgicon/lib/svgicon.css'

setOptions({
  // isOriginalDefault: true,
  defaultWidth: '20px',
  defaultHeight: '20px'
})

createApp(App)
  .use(VueSvgIconPlugin, {
    tagName: 'icon'
  })
  .use(store)
  .use(router)
  .directive('resize', resize)
  .mount('#app')
