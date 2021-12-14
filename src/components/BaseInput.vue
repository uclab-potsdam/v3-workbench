<template>
  <div class="input">
    <label class="input-prefix" v-if="prefix">{{ prefix }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      v-model="content"
    />
    <label class="input-suffix" v-if="suffix">{{ suffix }}</label>
  </div>
</template>

<script>
export default {
  name: 'BaseInput',
  props: {
    type: {
      type: String,
      default: 'text'
    },
    placeholder: String,
    disabled: {
      type: Boolean,
      default: false
    },
    label: String,
    prefix: String,
    suffix: String,
    value: [Number, String]
  }
}
</script>

<style scoped lang="scss">
input {
  appearance: none;
  height: calc(var(--spacing-xl));
  background: var(--background);
  box-sizing: border-box;
  border: none;
  color: var(--text);
  font-weight: var(--bold);
  border-bottom: var(--base-border);
  font-size: var(--font-size-l);
  font-weight: var(--bold);
  padding: var(--spacing-s);
  width: 100%;

  &:disabled {
    color: var(--muted);
    border-color: var(--muted-border);
    cursor: not-allowed;
  }
}

label + input {
  margin-top: var(--spacing-s);
  margin-left: var(--spacing-s);
}

input + label {
  margin-top: var(--spacing-s);
  margin-left: var(--spacing-s);
}

input,
button {
  &:focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}
</style>
