<template>
  <div v-if="card" class="card" ref="my_card" :style="colors"
    v-drag="{id, mode: 'move', customDragImage: context === 'canvas', handler (e) {$emit('drag', e)}, width: scale * 320, height: scale * (collapsed ? 112 : 420)}"
    v-drop="{disabled: !allowDrop, value: id, dropEffect: 'move', handler (e) {$emit('addProp', e)}}"
    @mouseover="cardHover = true" @mouseleave="cardHover = false">
    <div class="header" @mouseover="hover = true" @mouseleave="hover = false">
        <h1 class="label" ref="my_label" v-bind:class = "{ 'slide-right' : widthLabel > widthCard - 20 && hover === true}">{{ card.label }}</h1>
        <h2>{{ card.type }}</h2>
      <!-- <ol  class="falafel-menu">
        <li v-for="index in 3" :key="index"></li>
      </ol> -->
    </div>
    <div class="content" v-if="!collapsed" >
      <div class='carousel'>
        <transition :name="transitionName">
        <div v-if="currentSlide === 0" class="image" key=1>Image</div>
        <div v-else-if="currentSlide === 1" class="properties" key=2>
          <div class="container" v-for="(prop, i) in card.props" :key="i">
            <p class="propName">{{ prop.propLabel }}</p>
            <p class="item" v-drag="{mode: 'connect', doc: id, prop: prop.prop, handler (e) {$emit('drag', e)}}">+</p>
            <p class="propValue" @click="$emit('removeProp', {doc: id, prop: prop.prop, value: prop.value})">{{ prop.valueLabel || prop.value }} </p>
          </div>
        </div>
        <div v-else class="description" key=3>{{ card.description }}</div>
        </transition>
      </div>
    </div>
    <div class="footer">
      <svg @click="$emit('toggleCollapse')" :class="{ collapsed, visible: cardHover }" class="toggleButton" ><g><path d="M-8,5.5 L0,-2.5 L8,5.5" /></g></svg>
      <ol v-if="!collapsed" class="carousel-indicators">
        <li v-for="(item, index) in ['a', 'b', 'c']" :key="index" @click="slide(index)" :class="{ active: currentSlide === index }"></li>
      </ol>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import drag from '@/assets/js/directives/drag'
import drop from '@/assets/js/directives/drop'
export default {
  name: 'BaseCard',
  directives: {
    drag,
    drop
  },
  emits: ['drag', 'toggleCollapse', 'addProp', 'removeProp'],
  props: {
    id: String,
    collapsed: Boolean,
    pane: String,
    context: String,
    scale: Number,
    allowDrop: Boolean
  },
  data () {
    return {
      // card: null,
      // entityType: null,
      widthLabel: 0,
      widthCard: 0,
      isCollapsed: true,
      currentSlide: 1,
      transitionName: 'slide-next',
      hover: false,
      cardHover: false
    }
  },
  computed: {
    ...mapGetters('data', [
      'getType', 'getEntity'
    ]),
    colors () {
      if (this.entityType?.background == null) return
      const { background, text, light } = this.entityType
      return {
        '--background': `var(--${background}-${light ? 8 : 2})`,
        '--text': `var(--${text}-${light ? 2 : 8})`
      }
    },
    card () {
      return this.getEntity(this.id)
    },
    entityType () {
      return this.getType(this.card.typeId)
    }
  },
  async mounted () {
    await this.fetchEntity(this.id)
    // in some cases BaseCard is already unmounted here and getType is undefined
    if (this.getType === undefined) return
    this.$nextTick(() => {
      this.calcWidthOfLabel()
      this.calcWidthOfCard()
    })
  },
  methods: {
    ...mapActions('data', [
      'fetchEntity'
    ]),
    calcWidthOfLabel () {
      this.widthLabel = this.$refs.my_label.getBoundingClientRect().width
    },
    calcWidthOfCard () {
      this.widthCard = this.$refs.my_card.getBoundingClientRect().width
    },
    slide (slides) {
      this.transitionName = slides < this.currentSlide ? 'slide-prev' : 'slide-next'
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
  width: 320px;
  padding: var(--spacing) 0px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}
.header {
  justify-content: space-between;
  height: 80px;
  line-height: 1.1;
  margin: 0 var(--spacing-xl) 0 var(--spacing);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
@keyframes slide-right { from { margin-left: 100%; width: 100%; }
  to {margin-left: -130%; width: 100%;} }

.content {
  height: 300px;
  padding-top: 25px;
}
.image {
  background: gray;
  height: 100px;
  width: 100%;
  padding: 0px var(--spacing);
}
.description {
  height: 100px;
  margin: 0px var(--spacing);
  }
.properties {
  width: 100%;
  .container {
    display:grid;
    grid-template-columns:30% 10% 60%;
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
  height:18px;
  li {
    margin: 0px 3px;
    width: 7.5em;
    height: 0.15em;
    border-radius: 10%;
    background-color: rgba(255, 255, 255, 0.5);
    display: inline-flex;
    cursor: default;
&.active, &:hover {
    background-color: #fff;
     }}
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
              transition:opacity 1s;
          }}}
           &.collapsed {
            g {
              path {
                transform: rotate(180deg);
              }
            }
        }
        }

</style>
