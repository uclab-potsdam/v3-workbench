<template>
  <div class="statusbar">
    <span :class="{connected}">{{connected ? 'online' : 'offline'}}</span>
    <span>
      <select v-model="theme">
        <option v-for="theme in themes" :key="theme">{{ theme }}</option>
      </select>
    </span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'TheStatusbar',
  data () {
    return {
      themes: ['light', 'dark'],
      theme: 'light'
    }
  },
  computed: {
    ...mapGetters('api', ['connected'])
  },
  methods: {
    setTheme () {
      const el = document.documentElement
      this.themes.forEach(theme => {
        el.classList.remove(theme)
      })
      el.classList.add(this.theme)
    }
  },
  watch: {
    theme: {
      handler () {
        this.setTheme()
      },
      immediate: true
    }
  }
}
</script>

<style scoped lang="scss">
.statusbar {
  border-top: var(--base-border);
  padding: var(--spacing-s) var(--spacing);
  color: var(--muted);
  display: flex;
  justify-content: space-between;

  .connected {
    color: var(--status-ok);
  }
}
</style>
