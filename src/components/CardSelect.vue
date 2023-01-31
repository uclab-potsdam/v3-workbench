<template>
  <div class="options">
    <base-button v-for="(option, i) in options" :key="i" @click="$emit('select', option.value != null ? option.value : option)">
      {{option.label == null ? option : option.label }}
    </base-button>
  </div>
</template>

<script>
import BaseButton from './BaseButton.vue'
export default {
  components: { BaseButton },
  name: 'CardOptions',
  props: {
    options: Array
  }
}
</script>

<style scoped lang="scss">
.options {
  padding: var(--spacing);
  background: rgb(var(--primary));
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
  max-height: 80vh;
  overflow: auto;
}
</style>
