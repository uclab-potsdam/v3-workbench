<template>
  <CanvasContainer/>
  <div class="floating">
    <TheSearchbar/>
  </div>
</template>

<script>
import CanvasContainer from '@/components/CanvasContainer.vue'
import TheSearchbar from '@/components/TheSearchbar.vue'

export default {
  name: 'Home',
  components: {
    CanvasContainer,
    TheSearchbar
  },
  data () {
    return {
    }
  }
}
</script>
<style lang="scss" scoped>
.floating {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
  padding: var(--spacing);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  > * {
    pointer-events: auto;
  }
}
</style>
