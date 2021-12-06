import BaseInput from '@/components/BaseInput.vue'

export default {
  title: 'Components/Input',
  component: BaseInput
}

const Template = ({ label, ...args }) => ({
  components: { BaseInput },
  setup () {
    return { label, args }
  },
  template: '<BaseInput v-bind="args">{{label}}</BaseInput>'
})

export const Default = Template.bind({})
Default.args = {
  label: 'Default', 
  type: 'text',
  placeholder: 'Insert text',
}

export const Prefix = Template.bind({})
Prefix.args = {
  label: 'Prefix', 
  type: 'text',
  placeholder: 'Insert text',
  prefix: 'prefix',
}

export const Suffix = Template.bind({})
Suffix.args = {
  label: 'Suffix', 
  type: 'text',
  placeholder: 'Insert text',
  suffix: 'suffix',
}

export const Date = Template.bind({})
Date.args = {
  label: 'Default', 
  type: 'date',
}

export const Password = Template.bind({})
Password.args = {
  label: 'Password', 
  type: 'password',
}


export const Disabled = Template.bind({})
Disabled.args = {
  label: 'Disabled',
  placeholder: 'This input is disabled', 
  disabled: true,
}