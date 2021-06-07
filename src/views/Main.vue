<template>
  <div class="main">
    <TheCanvas/>
  </div>
</template>

<script>
import TheCanvas from '@/components/TheCanvas.vue'

export default {
  name: 'Main',
  components: {
    TheCanvas
  }
}
</script>
<style lang="scss" scoped>
.main {
  position: relative;
}

</style>
