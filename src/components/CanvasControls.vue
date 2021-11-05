<template>
  <div class="controls shadow">
    <BaseButton :disabled="max" @click="$emit('zoom-in')">
      <icon :scale="1" data="@icon/zoom-in.svg"/>
      <!-- <inline-svg :src="require('@/assets/icons/btn-zoom_in.svg')"/> -->
    </BaseButton>
    <BaseButton :disabled="min" @click="$emit('zoom-out')"><icon :scale="1" data="@icon/zoom-out.svg"/></BaseButton>
    <BaseButton @click="$emit('zoom-to-fit')"><icon data="@icon/zoom-fit.svg"/></BaseButton>
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
  background: var(--background);
  border: var(--base-border);
  position: absolute;
  bottom: var(--spacing);
  right: var(--spacing);
  display: flex;
  flex-direction: column;

  // button {
  //   color: var(--muted-border);
  //   &:hover {
  //     color: var(--accent);
  //   }
  // }

  // button + button::before {
  //   height: 1px;
  //   right: var(--spacing);
  //   left: var(--spacing);
  //   content: "";
  //   // bottom: 0;
  //   position: absolute;
  //   background: var(--muted-border);
  //   // margin: -10.5px -5px;
  //   margin: calc(var(--spacing) * -1 - 0.5px) calc(var(--spacing-s) * -1);
  //   // top: 0;
  // }
}
</style>
