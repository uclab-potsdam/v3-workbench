<template>
  <div class="main">
    <TheCanvas/>
    <div class="floating">
      <TheSearchbar/>
    </div>
    <div id="drag-layer"/>
  </div>
</template>

<script>
import TheCanvas from '@/components/TheCanvas.vue'
import TheSearchbar from '@/components/TheSearchbar.vue'
import { mapActions } from 'vuex'

export default {
  name: 'Main',
  components: {
    TheCanvas,
    TheSearchbar
  },
  methods: {
    ...mapActions(['init'])
  },
  mounted () {
    this.init()
  }
}
</script>
<style lang="scss" scoped>
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
    padding: var(--spacing);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    > * {
      pointer-events: auto;
    }
  }
}
</style>
