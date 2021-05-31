<template>
  <div class="searchbar">
    offline
  </div>
</template>

<script>
export default {
  name: 'TheStatusbar',
  props: {
    msg: String
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/style/global";
div {
  border-top: $default-border;
  padding: $spacing * 0.5 $spacing;
  color: $muted;
}
</style>
