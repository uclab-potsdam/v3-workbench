<template>
  <base-template>
    <section>
      <label>User</label>
      <input v-model="user" type="email" autocomplete="username"/>
    </section>
    <section>
      <label class="disabled">Organization</label>
      <input v-model="organization" type="text" disabled/>
    </section>
    <section>
      <label>Access Token</label>
      <input v-model="jwt" type="password" autocomplete="current-password"/>
    </section>
    <section>
      <base-button @click="signin" class="primary">Sign in →</base-button>
    </section>
  </base-template>
</template>

<script>
import { mapActions } from 'vuex'
import BaseButton from '../components/BaseButton.vue'
import BaseTemplate from '../components/BaseTemplate.vue'

export default {
  components: { BaseTemplate, BaseButton },
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
