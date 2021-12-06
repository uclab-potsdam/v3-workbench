<template>
  <slot ref="slot"/>
</template>

<script>
export default {
  name: 'InteractionDrag',
  props: {
    trigger: null
  },
  mounted () {
    this.$nextTick(() => {
      console.log('InteractionDrag', this.$slots.default(), this.$el.nextSibling)
    })
  },
  watch: {
    trigger (trigger) {
      console.log('trigger', trigger)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
