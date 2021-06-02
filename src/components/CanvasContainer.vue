<template>
  <div class="container" v-resize="s => size = s">
    <svg width="100%" height="100%" ref="svg">
      <defs>
        <pattern id="bg" v-bind="pattern" patternUnits="userSpaceOnUse">
          <path class="cross" d="M-4,-4L4,4M-4,4L4,-4" :transform="`translate(${pattern.width / 2} ${pattern.height / 2})`"/>
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)"></rect>
      <g :transform="transform">
        <slot/>
      </g>
    </svg>
  </div>
</template>

<script>
import { zoom } from 'd3-zoom'
import { select } from 'd3-selection'
export default {
  name: 'CanvasContainer',
  data () {
    return {
      size: { width: 0, height: 0 }, // not used atm, maybe necessary for a fit to view function
      transform: { k: 1, x: 0, y: 0 }
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
        width: 100 * scale,
        height: 100 * scale,
        x: this.transform.x,
        y: this.transform.y
      }
    }
  },
  methods: {
    initZoom () {
      // Init D3 zoom
      const z = zoom()
        .scaleExtent([0.5, 10])
        .on('zoom', e => {
          this.transform = e.transform
        })
        .filter(e => {
          // console.log(e)
          // return !e.ctrlKey && !e.button
          return !(
            e.ctrlKey ||
            e.button ||
            (e.type === 'wheel' && !e.shiftKey)
          )
        })

      z(select(this.$refs.svg))
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/style/global";
.container {
  flex-direction: column;
  width: 100%;
  height: 100%;

  svg {
    display: block;

    #bg {
      .cross {
        stroke: $border;
      }
    }
  }
}
</style>
