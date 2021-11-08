<template>
  <base-template>
    <section>
      <label>New Canvas</label>
      <div class="input-group">
        <input v-model="canvas" type="text" autocomplete="off"/>
        <base-button :disabled="canvas.length === 0" @click="create" class="primary">Create →</base-button>
      </div>
    </section>
    <section>
      <label>Open Existing</label>
      <ul>
        <router-link v-for="c in canvases" :key="c._id" :to="{name: 'Canvas', params: {id: c.route}}">
          <li>{{ c.route }}</li>
        </router-link>
      </ul>
      <!-- <base-button >{{ c._id }}</base-button> -->
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
      canvas: '',
      canvases: []
    }
  },
  async mounted () {
    const canvases = await this.getCanvases()
    this.canvases = canvases.map(c => ({
      ...c,
      route: c._id.replace('View/', '')
    }))
  },
  methods: {
    ...mapActions('api', ['getCanvases', 'createCanvas']),
    async create () {
      await this.createCanvas(this.canvas)
      // const { user, jwt, organization } = this
      // await this.authenticate({ user, jwt, organization })
      this.$router.push({ name: 'Canvas', params: { id: this.canvas } })
    }
  }
}
</script>

<style lang="scss" scoped>
section {
  display: flex;
  flex-direction: column;

  button {
    width: 160px;
  }

  & + section {
    margin-top: var(--spacing-l);
  }

  .input-group {
    display: flex;
    align-items: flex-end;
    input {
      flex: 1;
    }
    > * + * {
      margin-left: var(--spacing);
    }
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    a {
      margin-top: var(--spacing-s);
      padding: var(--spacing-s) var(--spacing-xs);
      font-size: var(--font-size-l);
      text-decoration: none;
      color: inherit;
      // border-bottom: var(--base-border);

      &:hover {
        background: var(--accent);
        color: var(--background);
      }
    }
  }
}
</style>
