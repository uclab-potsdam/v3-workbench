<template>
  <div class="statusbar">
    <span>offline</span>
    <span>
      <select v-model="theme">
        <option v-for="theme in themes" :key="theme">{{ theme }}</option>
      </select>
    </span>
  </div>
</template>

<script>
export default {
  name: 'TheStatusbar',
  data () {
    return {
      themes: ['light', 'dark'],
      theme: 'light'
    }
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
@import "@/assets/style/global";
.statusbar {
  border-top: $base-border;
  padding: $spacing * 0.5 $spacing;
  color: $muted;
  display: flex;
  justify-content: space-between;
}
</style>
