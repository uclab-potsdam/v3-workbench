<template>
  <div v-if="card" class="card"
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
    <CardHeader :label="card.label" :doctype="entityType?._metadata?.label" @click="$emit('toggleCollapse')"/>
    <main v-if="!collapsed">
      <card-cover v-if="cover != null" :path="cover.path"/>
      <card-property v-for="(prop, i) in props" :key="i" :prop="prop" :entity="_id"/>
    </main>
    <card-footer v-if="!collapsed && context !== 'search'">
       <icon @click="onRemoveCard" scale="1" data="@icon/remove.svg"/>
    </card-footer>
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
      cover: null,
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
      if (this.entityType?._metadata?.background == null) return
      const { background, text } = this.entityType._metadata
      return {
        '--primary': `var(--${text}-9)`,
        '--secondary': `var(--${background}-2)`
      }
    },
    card () {
      const card = this.getEntity(this._id)
      return card
    },
    entityType () {
      return this.getType(this.card._type)
    },
    props () {
      if (this.entityType == null) return []
      const props = []
      for (const prop in this.entityType) {
        // don't display terminus (_) or hidden properties
        if (prop.match(/^_/) == null && !this.entityType._metadata._properties[prop]?.hidden) {
          const value = [this.card[prop]].flat().map(id => this.getLabel(id)).filter(d => d != null)
          props.push({
            _id: prop,
            label: this.entityType._metadata?._properties[prop]?.label || prop,
            value,
            ...this.entityType[prop]
          })
        }
      }
      return props
    }
  },
  async mounted () {
    const card = await this.fetchEntity(this._id)
    this.cover = card.cover ? await this.fetchEntity(card.cover) : null
  },
  methods: {
    ...mapActions('data', ['fetchEntity', 'addProp']),
    ...mapActions('view', ['removeCard']),
    onDrop ({ detail }) {
      this.addProp([detail.data.sub, detail.data.prop, detail.obj])
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

  header {
    display: flex;
    flex-direction: column;
    padding: var(--spacing);
    justify-content: center;
    justify-content: center;
    height: var(--card-header-height);
    position: sticky;
    top: 0;
    white-space: nowrap;
    overflow: hidden;
    z-index: 1;
  }

  main {
    min-height: var(--card-main-height);
    padding: 0 var(--spacing);

    section + section {
      margin-top: var(--spacing);
    }
  }
}
</style>
