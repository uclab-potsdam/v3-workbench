<template>
  <button :class="{primary}">
    <slot>Button</slot>
  </button>
</template>

<script>
export default {
  name: 'BaseButton',
  props: {
    primary: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped lang="scss">
button {
  height: var(--spacing-xl);
  background: var(--background);
  box-sizing: border-box;
  border: none;
  color: var(--text);
  padding: var(--spacing);
  // font-size: inherit;
  line-height: inherit;
  // width: 100%;
  &.primary {
    background: var(--text);
    color: var(--background);
  }
  &:hover {
    color: var(--background);
    background: var(--accent);
  }
  &.border {
    border: var(--base-border);
    &:hover {
      border: none;
    }
  }
  &.no-outline:focus {
    outline: none;
  }
  &:disabled {
    color: var(--muted);
    &.primary {
      background: var(--muted);
      color: var(--background);
    }
    // background: var(--accent);
  }
}
</style>
