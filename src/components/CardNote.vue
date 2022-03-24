<template>
  <section class="note">
    <textarea v-model="text" @blur="update" placeholder="add note"/>
    <!-- text -->
  </section>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  name: 'CardNote',
  props: {
    prop: Object,
    entity: String
  },
  data () {
    return {
      text: ''
    }
  },

  computed: {
    // ...mapGetters('view', ['hasCardWithEntity'])
  },
  methods: {
    update () {
      this.updateNote([this.entity, this.prop._id, { '@type': 'xsd:string', '@value': this.text }])
    },
    ...mapActions('api', ['updateNote'])
    // setOffsets () {
    //   this.updatePropertyOffsets({
    //     represents: this.represents,
    //     prop: this.prop._id,
    //     inverse: this.prop.inverse,
    //     value: Object.fromEntries(this.refs.map(ref => [ref._id, ref.el.offsetTop]))
    //   })
    // },
    // beforeUpdate () {
    //   this.refs = []
    // },
    // getColors (id) {
    //   const colors = [
    //     this.hasCardWithEntity(id) ? 'var(--edges)' : 'none',
    //     'rgb(var(--secondary))',
    //     'currentColor'
    //   ]
    //   return colors
    // },
    // getAddColors (id) {
    //   const colors = [
    //     'none',
    //     'rgb(var(--secondary))',
    //     'currentColor'
    //   ]
    //   return colors
    // }
  },
  mounted () {
    // this.setOffsets()
    // if (this.prop.value[0] != null) {
    this.text = this.prop.value[0]?._id || ''
    // }
  }
}
</script>

<style scoped lang="scss">
.note {
  font-family: var(--font-family-serif);
  font-size: inherit;
  padding: var(--spacing);

  textarea {
    font-family: inherit;
    font-size: inherit;
    background: none;
    color: inherit;
    border: none;
    width: 100%;
    height: 140px;
  }
}
</style>
