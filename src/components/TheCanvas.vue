<template>
  <CanvasContainer>
    <BaseCard/>
  </CanvasContainer>
  <div class="floating">
    <TheSearchbar/>
    <CanvasControls/>
  </div>
</template>

<script>
import CanvasContainer from '@/components/CanvasContainer.vue'
import CanvasControls from '@/components/CanvasControls.vue'
import TheSearchbar from '@/components/TheSearchbar.vue'
import BaseCard from './BaseCard.vue'

export default {
  name: 'Home',
  components: {
    CanvasContainer,
    CanvasControls,
    TheSearchbar,
    BaseCard
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/style/global";
.floating {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
  padding: $spacing;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  > * {
    pointer-events: auto;
  }
}
</style>
