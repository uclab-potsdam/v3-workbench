<template>
  <div class="searchbar">
    <h2>Find or create cards</h2>
  </div>
</template>

<script>
export default {
  name: 'TheStatusbar',
  props: {
    msg: String
  }
}
</script>

<style scoped lang="scss">
.searchbar {
  background: var(--background);
  border: var(--base-border);
  border-radius: var(--base-border-radius);
  color: var(--muted);
  padding: var(--spacing-s) var(--spacing);
  margin-top: var(--spacing);
  width: 100%;
  max-width: var(--medium);
}
</style>
