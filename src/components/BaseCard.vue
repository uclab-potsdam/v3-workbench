<template>
 <foreignObject :x="view.x" :y="view.y" width="280" height="400">
    <div class="card" :style="colors">
      <h1>{{ label }}</h1>
      <h2>{{ type }}</h2>
    </div>
  </foreignObject>
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
    }
  }
}
</script>

<style scoped lang="scss">
.card {
  background: var(--background);
  color: var(--text);
  height: 100%;
  padding: var(--spacing);
  overflow: auto; // breaks things in desktop safari
  // border-radius: $base-border-radius;
}
</style>
