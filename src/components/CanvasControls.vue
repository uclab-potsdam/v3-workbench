<template>
  <div class="controls">
    <BaseButton :disabled="max" @click="$emit('zoom-in')">
      <icon original data="@icon/btn-zoom_in.svg"/>
      <!-- <inline-svg :src="require('@/assets/icons/btn-zoom_in.svg')"/> -->
    </BaseButton>
    <BaseButton :disabled="min" @click="$emit('zoom-out')"><icon original data="@icon/btn-zoom_out.svg"/></BaseButton>
    <BaseButton @click="$emit('zoom-to-fit')"><icon original :data="IconZoomOut"/></BaseButton>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'
// import IconZoomOut from '@/assets/icons/btn-zoom_out.svg'
import IconZoomOut from '@/assets/icons/btn-zoom-fit.svg'
export default {
  components: { BaseButton },
  name: 'CanvasControls',
  props: {
    max: Boolean,
    min: Boolean
  },
  data () {
    return { IconZoomOut }
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
