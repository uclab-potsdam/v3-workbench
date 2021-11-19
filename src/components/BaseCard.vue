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
    <header draggable="true" @mouseover="hover = true" @mouseleave="hover = false" @click="$emit('toggleCollapse')">
      <h2
        class="label"
        ref="my_label"
        v-bind:class="{
          'slide-right': widthLabel > widthCard - 20 && hover === true,
        }"
      >
        <span>{{ card.label }}</span>
      </h2>
      <h3>{{ entityType?._metadata?.label }}</h3>
    </header>
    <main v-if="!collapsed">
      <section class="cover" v-if="cover != null">
        <img :src="`${fileServer}/${cover.path}`"/>
      </section>
      <section class="property" v-for="(prop, i) in props" :key="i">
        <p class="propName">{{ prop.label }}</p>
        <p
          class="item"
          v-drag="{
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
            color: '--blue-9',
            height: scale * 32,
            circle: true
          }"
        >
          +
        </p>
          <p
            class="propValue"
            v-for="(value, i) in prop.value"
            :key="i"
            v-drag="{
              _id: value,
              mode: 'move',
              customDragImage: true,
              handler(e) {
                $emit('drag', e);
              },
              width: scale * 180,
              color: '--blue-gray-8',
              height: scale * (collapsed ? 112 : 420)
            }"
            @click="
              $emit('removeProp', {
                _id,
                prop: prop._id,
                value: value
              })
            "
          >
            {{ value }}
          </p>
        </section>
      </main>
    <footer v-if="!collapsed"></footer>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import drag from '@/assets/js/directives/drag'
import drop from '@/assets/js/directives/drop'
export default {
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
      // card: null,
      cover: null,
      // entityType: null,
      widthLabel: 0,
      widthCard: 0,
      isCollapsed: true,
      currentSlide: 0,
      transitionName: 'slide-next',
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
      // console.log('fetched', card)
      return card
    },
    // cover () {
    //   if (this.card.cover == null) return null
    //   console.log('getting image', this.card.cover)
    //   return this.getEntity(this.card.cover)
    // },
    entityType () {
      return this.getType(this.card._type)
    },
    // cover () {
    //   this
    // },
    props () {
      // console.log(this.entityType)
      if (this.entityType == null) return []
      const props = []
      for (const prop in this.entityType) {
        // don't display terminus (_) or hidden properties
        if (prop.match(/^_/) == null && !this.entityType._metadata._properties[prop]?.hidden) {
          const value = [this.card[prop]].flat().map(id => this.getLabel(id))
          props.push({
            _id: prop,
            label: prop, // TODO replace with actual label
            value,
            ...this.entityType[prop]
          })
        }
      }
      return props
      // return this.entityType.props.map((prop) => {
      //   return {
      //     ...prop,
      //     values: this.card.props
      //       .filter((p) => p.prop === prop.id)
      //       .map((v) => ({
      //         raw: v.value,
      //         label: v.valueLabel || v.value
      //       }))
      //   }
      // })
    }
  },
  async mounted () {
    const card = await this.fetchEntity(this._id)
    // this.card = await this.fetchEntity(this._id)
    this.cover = card.cover ? await this.fetchEntity(card.cover) : null
  },
  methods: {
    ...mapActions('data', ['fetchEntity']),
    // ...mapActions('api', ['getEntity']),
    calcWidthOfLabel () {
      this.widthLabel = this.$refs.my_label.getBoundingClientRect().width
    },
    calcWidthOfCard () {
      this.widthCard = this.$refs.my_card.getBoundingClientRect().width
    },
    slide (slides) {
      this.transitionName =
        slides < this.currentSlide ? 'slide-prev' : 'slide-next'
      this.currentSlide = slides
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
  justify-content: space-between;
  flex-direction: column;
  &:hover {
    z-index: 1;
    .image {
      .cover {
        // filter: unset;
        // mix-blend-mode: normal;
        // transition: filter .4s;
      }
    }
  }
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
  // text-overflow: ellipsis;

  * {
    pointer-events: none;
  }
}
.falafel-menu {
  li {
    margin: 3px 3px;
    width: 0.4em;
    height: 0.4em;
    border-radius: 100%;
    background-color: rgb(255, 255, 255);
    display: flex;
    cursor: default;
  }
}
.label {
  display: inline;
}
.slide-right {
  animation: 10s -4.5s slide-right infinite;
  animation-timing-function: linear;
}
@keyframes slide-right {
  from {
    margin-left: 100%;
    width: 100%;
  }
  to {
    margin-left: -130%;
    width: 100%;
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
  .cover {
    display: flex;
    justify-content: center;
    img {
      mix-blend-mode: var(--blend-mode);
      // mix-blend-mode: screen;
      filter: grayscale(1);
      max-width: 100%;
      max-height: 180px;
    }
  }
}

footer {
  height: 20px;
}

.image {
  height: 100%;
  width: 100%;
  padding: 0px var(--spacing);

  .cover {
    background: center center no-repeat;
    background-size: contain;
    width: 100%;
    height: 100%;
    filter: grayscale(1);
    mix-blend-mode: multiply;
  }
}
.description {
  height: 100px;
  margin: 0px var(--spacing);
}
.properties {
  width: 100%;
}
.propValue {
  font-weight: var(--bold);
}
.content {
  display: flex;
  align-items: flex-start;
}
.carousel {
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

/* GO TO NEXT SLIDE */

.slide-next-enter-active,
.slide-next-leave-active {
  position: absolute;
  transition: transform 0.3s ease-in-out;
}
.slide-next-enter-from {
  transform: translate(100%);
}
.slide-next-leave-to {
  transform: translate(-100%);
}

/* GO TO PREVIOUS SLIDE */
.slide-prev-enter-active,
.slide-prev-leave-active {
  position: absolute;
  transition: transform 0.3s ease-in-out;
}
.slide-prev-enter-from {
  transform: translate(-100%);
}
.slide-prev-leave-to {
  transform: translate(100%);
}
.toggleButton {
  margin-left: auto;
}

svg {
  width: 20px;
  height: 12px;
  margin-right: 3px;
  g {
    transform: translate(11px, 6px);
    path {
      opacity: 0;
      transition: opacity 1s;
      stroke: white;
      stroke-width: 1.5;
      fill: none;
      transform: rotate(0deg);
      transition: transform 0.5s, stroke 0.5s;
    }
  }
  &.visible {
    g {
      path {
        opacity: 1;
        transition: opacity 1s;
      }
    }
  }
  &.collapsed {
    g {
      path {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
