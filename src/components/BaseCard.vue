<template>
 <foreignObject :x="view.x" :y="view.y" width="280" height="400">
    <div class="card" :style="{background: `var(--${style.background}-${style.light ? 8 : 2 })`, color: `var(--${style.text}-${style.light ? 2 : 8 })`}">
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
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/style/global";
.card {
  background: $red-3;
  color: $yellow-8;
  height: 100%;
  padding: $spacing;
  overflow: auto; // breaks things in desktop safari
  // border-radius: $base-border-radius;
}
</style>
