import CanvasControls from '@/components/CanvasControls.vue'

export default {
  title: 'Components/Canvas Controls',
  component: CanvasControls
}

const Template = ({ label, ...args }) => ({
  components: { CanvasControls },
  setup () {
    return { label, args }
  },
  template: '<CanvasControls v-bind="args">{{label}}</CanvasControls>'
})

export const canvasControls = Template