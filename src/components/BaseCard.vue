<template>
  <div class="card"
    :class="{ collapsed, 'context-search': context === 'search', note: isNote }" :style="{...colors, transform}"
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
      <card-note v-if="isNote" :entity="_id" :prop="properties.find(d => d._id === 'text')"/>
      <card-property v-for="(prop, i) in properties" :key="i"
        :prop="prop" :represents="_id"/>
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
import CardNote from './CardNote.vue'
export default {
  components: { CardHeader, CardFooter, CardProperty, CardCover, CardNote },
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
      dragActive: false
    }
  },
  computed: {
    ...mapState('config', ['fileServer']),
    ...mapGetters('data', ['getType', 'getEntity', 'getLabel']),
    colors () {
      if (this.doctype?.secondary == null) return
      const { secondary, primary } = this.doctype
      return {
        '--primary': `var(--${primary}-2)`,
        '--secondary': `var(--${secondary}-9)`
      }
    },
    isNote () {
      return this.doctype?._id === 'Note'
    }
  },
  methods: {
    ...mapActions('data', ['addProp']),
    ...mapActions('view', ['removeCard']),
    onDrop (e) {
      const { detail } = e
      if (detail.data.sub == null || detail.data.prop == null) return
      e.stopPropagation()
      this.addProp([detail.data.sub, detail.data.prop, this._id])
    },
    toggleCollapse () {
      this.$emit('toggleCollapse')
    },
    onRemoveCard () {
      this.removeCard(this.cardId)
    }
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
  // @media (prefers-color-scheme: dark) {
  //   background: rgb(var(--primary));
  //   color: rgb(var(--secondary));
  // }
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
  // &.note {
  //   height: var(--card-width);
  // }

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
