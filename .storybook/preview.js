import { VueSvgIconPlugin, setOptions } from '@yzfe/vue3-svgicon'
import { storybookApp } from '../node_modules/@storybook/vue3/dist/esm/client/preview/render'
import '../src/assets/style/base.scss'
import '@yzfe/svgicon/lib/svgicon.css'

setOptions({
  // isOriginalDefault: true,
  defaultWidth: '20px',
  defaultHeight: '20px'
})

storybookApp.use(VueSvgIconPlugin, {
  tagName: 'icon'
})

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}