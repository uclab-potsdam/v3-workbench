import BaseInput from '@/components/BaseInput.vue'
import SignIn from '@/components/SignIn.vue'

export default {
  components: { SignIn },
  title: 'Components/Login'
}

const Template = ({ ...props }) => ({
  components: { SignIn },
  setup () {
    return { props }
  },
  template: '<SignIn v-bind="props"></SignIn>'
})

export const Default = Template.bind({})
Default.args = {
  inputs: [
    { ...BaseInput.args = { label: 'user', type: 'email', placeholder: 'Insert text', prefix: 'User' } },
    { ...BaseInput.args = { label: 'org', type: 'text', placeholder: 'V3', prefix: 'Organization', disabled: true } },
    { ...BaseInput.args = { label: 'token', type: 'password', placeholder: 'Insert Password', prefix: 'Access Token' } }
  ]
}
