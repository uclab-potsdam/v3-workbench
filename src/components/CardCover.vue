<template>
  <section class="cover">
    <img :src="`${fileServer}/${path}`"/>
  </section>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'CardCover',
  props: {
    path: String
  },
  computed: {
    ...mapState('config', ['fileServer'])
  }
}
</script>

<style scoped lang="scss">
.cover {
  padding: 0 var(--spacing);
  display: flex;
  justify-content: center;
  height: var(--card-main-height);
  background: rgb(var(--secondary));
  @media (prefers-color-scheme: dark) {
    background: rgb(var(--primary));
  }
  img {
    mix-blend-mode: var(--blend-mode);
    filter: grayscale(1);
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: var(--card-main-height);
    object-fit: contain;
  }
}
</style>
