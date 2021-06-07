<template>
  <div class="controls">
    <BaseButton :disabled="max" @click="$emit('zoom-in')">+</BaseButton>
    <BaseButton :disabled="min" @click="$emit('zoom-out')">-</BaseButton>
    <BaseButton @click="$emit('zoom-to-fit')">fit</BaseButton>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'
export default {
  components: { BaseButton },
  name: 'CanvasControls',
  props: {
    max: Boolean,
    min: Boolean
  }
}
</script>

<style scoped lang="scss">
.controls {
  position: absolute;
  bottom: var(--spacing);
  right: var(--spacing);
  display: flex;
  flex-direction: column;
}
</style>
