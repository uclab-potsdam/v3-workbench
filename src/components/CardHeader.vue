<template>
  <header class="drag-trigger traverse-label-trigger blur">
    <BaseTraverseLabel root="h2">
      {{ label }}
    </BaseTraverseLabel>
    <h3>{{ doctype }}</h3>
    <div class="icon">
      <slot/>
    </div>
  </header>
</template>

<script>
import BaseTraverseLabel from './BaseTraverseLabel.vue'
export default {
  components: { BaseTraverseLabel },
  name: 'CardHeader',
  props: {
    label: String,
    doctype: String
  }
}
</script>

<style scoped lang="scss">
  header {
    position: sticky;
    top: 0;
    height: var(--card-header-height);
    z-index: 2;

    display: flex;
    flex-direction: column;
    justify-content: center;

    padding: var(--spacing);
    white-space: nowrap;
    overflow: hidden;

    .icon {
      position: absolute;
      right: 0;
    }
  }
</style>
