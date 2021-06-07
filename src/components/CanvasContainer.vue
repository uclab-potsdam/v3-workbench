<template>
  <div class="container" v-resize="s => size = s" ref="svg">
    <svg width="100%" height="100%">
      <defs>
        <pattern id="bg" v-bind="pattern" patternUnits="userSpaceOnUse">
          <path class="cross" d="M-4,-4L4,4M-4,4L4,-4" :transform="`translate(${pattern.width / 2} ${pattern.height / 2})`"/>
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)"></rect>
      <g :transform="transform">
        <!-- edges -->
      </g>
    </svg>
    <div class="cards" :style="{transform: transformString}">
      <BaseCard
        v-for="card in cards"
        :key="card.id"
        v-bind="card" />
    </div>
  </div>
</template>

<script>
import { zoom } from 'd3-zoom'
import { select } from 'd3-selection'

import BaseCard from '@/components/BaseCard.vue'

import cards from '@/assets/data/mock.json'

export default {
  name: 'CanvasContainer',
  components: {
    BaseCard
  },
  data () {
    return {
      size: { width: 0, height: 0 }, // not used atm, maybe necessary for a fit to view function
      transform: { k: 1, x: 0, y: 0 },
      cards
    }
  },
  mounted () {
    this.initZoom()
  },
  computed: {
    pattern () {
      if (this.transform == null) return
      const scale = this.transform.k
      return {
        width: 140 * scale,
        height: 140 * scale,
        x: this.transform.x,
        y: this.transform.y
      }
    },
    transformString () {
      const { x, y, k } = this.transform
      return `translate(${x}px, ${y}px) scale(${k})`
    }
  },
  methods: {
    initZoom () {
      // Init D3 zoom
      const z = zoom()
        .scaleExtent([0.2, 2])
        .on('zoom', e => {
          this.transform = e.transform
        })
        .filter((e, a, b) => {
          return (
            !e.button &&
            !(e.type === 'wheel' && !e.ctrlKey && !e.shiftKey)
          )
        })
      select(this.$refs.svg).call(z).on('dblclick.zoom', null)
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  svg {
    display: block;

    #bg {
      .cross {
        stroke: var(--border);
      }
    }
  }

  .cards {
    position: absolute;
    transform-origin: top left;
    top: 0;
    width: 100%;
    height: 100%;

    // pointer-events: none;
    > * {
      pointer-events: all;
    }
  }
}
</style>
