<template>
  <div class="card"  ref="my_card" :style="colors">
    <div class="header">
      <h1 class="label" ref="my_label" v-bind:class = "{ 'slide-right' : widthLabel > widthCard}">{{ card.label }}</h1>
      <h2>{{ card.type }}</h2>
    </div>
    <div class="content" v-if="!isCollapsed" >
      <div class='carousel'>
        <transition :name="transitionName">
        <div v-if="currentSlide === 1" class="image" key=1>Image</div>
        <div v-else-if="currentSlide === 2" class="properties" key=2>
          <div class="container" v-for="(value, name, index) in card.props" :key="`${ key }-${ index }`">
            <p class="item">{{ name }}</p>
            <p class="item">+</p>
            <p class="item">{{ value }} </p>
          </div>
        </div>
        <div v-else class="description" key=3>{{ card.description }}</div>
        </transition>
      </div>
      <ol class="carousel-indicators">
        <li v-for="index in 3" :key="index" @click="slide(index)" :class="{ active: currentSlide === index }"></li>
      </ol>
    </div>
    <div class="footer">
      <div class="toggleButton" @click="collapse">{{collapsedButton}}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'BaseCard',
  props: {
    id: String,
    collapsed: Boolean,
    pane: String
  },
  data () {
    return {
      widthLabel: 0,
      widthCard: 0,
      isCollapsed: true,
      collapsedButton: 'expand',
      currentSlide: 1,
      transitionName: 'slide-next'
    }
  },
  computed: {
    ...mapGetters('data', [
      'getCard'
    ]),
    card () {
      return this.getCard(this.id)
    },
    colors () {
      const { background, text, light } = this.card.style
      return {
        '--background': `var(--${background}-${light ? 8 : 2})`,
        '--text': `var(--${text}-${light ? 2 : 8})`
      }
    }
  },
  mounted () {
    this.calcWidthOfLabel()
    this.calcWidthOfCard()
  },
  methods: {
    calcWidthOfLabel () {
      this.widthLabel = this.$refs.my_label.getBoundingClientRect().width
    },
    calcWidthOfCard () {
      this.widthCard = this.$refs.my_card.getBoundingClientRect().width
    },
    collapse () {
      this.isCollapsed = !this.isCollapsed
      this.collapsedButton = this.isCollapsed ? 'expand' : 'collapse'
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
  background: var(--background);
  color: var(--text);
  position: absolute;
  width: 320px;
  padding: var(--spacing);
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}
.header {
  height: 80px;
  line-height: 1.1;
  white-space: nowrap;

}
.label {
  display: inline;
  }
.slide-right {
  animation: 10s slide-right infinite;
}
@keyframes slide-right { from { margin-left: 100%;width: 300%; }
  to {margin-left: -130%;width: 100%;} }

.content {
  height: 300px;
  padding-top: 25px;
}
.image {
  background: gray;
  height: 100px;
  width: 100%;
}
.description {
  background: red;
  height: 100px;
  width: 100%;
  }
.properties {
  width: 100%;
  .container {
    display:grid;
    grid-template-columns:30% 10% 60%;
    align-items: start;
    border-bottom: 0.8px solid #fff;
    padding: 2px;
  &:first-child {
    border-top: 0.8px solid #fff;
  }
  }
}
.footer {
  display: flex;
}
.toggleButton {
  margin-left: auto;
}
.content {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
}
.carousel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: relative;
}

.carousel-indicators {
  li {
      margin: 20px 3px 0px 3px;
      width: 0.8em;
      height: 0.8em;
      border-radius: 100%;
      border-color: white;
      border-width: 1px;
      border-style: solid;
      display: inline-flex;
      cursor: default;
&.active, &:hover {
      background-color: #fff;
      }}
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
</style>
