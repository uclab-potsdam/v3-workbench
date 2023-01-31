<template>
  <g class="edge" :class="{local}">
    <!-- <path class="shadow" :d="path" :stroke-width="12"
      @mouseenter="showLabel = true" @mouseleave="showLabel = false"/> -->
    <!-- <path :d="path" :stroke-width="strokeWidth * 15"/> -->
    <path class="outline" :d="path" :stroke-width="17"/>
    <path :d="path" :id="`path-${pathId}`" :stroke-width="15"/>
    <text>
      <!-- <textPath class="shadow" :path="path" startOffset="50%" dominant-baseline="middle" :stroke-width="10">
        {{ label }}
      </textPath> -->
      <!-- <textPath :path="path" startOffset="50%" dominant-baseline="middle">
        {{ label }}
      </textPath> -->
      <textPath v-for="(l, i) in labels" :key="i" :href="`#path-${pathId}`" :startOffset="`${l}%`" dominant-baseline="middle">
        {{ i % 2 ? label.replaceAll('_', ' ') : arrow }}
      </textPath>
    </text>
  </g>
</template>

<script>
export default {
  name: 'CanvasEdge',
  props: {
    x1: Number,
    y1: Number,
    x2: Number,
    y2: Number,
    label: String,
    source: String,
    target: String,
    strokeWidth: Number,
    pathId: Number,
    prop: Object,
    local: Boolean
  },
  data () {
    return {
      showLabel: false
    }
  },
  computed: {
    labels () {
      const distance = Math.sqrt(Math.pow(this.x1 - this.x2, 2) + Math.pow(this.y1 - this.y2, 2))
      const occurances = Math.max(Math.floor(distance / 350), 1) * 2 + 1
      return '.'.repeat(occurances).split('').map((d, i) => 100 / (occurances + 1) * (i + 1))
    },
    arrow () {
      const positioning = this.inverse ? (this.x2 + 180) < this.x1 : (this.x1 + 180) < this.x2
      return positioning ? '→' : '←'
    },
    inverse () {
      return this.prop.metadata.inverse
    },
    path () {
      const x1 = (this.inverse ? this.x2 : this.x1) + 180
      const y1 = this.inverse ? this.y2 : this.y1
      const x2 = this.inverse ? this.x1 : this.x2
      const y2 = this.inverse ? this.y1 : this.y2
      return x1 < x2
        ? `M${x1},${y1}C${x1 + 100},${y1},${x2 - 100},${y2},${x2},${y2}`
        : `M${x2},${y2}C${x2 - 100},${y2},${x1 + 100},${y1},${x1},${y1}`
    }
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">
.edge {
  pointer-events: none;
  // mix-blend-mode: var(--blend-mode);
  path {
    stroke: var(--edges-label);
    fill: none;
    &.outline {
      stroke: var(--background);
      // pointer-events: all;
    }
  }
  text {
    text-anchor: middle;
    font-size: var(--font-size);
    fill: var(--edges);
  }
  &.local {
    path {
      stroke: var(--edges);
      &.outline {
         stroke: var(--background);
      }
    }
    text {
      fill: var(--edges-label);
    }
  }
}
</style>
