<template>
  <footer>
    <div class="wrapper blur">
      <div>
        <slot/>
      </div>
      <div>
        <slot name="right"/>
      </div>
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
    display: flex;
    justify-content: space-between;

    > div {
      display: flex;
      gap: var(--spacing-s);
    }
  }
}
</style>
