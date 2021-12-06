<template>
  <!-- <teleport to="#drag-layer" :disabled="!dragActive"> -->
  <!-- <InteractionDrag :trigger="$refs.header"> -->
  <div
    v-if="card"
    class="card"
    ref="card"
    :style="{...colors, transform}"
    v-drop="{
      filter: ['connect'],
      obj: _id,
    }"
    @dropped="onDrop"
    v-drag="{
      mode: 'move-card',
      trigger: '.drag-trigger',
      data: {
        _id
      }
    }"
    @mouseover="cardHover = true"
    @mouseleave="cardHover = false"
  >
    <header ref="header" @cat="cat"
    class="drag-trigger traverse-label-trigger" @click="$emit('toggleCollapse')">
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
          <!-- <div class="icon-wrap"> -->
            <icon v-drag="{
              mode: 'connect',
              data: {
                sub: _id,
                prop: prop._id,
              }
            }" scale="1" data="@icon/property-add.svg"/>
          <!-- </div> -->
        </div>
        <div
          class="value"
          v-for="(value, i) in prop.value"
          :key="i">
          <div class="overflow-wrap">
            <BaseTraverseLabel>{{ value.label }}</BaseTraverseLabel>
          </div>
          <icon v-drag="{
            mode: 'move-card',
            data: {
              _id: value._id
            }
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
    <footer v-if="!collapsed">
       <icon @click="onRemoveCard" scale="1" data="@icon/remove.svg"/>
    </footer>

  </div>
  <!-- </InteractionDrag> -->
<!-- </teleport> -->
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
      cardHover: false,
      dragActive: false
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
    ...mapActions('data', ['fetchEntity', 'addProp']),
    ...mapActions('view', ['removeCard']),
    onDragStart (e) {
      this.dragActive = true
      // console.log('DRAG START')/
    },
    onDrag (e) {
      // console.log('DRAG)
    },
    onDragEnd (e) {
      this.dragActive = false
      // console.log('DRAG END')
    },
    cat (a, b, c) {
      // console.log('CAT', a, b, c)
    },
    onDrop ({ detail }) {
      console.log([detail.data.sub, detail.data.prop, detail.obj])
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
  height: 40px;
  padding: var(--spacing);
  background: var(--secondary);
  color: var(--primary);

  @media (prefers-color-scheme: dark) {
    background: var(--primary);
    color: var(--secondary);
  }
}
</style>
