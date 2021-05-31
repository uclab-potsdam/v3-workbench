<template>
  <router-view class="router-view"/>
  <the-statusbar class="the-statusbar"/>
</template>
<script>
import TheStatusbar from './components/TheStatusbar.vue'
export default {
  components: { TheStatusbar }
}
</script>
<style lang="scss">
@import "@/assets/style/base";

#app {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .router-view {
    flex: 1
  }
}
</style>
