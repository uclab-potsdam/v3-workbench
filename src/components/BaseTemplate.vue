<template>
  <header>
    <h1>{{$route.name}}</h1>
  </header>
  <div class="container">
    <main class="border shadow">
      <slot/>
    </main>
  </div>
</template>

<script>
</script>

<style lang="scss" scoped>

header {
  user-select: none;
  position: fixed;
  z-index: -1;
  padding: var(--spacing) var(--spacing-l);
}
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;

  main {
    margin: var(--spacing-xl) var(--spacing-l);
    width: 100%;
    max-width: 512px;
    min-height: 100px;
    background: var(--background);
    padding: var(--spacing);
  }
}
</style>
