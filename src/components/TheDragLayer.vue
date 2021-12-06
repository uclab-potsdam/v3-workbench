<template>
  <div class="the-drag-layer" ref="layer">
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
// import { toPng } from 'html-to-image'

export default {
  name: 'TheDragLayer',
  data () {
    return {
      clone: null,
      shadow: 10
    }
  },
  mounted () {
  },
  computed: {
    ...mapGetters('dragdrop', [
      'position'
    ]),
    ...mapState('dragdrop', [
      'el', 'x', 'y'
    ]),
    ...mapState('view', [
      'zoom'
    ])
  },
  methods: {
    setPosition () {
      if (this.clone == null) return
      this.clone.style.transform = `translate(${this.position.x}px, ${this.position.y}px) scale(${this.zoom}) `
    }
  },
  watch: {
    el (el) {
      // console.log(el)
      if (this.clone != null) {
        this.clone.remove()
      }
      if (el != null) {
        this.clone = el.cloneNode(true)
        // this.image = toPng(el, { backgroundColor: 'var(--teal-3)' })
        //   .then(function (dataUrl) {
        //     var img = new Image()
        //     img.src = dataUrl
        //     document.body.appendChild(img)
        //   })
        //   .catch(function (error) {
        //     console.error('oops, something went wrong!', error)
        //   })
        this.setPosition()
        this.$refs.layer.appendChild(this.clone)
      }
    },
    position () {
      this.setPosition()
    }
  }
}
</script>

<style scoped lang="scss">
.the-drag-layer {
  z-index: 20;
  overflow: hidden;
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  :deep(.card) {
    box-shadow: var(--base-shadow-l);
  }
}
</style>
