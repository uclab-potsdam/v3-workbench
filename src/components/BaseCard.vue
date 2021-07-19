<template>
  <div v-if="card" class="card" ref="my_card" :style="colors" v-drag="{id, hideDragImage: context === 'canvas', handler (e) {$emit('dragstart', e)}}">
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
        <div v-if="currentSlide === 1" class="image" key=1>Image</div>
        <div v-else-if="currentSlide === 2" class="properties" key=2>
          <div class="container" v-for="(prop, i) in card.props" :key="i">
            <p class="propName">{{ prop.propLabel }}</p>
            <p class="item">+</p>
            <p class="propValue">{{ prop.valueLabel || prop.value }} </p>
          </div>
        </div>
        <div v-else class="description" key=3>{{ card.description }}</div>
        </transition>
      </div>
    </div>
    <div class="footer">
      <ol v-if="!collapsed" class="carousel-indicators">
        <li v-for="index in 3" :key="index" @click="slide(index)" :class="{ active: currentSlide === index }"></li>
      </ol>
      <div class="toggleButton" @click="$emit('toggleCollapse')">{{collapsedButton}}</div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import drag from '@/assets/js/directives/drag'
export default {
  name: 'BaseCard',
  directives: {
    drag
  },
  emits: ['dragstart'],
  props: {
    id: String,
    collapsed: Boolean,
    pane: String,
    context: String
  },
  data () {
    return {
      card: null,
      entityType: null,
      widthLabel: 0,
      widthCard: 0,
      isCollapsed: true,
      currentSlide: 1,
      transitionName: 'slide-next',
      hover: false
    }
  },
  computed: {
    ...mapGetters('data', [
      'getType'
    ]),
    colors () {
      if (this.entityType == null) return
      const { background, text, light } = this.entityType
      return {
        '--background': `var(--${background}-${light ? 8 : 2})`,
        '--text': `var(--${text}-${light ? 2 : 8})`
      }
    },
    collapsedButton () {
      return this.collapsed ? 'expand' : 'collapse'
    }
  },
  async mounted () {
    this.card = await this.getCard(this.id)
    this.entityType = this.getType(this.card.typeId)
    this.$nextTick(() => {
      this.calcWidthOfLabel()
      this.calcWidthOfCard()
    })
  },
  methods: {
    ...mapActions('data', [
      'getCard'
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
  justify-content: space-between;
  align-items: center;
}
.toggleButton {
  margin-left: auto;
}
.carousel-indicators {
  li {
    margin: 0px 3px;
      width: 1.1em;
      height: 0.2em;
      border-radius: 10%;
      background-color: rgba(255, 255, 255, 0.5);
      display: inline-flex;
      cursor: default;
&.active, &:hover {
      background-color: #fff;
      }}
}
</style>
