<template>
  <div class="container" v-resize="s => size = s" ref="container">
    <svg width="100%" height="100%">
      <defs>
        <pattern id="bg" v-bind="pattern" patternUnits="userSpaceOnUse">
          <path class="cross" d="M-4,-4L4,4M-4,4L4,-4" :transform="`translate(${pattern.width / 2} ${pattern.height / 2})`"/>
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)"></rect>
      <g :transform="transform">
        <CanvasEdge
          v-for="edge in edges"
          :key="`${edge.source}/${edge.target}`"
          v-bind="edge"
          :stroke-width="1 / transform.k" />
      </g>
    </svg>
    <div class="cards" :style="{transform: transformString}">
      <BaseCard
        v-for="card in cards"
        :key="card.id"
        v-bind="card"
        :style="{transform: `translate(${card.pos[0]}px, ${card.pos[1]}px)`}"
        @toggleCollapse="toggleCollapse(card.id)" />
    </div>
    <CanvasControls
      @zoom-in="zoomIn()"
      @zoom-out="zoomOut()"
      @zoom-to-fit="zoomToFit()"
      :min="transform.k === scaleExtent[0]"
      :max="transform.k === scaleExtent[1]"/>
  </div>
</template>

<script>
import { zoom, zoomIdentity } from 'd3-zoom'
import { select } from 'd3-selection'
import { mapActions, mapGetters, mapState } from 'vuex'

import BaseCard from '@/components/BaseCard.vue'
import CanvasControls from '@/components/CanvasControls.vue'
import CanvasEdge from '@/components/CanvasEdge.vue'

export default {
  name: 'CanvasContainer',
  components: {
    CanvasControls,
    BaseCard,
    CanvasEdge
  },
  data () {
    return {
      size: { width: 0, height: 0 },
      transform: zoomIdentity,
      zoom: null,
      scaleExtent: [0.1, 2],
      cardWidth: 280,
      cardHeight: 420,
      safeArea: [82, 20, 20, 20],
      transition: 400,
      container: null
    }
  },
  mounted () {
    this.container = select(this.$refs.container)
    this.initZoom()
  },
  computed: {
    ...mapState('view', [
      'cards'
    ]),
    ...mapGetters('view', [
      'edges'
    ]),
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
    },
    boundingRect () {
      const x = this.cards.map(card => card.pos[0])
      const y = this.cards.map(card => card.pos[1])
      return [
        [Math.min(...x), Math.min(...y)],
        [Math.max(...x), Math.max(...y)]
      ]
    }
  },
  methods: {
    ...mapActions('view', ['toggleCollapse']),
    initZoom () {
      this.zoom = zoom()
        .scaleExtent(this.scaleExtent)
        .on('zoom', e => { this.transform = e.transform })
        .filter(e => !e.button && !(e.type === 'wheel' && !e.ctrlKey && !e.shiftKey))
      this.container.call(this.zoom).on('dblclick.zoom', null)
    },
    zoomIn () {
      this.container.transition().duration(this.transition).call(this.zoom.scaleBy, 2)
    },
    zoomOut () {
      this.container.transition().duration(this.transition).call(this.zoom.scaleBy, 0.5)
    },
    zoomToFit () {
      const { boundingRect, size, cardWidth, cardHeight, safeArea, transition, scaleExtent } = this
      const center = [
        (boundingRect[0][0] + boundingRect[1][0] - cardWidth) / 2,
        (boundingRect[0][1] + boundingRect[1][1] - cardHeight) / 2
      ]
      const dims = [
        (boundingRect[1][0] + cardWidth - boundingRect[0][0]),
        (boundingRect[1][1] + cardHeight - boundingRect[0][1])
      ]
      const safeHeight = size.height - safeArea[0] - safeArea[2]
      const safeWidth = size.width - safeArea[1] - safeArea[3]
      const scale = Math.max(Math.min(safeWidth / dims[0], safeHeight / dims[1], scaleExtent[1]), scaleExtent[0])

      this.container.transition().duration(transition).call(
        this.zoom.transform,
        zoomIdentity
          .translate(safeWidth / 2 + safeArea[3], safeHeight / 2 + safeArea[0])
          .scale(scale)
          .translate(...center)
      )
    }
    // toggleCollapse (id) {
    //   console.log(id)
    // }
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
  }
}
</style>
