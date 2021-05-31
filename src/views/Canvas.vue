<template>
  <div class="main">
    <TheCanvas/>
    <div class="floating">
      <TheSearchbar/>
    </div>
  </div>
</template>

<script>
import TheCanvas from '@/components/TheCanvas.vue'
import TheSearchbar from '../components/TheSearchbar.vue'

export default {
  name: 'Home',
  components: {
    TheCanvas,
    TheSearchbar
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/style/global";

.main {
  position: relative;
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

    > * {
      pointer-events: auto;
    }
  }
}

</style>
