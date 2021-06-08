<template>
  <div class="card" :style="colors">
    <h1>{{ card.label }}</h1>
    <h2>{{ card.type }}</h2>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'BaseCard',
  props: {
    id: String,
    collapsed: Boolean,
    pane: String
  },
  computed: {
    ...mapGetters('data', [
      'getCard'
    ]),
    card () {
      return this.getCard(this.id)
    },
    colors () {
      const { background, text, light } = this.card.style
      return {
        '--background': `var(--${background}-${light ? 8 : 2})`,
        '--text': `var(--${text}-${light ? 2 : 8})`
      }
    }
  }
}
</script>

<style scoped lang="scss">
.card {
  background: var(--background);
  color: var(--text);
  position: absolute;
  width: 280px;
  height: 420px;
  padding: var(--spacing);
  overflow: auto;
}
</style>
