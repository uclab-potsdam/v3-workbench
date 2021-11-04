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
  --border-radius: 5px;
  box-sizing: border-box;
  background-color: transparent;
  border: 1px solid var(--blue-4);
  color: var(--blue-4);
  padding: 0.5em;
  margin: 0;
  font-size: inherit;
  border-radius: var(--border-radius);
  width: 100%;
}
</style>
