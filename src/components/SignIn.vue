<template>
  <div class="container">
    <main class="border shadow">
       <section>
          <BaseInput
            v-for="(input, i) in inputs"
            :key="i"
            :type="input.type"
            :label="input.label"
            :disabled="input.disabled"
            :prefix="input.prefix"
            :placeholder="input.placeholder"
            v-model="input.content"
          />
      </section>
      <section>
        <base-button @click="signin" class="primary">Sign in →</base-button>
      </section>
    </main>
  </div>
</template>

<script>
import BaseButton from '../components/BaseButton.vue'
import BaseInput from './BaseInput.vue'
import { mapActions } from 'vuex'

export default {
  components: { BaseInput, BaseButton },
  props: {
    inputs: { type: Array, required: true, default: () => [] }
  },
  data () {
    return {
      user: null,
      jwt: null,
      organization: 'V3'
    }
  },
  methods: {
    ...mapActions('auth', ['authenticate']),
    async signin () {
      const { user, jwt, organization } = this
      await this.authenticate({ user, jwt, organization })
      this.$router.push({ name: 'Open' })
    }
  }
}
</script>

<style lang="scss" scoped>

.container main {
  margin: var(--spacing-xl) var(--spacing-l);
  width: 100%;
  max-width: 512px;
  min-height: 100px;
  background: var(--background);
  padding: var(--spacing);
}

section {
  display: flex;
  flex-direction: column;

  button {
    align-self: flex-start;
    width: 160px;
  }

  & + section {
    margin-top: var(--spacing-l);
  }
}
</style>
