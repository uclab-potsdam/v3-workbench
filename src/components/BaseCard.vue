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
      height: scale * (collapsed ? 112 : 420),
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
    <div class="header" draggable="true" @mouseover="hover = true" @mouseleave="hover = false" @click="$emit('toggleCollapse')">
      <h1
        class="label"
        ref="my_label"
        v-bind:class="{
          'slide-right': widthLabel > widthCard - 20 && hover === true,
        }"
      >
        {{ card.label }}
      </h1>
      <h2>{{ entityType?._metadata?.label }}</h2>
      <!-- <ol  class="falafel-menu">
        <li v-for="index in 3" :key="index"></li>
      </ol> -->
    </div>
    <div class="content" v-if="!collapsed">
      <div class="carousel">
        <transition :name="transitionName">
          <div v-if="currentSlide === 0" class="image" key="1">
            <div
              v-if="cover"
              class="cover"
              :style="{
                'background-image': `url('${fileServer}${cover.path}')`,
              }"
            />
          </div>
          <div v-else-if="currentSlide === 1" class="properties" key="2">
            <div class="container" v-for="(prop, i) in props" :key="i">
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
              <template v-if="prop._type === 'Set' || prop._type === 'List'">
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
              </template>
              <p v-else
                  class="propValue"
                  v-drag="{
                    _id: prop.value,
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
                      value: prop.value
                    })
                  "
                >
                  {{ prop.value }}
                </p>
            </div>
          </div>
          <div v-else class="description" key="3">{{ card.description }}</div>
        </transition>
      </div>
    </div>
    <div class="footer">
      <svg
        @click="$emit('toggleCollapse')"
        :class="{ collapsed, visible: cardHover }"
        class="toggleButton"
      >
        <g><path d="M-8,5.5 L0,-2.5 L8,5.5" /></g>
      </svg>
      <ol v-if="!collapsed" class="carousel-indicators">
        <li
          v-for="(item, index) in ['a', 'b', 'c']"
          :key="index"
          @click="slide(index)"
          :class="{ active: currentSlide === index }"
        ></li>
      </ol>
    </div>
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
    ...mapGetters('data', ['getType', 'getEntity']),
    colors () {
      if (this.entityType?._metadata?.background == null) return
      const { background, text, light } = this.entityType._metadata
      return {
        '--background': `var(--${background}-${light ? 10 : 3})`,
        '--text': `var(--${text}-${light ? 3 : 9})`
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
        if (prop.match(/^_/) == null) {
          props.push({
            _id: prop,
            label: prop, // TODO replace with actual label
            value: this.card[prop],
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
  --background: var(--gray-2);
  --text: var(--gray-8);
  background: var(--background);
  color: var(--text);
  width: 180px;
  padding: var(--spacing) 0px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  &:hover {
    z-index: 1;
    .image {
      .cover {
        filter: unset;
        // mix-blend-mode: normal;
        transition: filter .4s;
      }
    }
  }
}
.header {
  justify-content: space-between;
  height: 60px;
  line-height: 1.1;
  margin: 0 var(--spacing) 0 var(--spacing);
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

.content {
  height: 300px;
  padding-top: 25px;
  overflow: auto;
}
.image {
  // background: gray;
  height: 100%;
  width: 100%;
  padding: 0px var(--spacing);

  .cover {
    background: center center no-repeat;
    background-size: contain;
    width: 100%;
    height: 100%;
    filter: grayscale(1);
    mix-blend-mode: screen;
  }
}
.description {
  height: 100px;
  margin: 0px var(--spacing);
}
.properties {
  width: 100%;
  .container {
    display: grid;
    grid-template-columns: 30% 10% 60%;
    align-items: flex-start;
    border-bottom: 0.7px solid #fff;
    padding: 5px var(--spacing);
    &:first-child {
      border-top: 1px solid #fff;
    }
  }
}
.propValue {
  background: rgba(255, 255, 255, 0.3);
  padding: 0px 5px;
  border-radius: 8px;
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
.footer {
  display: flex;
  padding: 0px var(--spacing);
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.toggleButton {
  margin-left: auto;
}
.carousel-indicators {
  // height: 18px;
  li {
    margin: 0px 3px;
    width: 7.5em;
    height: var(--spacing-s);
    // border-radius: 10%;
    background-color: rgba(255, 255, 255, 0.5);
    display: inline-flex;
    cursor: default;
    &.active,
    &:hover {
      background-color: #fff;
    }
  }
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
