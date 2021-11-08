<template>
  <router-view class="router-view"/>
  <user-controls/>
</template>
<script>
import UserControls from './components/UserControls.vue'
export default {
  components: { UserControls }
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
