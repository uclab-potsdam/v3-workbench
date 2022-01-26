<template>
  <footer>
    <div class="wrapper blur">
      <slot/>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'CardFooter'
}
</script>

<style scoped lang="scss">
footer {
  height: 0;
  position: sticky;
  z-index: 2;
  top: calc(var(--card-height) - var(--card-footer-height));

  .wrapper {
    padding: calc(var(--spacing-s) + var(--spacing-xs));
  }
}
</style>
