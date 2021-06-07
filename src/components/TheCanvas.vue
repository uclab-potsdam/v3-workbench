<template>
  <CanvasContainer>
    <BaseCard
      v-for="card in cards"
      :key="card.id"
      v-bind="card" />
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
import BaseCard from '@/components/BaseCard.vue'
import cards from '@/assets/data/mock.json'

export default {
  name: 'Home',
  components: {
    CanvasContainer,
    CanvasControls,
    TheSearchbar,
    BaseCard
  },
  data () {
    return {
      cards
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
