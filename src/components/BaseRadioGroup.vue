<template>
  <div class="base-radio-group">
    <label v-for="(o, i) in options" :key="i">
      <input type="radio" :name="name"
        :value="o.value" :checked="o.value === modelValue"
        @change="$emit('update:modelValue', o.value)">
      <span>{{ o.label }}</span>
    </label>
  </div>
</template>

<script>
import { v4 as uuid } from 'uuid'
export default {
  name: 'BaseRadioGroup',
  props: {
    options: {
      type: Array,
      default: () => []
    },
    name: {
      type: String,
      default: () => uuid()
    },
    modelValue: {
      type: String,
      default: null
    }
  }
}
</script>

<style scoped lang="scss">
.base-radio-group {
  display: flex;
  gap: var(--spacing-s);
  flex-wrap: wrap;
  label {
    input {
      appearance: none;
      outline: none;
      + span {
        min-width: 40px;
        display: inline-flex;
        justify-content: center;
        padding: var(--spacing-s) var(--spacing);
        background: var(--dimmed);
      }

      &:checked + span {
        background: var(--accent);
        color: var(--background);
      }
    }
  }
}
</style>
