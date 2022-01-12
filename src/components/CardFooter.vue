<template>
  <footer class="blur">
    <slot/>
  </footer>
</template>

<script>
export default {
  name: 'CardFooter'
}
</script>

<style scoped lang="scss">
footer {
  height: var(--card-footer-height);
  padding: calc(var(--spacing-s) + var(--spacing-xs));
  position: sticky;
  bottom: 0;
}
</style>
