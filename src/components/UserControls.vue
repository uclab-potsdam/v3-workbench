<template>
  <div v-if="isAuthenticated" class="controls shadow">
    <BaseButton class="no-outline" @click="signOut">
      <icon :scale="1" data="@icon/sign-out.svg"/>
      <!-- <inline-svg :src="require('@/assets/icons/btn-zoom_in.svg')"/> -->
    </BaseButton>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseButton from './BaseButton.vue'
export default {
  components: { BaseButton },
  name: 'UserControls',
  computed: {
    ...mapGetters('auth', ['isAuthenticated'])
  },
  methods: {
    // ...mapActions('auth', ['signOut']),
    signOut () {
      this.$store.dispatch('auth/signOut')
      this.$router.push({ name: 'Sign in' })
    }
  }
}
</script>

<style scoped lang="scss">
.controls {
  background: var(--background);
  border: var(--base-border);
  position: absolute;
  top: var(--spacing);
  right: var(--spacing);
  display: flex;
  flex-direction: column;

  // button {
  //   color: var(--muted-border);
  //   &:hover {
  //     color: var(--accent);
  //   }
  // }

  // button + button::before {
  //   height: 1px;
  //   right: var(--spacing);
  //   left: var(--spacing);
  //   content: "";
  //   // bottom: 0;
  //   position: absolute;
  //   background: var(--muted-border);
  //   // margin: -10.5px -5px;
  //   margin: calc(var(--spacing) * -1 - 0.5px) calc(var(--spacing-s) * -1);
  //   // top: 0;
  // }
}
</style>
