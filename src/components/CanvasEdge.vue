<template>
  <g class="edge">
    <path class="shadow" :d="path" :stroke-width="10"
      @mouseenter="showLabel = true" @mouseleave="showLabel = false"/>
    <!-- <path :d="path" :stroke-width="strokeWidth * 15"/> -->
    <path class="outline" :d="path" :stroke-width="12"/>
    <path :d="path" :stroke-width="10"/>
    <!-- <text v-if="showLabel">
      <textPath class="shadow" :path="path" startOffset="50%" dominant-baseline="middle" :stroke-width="strokeWidth * 4">
        {{ label }}
      </textPath>
      <textPath :path="path" startOffset="50%" dominant-baseline="middle">
        {{ label }}
      </textPath>
    </text> -->
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
    strokeWidth: Number
  },
  data () {
    return {
      showLabel: false
    }
  },
  computed: {
    path () {
      const x1 = this.x1 + 180
      const y1 = this.y1
      const x2 = this.x2
      const y2 = this.y2
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
    stroke: var(--edges);
    fill: none;
    &.outline {
      stroke: var(--background);
      // pointer-events: all;
    }
  }
  text {
    text-anchor: middle;

    .shadow {
      stroke: white;
    }
  }
}
</style>
