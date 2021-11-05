<template>
  <button>
    <slot/>
  </button>
</template>

<script>
export default {
  name: 'BaseButton'
}
</script>

<style scoped lang="scss">
button {
  background: var(--background);
  border: none;
  color: var(--text);
  padding: var(--spacing);
  font-size: inherit;
  width: 100%;
  &:hover {
    color: var(--background);
    background: var(--accent);
  }
}
</style>
