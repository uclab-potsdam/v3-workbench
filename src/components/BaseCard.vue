<template>
  <div class="card"
    :class="{ collapsed, 'context-search': context === 'search' }" :style="{...colors, transform}"
    v-drop="{
      filter: ['connect'],
      obj: _id,
    }"
    v-drag="{
      mode: 'move-card',
      trigger: '.drag-trigger',
      data: { _id, offset: true }
    }"
    @dropped="onDrop">
    <CardHeader :label="label" :doctype="doctype?.label" @click="toggleCollapse"/>
    <card-footer v-if="!collapsed && context !== 'search'">
       <icon @click="onRemoveCard" scale="1" data="@icon/remove.svg"/>
    </card-footer>
    <main v-if="!collapsed">
      <card-cover v-if="cover" :path="cover"/>
      <card-property v-for="(prop, i) in properties" :key="i"
        :ref="el => { if (el) refs[i] = {el, _id: prop._id} }"
        :prop="prop" :entity="_id"/>
    </main>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import drag from '@/assets/js/directives/drag'
import drop from '@/assets/js/directives/drop'
import CardHeader from './CardHeader.vue'
import CardFooter from './CardFooter.vue'
import CardProperty from './CardProperty.vue'
import CardCover from './CardCover.vue'
export default {
  components: { CardHeader, CardFooter, CardProperty, CardCover },
  name: 'BaseCard',
  directives: {
    drag,
    drop
  },
  emits: ['drag', 'toggleCollapse', 'removeProp', 'setTempEdge', 'clearTempEdge'],
  props: {
    _id: String,
    label: String,
    doctype: Object,
    properties: Object,
    cover: String,
    cardId: String,
    collapsed: Boolean,
    pane: String,
    context: String,
    scale: Number,
    allowDrop: Boolean,
    transform: String
  },
  data () {
    return {
      widthLabel: 0,
      widthCard: 0,
      isCollapsed: true,
      hover: false,
      dragActive: false,
      refs: []
    }
  },
  computed: {
    ...mapState('config', ['fileServer']),
    ...mapGetters('data', ['getType', 'getEntity', 'getLabel']),
    colors () {
      if (this.doctype?.background == null) return
      const { background, text } = this.doctype
      return {
        '--primary': `var(--${text}-9)`,
        '--primary-muted': `var(--${background}-3)`,
        '--secondary': `var(--${background}-2)`
      }
    }
  },
  methods: {
    ...mapActions('data', ['addProp']),
    ...mapActions('view', ['removeCard', 'setPropertyOffsets']),
    onDrop ({ detail }) {
      this.addProp([detail.data.sub, detail.data.prop, detail.obj])
    },
    toggleCollapse () {
      this.$emit('toggleCollapse')
      setTimeout(() => {
        // this.$nextTick(() => {
        this.setPropertyOffsets({ _id: this.cardId, value: this.getOffsets() })
        // })
      }, 500)
    },
    onRemoveCard () {
      this.removeCard(this.cardId)
    },
    // onScroll (e) {
    //   this.e.target.scrollTop
    // },
    getOffsets () {
      return Object.fromEntries(this.refs.map(ref => [ref._id, ref.el.getOffset()]))
    }
  },
  beforeUpdate () {
    this.refs = []
  },
  updated () {
    // this.setPropertyOffsets({ _id: this.cardId, value: this.getOffsets() })
    // console.log(this._id, this.getOffsets())
  },
  mounted () {
    setTimeout(() => {
    // this.$nextTick(() => {
      this.setPropertyOffsets({ _id: this.cardId, value: this.getOffsets() })
    // })
    }, 1500)
  }
}
</script>

<style scoped lang="scss">
// .svg-icon {
//   color: var(--secondary);
// }
.card {
  transform-origin: top left;
  background: rgb(var(--secondary));
  color: rgb(var(--primary));
  @media (prefers-color-scheme: dark) {
    background: rgb(var(--primary));
    color: rgb(var(--secondary));
  }
  width: var(--card-width);
  overflow-x: hidden;
  overflow-y: auto;
  // display: flex;
  // flex-direction: column;
  // justify-content: space-between;
  &:hover {
    z-index: 1;
  }

  // hide scrollbars
  &::-webkit-scrollbar { width: 0 !important }
  scrollbar-width: none;

  height: var(--card-height);

  &.context-search {
    height: calc(var(--card-height) - var(--card-footer-height));
    overflow-y: hidden;
  }

  &.collapsed {
    height: var(--card-header-height);
  }

  main {
    min-height: var(--card-main-height);
    margin-bottom: var(--card-footer-height);
    // padding: 0 var(--spacing);

    section + section {
      margin-top: var(--spacing);
    }
  }
}
</style>
