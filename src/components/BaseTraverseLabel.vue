<template>
  <component :is="root" class="traverse-label" ref="root"
    :style="{'--transition': transition, '--offset': offset}">
    <span ref="label">
      <slot/>
    </span>
  </component>
</template>

<script>
export default {
  name: 'BaseCard',
  props: {
    root: {
      type: String,
      default: 'div'
    },
    label: {
      type: String,
      default: 'div'
    }
  },
  data () {
    return {
      offset: '0px',
      transition: '0s'
    }
  },
  methods: {
    init () {
      const outer = this.$refs.root.getBoundingClientRect().width
      const inner = this.$refs.label.getBoundingClientRect().width
      const offset = Math.min(outer - inner, 0)
      this.offset = `${offset}px`
      this.transition = `${offset / -35}s`
    }
  },
  mounted () {
    this.init()
  },
  updated () {
    this.init()
  }
}
</script>

<style scoped lang="scss">
.traverse-label {
  transform: translateX(0);
  &:hover {
    animation-name: traverse, wait;
    animation-duration: var(--transition), 1s;
    animation-delay: 0ms, var(--transition);
    animation-timing-function: linear;
  }

  @keyframes traverse {
    100% {
      transform: translateX(var(--offset));
    }
  }
  @keyframes wait {
    0% {
      transform: translateX(var(--offset));
    }
    100% {
      transform: translateX(var(--offset));
    }
  }
}
</style>
<style lang="scss">
.traverse-label-trigger:hover .traverse-label {
  animation-name: traverse, wait;
  animation-duration: var(--transition), 1s;
  animation-delay: 0ms, var(--transition);
  animation-timing-function: linear;
  @keyframes traverse {
    100% {
      transform: translateX(var(--offset));
    }
  }
  @keyframes wait {
    0% {
      transform: translateX(var(--offset));
    }
    100% {
      transform: translateX(var(--offset));
    }
  }
}
</style>
