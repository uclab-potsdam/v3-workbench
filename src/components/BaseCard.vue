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
    <header class="drag-trigger traverse-label-trigger blur" @click="$emit('toggleCollapse')">
      <BaseTraverseLabel root="h2">
        {{ card.label }}
      </BaseTraverseLabel>
      <h3>{{ entityType?._metadata?.label }}</h3>
    </header>
    <main v-if="!collapsed">
      <section class="cover" v-if="cover != null">
        <img :src="`${fileServer}/${cover.path}`"/>
      </section>
      <section class="property" v-for="(prop, i) in props" :key="i">
        <div class="label">
          <div class="overflow-wrap">
            <BaseTraverseLabel>{{ prop.label }}</BaseTraverseLabel>
          </div>
          <icon scale="1" data="@icon/property-add.svg" v-drag="{
            mode: 'connect',
            data: {
              sub: _id,
              prop: prop._id,
            }
          }"/>
        </div>
        <div class="value" v-for="(value, i) in prop.value" :key="i">
          <div class="overflow-wrap">
            <BaseTraverseLabel>{{ value.label }}</BaseTraverseLabel>
          </div>
          <icon v-drag="{
            mode: 'move-card',
            data: { _id: value._id }
          }"
          scale="1" data="@icon/property-expand.svg"/>
        </div>
      </section>
    </main>
    <footer v-if="!collapsed && context !== 'search'" class="blur">
       <icon @click="onRemoveCard" scale="1" data="@icon/remove.svg"/>
    </footer>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import drag from '@/assets/js/directives/drag'
import drop from '@/assets/js/directives/drop'
import BaseTraverseLabel from './BaseTraverseLabel.vue'
export default {
  components: { BaseTraverseLabel },
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

    .cover {
      display: flex;
      justify-content: center;
      height: var(--card-main-height);
      background: rgb(var(--secondary));
      @media (prefers-color-scheme: dark) {
        background: rgb(var(--primary));
      }
      img {
        mix-blend-mode: var(--blend-mode);
        filter: grayscale(1);
        width: auto;
        height: auto;
        max-width: 100%;
        max-height: var(--card-main-height);
        object-fit: contain;
      }
    }

    .property {
      user-select: none;
      .label, .value {
        display: grid;
        grid-template-columns: 1fr calc(var(--spacing) + var(--spacing-s));
        gap: var(--spacing);
        .overflow-wrap {
          overflow: hidden
        }
      }
      .value {
        font-weight: var(--bold);
      }
    }
  }

  footer {
    height: var(--card-footer-height);
    padding: calc(var(--spacing-s) + var(--spacing-xs));
    position: sticky;
    bottom: 0;
  }

  .blur {
    background: rgb(var(--secondary));
    @media (prefers-color-scheme: dark) {
      background: rgb(var(--primary));
    }
    @supports ((-webkit-backdrop-filter:saturate(180%) blur(20px)) or (backdrop-filter:saturate(180%) blur(20px))) {
      background: rgba(var(--secondary), .5);
      @media (prefers-color-scheme: dark) {
        background: rgba(var(--primary), .5);
      }
      backdrop-filter: blur(7px);
    }
  }
}
</style>
