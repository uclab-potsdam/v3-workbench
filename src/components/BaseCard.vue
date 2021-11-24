<template>
  <div
    v-if="card"
    class="card"
    ref="my_card"
    :style="colors"
    v-drag="{
      _id,
      mode: 'move',
      customDragImage: context === 'canvas',
      handler(e) {
        $emit('drag', e);
      },
      width: scale * 180,
      height: scale * (collapsed ? 60 : 300),
    }"
    v-drop="{
      disabled: !allowDrop,
      value: _id,
      dropEffect: 'move',
      handler(e) {
        $emit('addProp', e);
      },
    }"
    @mouseover="cardHover = true"
    @mouseleave="cardHover = false"
  >
    <header class="traverse-label-trigger" draggable="true" @click="$emit('toggleCollapse')">
      <BaseTraverseLabel v-if="1" root="h2" parent-trigger>
        {{card.label}}
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
            <BaseTraverseLabel><p v-drag="{
            mode: 'connect',
            doc: _id,
            prop: prop._id,
            customDragImage: true,
            handler(e) {
              $emit('drag', e);
            },
            dragOverHandler(e) {
              $emit('setTempEdge', e);
            },
            dragEndHandler(e) {
              $emit('clearTempEdge');
            },
            width: scale * 32,
            color: '--accent',
            height: scale * 32,
            circle: true
          }">{{ prop.label }}</p></BaseTraverseLabel>
          </div>
          <icon scale="1" data="@icon/property-add.svg"/>
        </div>
        <div
          class="value"
          v-for="(value, i) in prop.value"
          :key="i">
          <div class="overflow-wrap">
            <BaseTraverseLabel>{{ value.label }}</BaseTraverseLabel>
          </div>
          <icon v-drag="{
            _id: value._id,
            mode: 'move',
            customDragImage: true,
            handler(e) {
              $emit('drag', e);
            },
            width: scale * 180,
            color: '--blue-gray-8',
            height: scale * (collapsed ? 112 : 420)
          }"
          x-click="
            $emit('removeProp', {
              _id,
              prop: prop._id,
              value: value
            })
          " scale="1" data="@icon/property-expand.svg"/>
        </div>
      </section>
    </main>
    <footer v-if="!collapsed"></footer>
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
  emits: ['drag', 'toggleCollapse', 'addProp', 'removeProp', 'setTempEdge', 'clearTempEdge'],
  props: {
    _id: String,
    collapsed: Boolean,
    pane: String,
    context: String,
    scale: Number,
    allowDrop: Boolean
  },
  data () {
    return {
      cover: null,
      widthLabel: 0,
      widthCard: 0,
      isCollapsed: true,
      hover: false,
      cardHover: false
    }
  },
  computed: {
    ...mapState('config', ['fileServer']),
    ...mapGetters('data', ['getType', 'getEntity', 'getLabel']),
    colors () {
      if (this.entityType?._metadata?.background == null) return
      const { background, text } = this.entityType._metadata
      // return {
      //   '--background': `var(--${background}-${light ? 10 : 3})`,
      //   '--text': `var(--${text}-${light ? 3 : 9})`
      // }
      // return {
      //   '--primary': `var(--${background}-10)`,
      //   '--secondary': `var(--${text}-3)`
      // }
      return {
        '--primary': `var(--${text}-3)`,
        '--secondary': `var(--${background}-10)`
        // '--primary-dark': `var(--${background}-10)`,
        // '--secondary-dark': `var(--${text}-3)`
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
            label: prop, // TODO replace with actual label
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
    ...mapActions('data', ['fetchEntity']),
    calcWidthOfLabel () {
      this.widthLabel = this.$refs.my_label.getBoundingClientRect().width
    },
    calcWidthOfCard () {
      this.widthCard = this.$refs.my_card.getBoundingClientRect().width
    }
  }
}
</script>

<style scoped lang="scss">
.card {
  background: var(--primary);
  color: var(--secondary);
  @media (prefers-color-scheme: dark) {
    background: var(--secondary);
    color: var(--primary);
  }
  width: 180px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &:hover {
    z-index: 1;
  }

  header {
  display: flex;
  flex-direction: column;
  padding: var(--spacing);
  justify-content: center;
  justify-content: center;
  height: 60px;

  white-space: nowrap;
  overflow: hidden;
  }
}

main {
  background: var(--secondary);
  color: var(--primary);

  @media (prefers-color-scheme: dark) {
    background: var(--primary);
    color: var(--secondary);
  }

  height: 220px;
  overflow: auto;
  padding: var(--spacing);

  section + section {
    margin-top: var(--spacing);
  }

  .cover {
    display: flex;
    justify-content: center;
    img {
      mix-blend-mode: var(--blend-mode);
      filter: grayscale(1);
      max-width: 100%;
      max-height: 180px;
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
      font-size: var(--font-size-l);
    }
  }
}

footer {
  background: var(--secondary);
  color: var(--primary);

  @media (prefers-color-scheme: dark) {
    background: var(--primary);
    color: var(--secondary);
  }
  height: 20px;
}
</style>
