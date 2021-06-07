<template>
  <div class="card" :style="{...colors, ...transform}">
    <h1>{{ label }}</h1>
    <h2>{{ type }}</h2>
  </div>
</template>

<script>
export default {
  name: 'BaseCard',
  props: {
    id: String,
    label: String,
    type: String,
    description: String,
    view: Object,
    style: Object,
    props: Object
  },
  computed: {
    colors () {
      const { background, text, light } = this.style
      return {
        '--background': `var(--${background}-${light ? 8 : 2})`,
        '--text': `var(--${text}-${light ? 2 : 8})`
      }
    },
    transform () {
      const { x, y } = this.view
      return {
        transform: `translate(${x}px, ${y}px)`
      }
    }
  }
}
</script>

<style scoped lang="scss">
.card {
  background: var(--background);
  color: var(--text);
  position: absolute;
  width: 280px;
  height: 420px;
  padding: var(--spacing);
  overflow: auto;
}
</style>
