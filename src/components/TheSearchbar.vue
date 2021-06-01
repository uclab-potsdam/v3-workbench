<template>
  <div class="searchbar">
    <h2>Find or create cards</h2>
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
.searchbar {
  background: $background;
  border: $base-border;
  border-radius: $base-border-radius;
  color: $muted;
  padding: $spacing * 0.5 $spacing;
  margin-top: $spacing;
  width: 100%;
  max-width: $medium;
}
</style>
