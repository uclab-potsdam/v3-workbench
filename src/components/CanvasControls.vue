<template>
  <div class="controls">
    <BaseButton>+</BaseButton>
    <BaseButton>-</BaseButton>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'
export default {
  components: { BaseButton },
  name: 'CanvasControls'
}
</script>

<style scoped lang="scss">
@import "@/assets/style/global";
.controls {
  align-self: flex-end;
  display: flex;
  flex-direction: column;
}
</style>
