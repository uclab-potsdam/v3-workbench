import BaseButton from '@/components/BaseButton.vue'

export default {
  title: 'Inputs/BaseButton',
  component: BaseButton
}

const Template = ({ label, ...args }) => ({
  components: { BaseButton },
  setup () {
    return { label, args }
  },
  template: '<BaseButton v-bind="args">{{label}}</BaseButton>'
})

export const Primary = Template.bind({})
Primary.args = {
  primary: true,
  label: 'Primary Button'
}

export const Secondary = Template.bind({})
Secondary.args = {
  label: 'Button'
}
