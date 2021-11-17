import IconSignOut from '@icon/sign-out.svg'

export default {
  title: 'Atoms/Icon',
  argTypes: {
    color: { control: 'color' }
  }
}

const Template = ({ icon, ...args }) => ({
  setup () {
    return { icon, args }
  },
  template: '<icon v-bind="args" :data="icon"/>'
})

export const SignOut = Template.bind({})
SignOut.args = {
  icon: IconSignOut
}
