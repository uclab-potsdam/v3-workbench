<template>
  <div class="container" v-resize="s => size = s" ref="container" v-drop="{filter: ['move-card']}" @dropped="onDrop">
    <svg width="100%" height="100%">
      <defs>
        <pattern id="bg" v-bind="pattern" patternUnits="userSpaceOnUse">
          <!-- <path class="cross" d="M-4,-4L4,4M-4,4L4,-4" :transform="`translate(${pattern.width / 2} ${pattern.height / 2})`"/> -->
          <circle class="point" r="0.75" :transform="`translate(${pattern.width / 2} ${pattern.height / 2})`"/>
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)"></rect>
      <g :transform="transform">
        <CanvasEdge
          v-for="edge in edges"
          :key="`${edge.source}/${edge.target}/${edge.prop}`"
          v-bind="edge"
          :stroke-width="1 / transform.k" />
        <!-- <CanvasEdge
          v-if="tempEdge"
          v-bind="tempEdge"
          :stroke-width="1 / transform.k" /> -->
      </g>
    </svg>
    <div class="cards" :style="{transform: transformString}">
      <BaseCard
        v-for="card in cards"
        :key="card._id"
        :_id="card.represents"
        :card-id="card._id"
        :collapsed="card.collapsed"
        :allow-drop="drag?.options?.mode === 'connect'"
        :style="{transform: `translate(${card.x}px, ${card.y}px)`}"
        :scale="transform.k"
        v-bind="getEntity(card.represents)"
        @toggleCollapse="toggleCollapse(card._id)"
        @drag="onDrag"
        @addProp="onAddProp"
        @removeProp="onRemoveProp"
        @scroll="onScroll($event, card._id)"/>
    </div>
    <div class="notifications">
      <div class="drag-options" v-if="drag?.options?.mode === 'move'" >
        <!-- <div class="remove" v-drop="{dropEffect: 'move', handler: onRemoveCard}">
          remove card
        </div>
        <div class="delete danger" v-drop="{dropEffect: 'move', handler: onDeleteEntity}">
          delete entity
        </div> -->
      </div>
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
import drop from '@/assets/js/directives/drop'
import BaseCard from '@/components/BaseCard.vue'
import CanvasControls from '@/components/CanvasControls.vue'
import CanvasEdge from '@/components/CanvasEdge.vue'

export default {
  name: 'CanvasContainer',
  directives: {
    drop
  },
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
      cardWidth: 180,
      cardHeight: 360,
      safeArea: [82, 20, 20, 20],
      transition: 400,
      container: null,
      drag: null
      // tempEdge: null
    }
  },
  mounted () {
    this.init(this.$route.params.id)
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
    ...mapGetters('data', [
      'getEntity'
    ]),
    pattern () {
      if (this.transform == null) return
      const scale = this.transform.k
      return {
        width: 60 * scale,
        height: 60 * scale,
        x: this.transform.x,
        y: this.transform.y
      }
    },
    transformString () {
      const { x, y, k } = this.transform
      return `translate(${x}px, ${y}px) scale(${k})`
    },
    boundingRect () {
      const x = this.cards.map(card => card.x)
      const y = this.cards.map(card => card.y)
      return [
        [Math.min(...x), Math.min(...y)],
        [Math.max(...x) + this.cardWidth, Math.max(...y) + this.cardHeight]
      ]
    }
  },
  methods: {
    ...mapActions('view', [
      'toggleCollapse',
      'translateCard',
      'dropCard',
      'removeCard',
      'init',
      'setZoom',
      'setCardScroll'
    ]),
    ...mapActions('data', [
      'addProp',
      'removeProp'
    ]),
    ...mapActions('api', [
      'deleteObject'
    ]),
    initZoom () {
      this.zoom = zoom()
        .scaleExtent(this.scaleExtent)
        .on('zoom', e => { this.transform = e.transform })
        .filter(e => {
          if (e.type === 'touchstart' && e.touches?.length === 1) return false
          if (e.type === 'mousedown' && e.target.getAttribute('draggable')) return false
          return !e.button && !(e.type === 'wheel' && !e.ctrlKey && !e.shiftKey)
        })
      this.container.call(this.zoom).on('dblclick.zoom', null)
    },
    zoomIn () {
      this.container.transition().duration(this.transition).call(this.zoom.scaleBy, 2)
    },
    zoomOut () {
      this.container.transition().duration(this.transition).call(this.zoom.scaleBy, 0.5)
    },
    zoomToFit () {
      const { boundingRect, size, safeArea, transition, scaleExtent } = this
      const center = [
        (boundingRect[0][0] + boundingRect[1][0]) / 2,
        (boundingRect[0][1] + boundingRect[1][1]) / 2
      ]
      const dims = [
        (boundingRect[1][0] - boundingRect[0][0]),
        (boundingRect[1][1] - boundingRect[0][1])
      ]
      const safeHeight = size.height - safeArea[0] - safeArea[2]
      const safeWidth = size.width - safeArea[1] - safeArea[3]
      const scale = Math.max(Math.min(safeWidth / dims[0], safeHeight / dims[1], scaleExtent[1]), scaleExtent[0])
      this.container.transition().duration(transition).call(
        this.zoom.transform,
        zoomIdentity
          .translate(safeWidth / 2 + safeArea[3], safeHeight / 2 + safeArea[0])
          .scale(scale)
          .translate(-center[0], -center[1])
      )
    },
    onDrag (e) {
      this.drag = e
      // this.translateCard({
      //   id: e.id,
      //   x: e.x / this.transform.k,
      //   y: e.y / this.transform.k
      // })
    },
    onDrop (e) {
      e.stopPropagation()
      const { detail } = e
      this.dropCard({
        represents: detail.data._id,
        x: (detail.x - this.transform.x) / this.transform.k,
        y: (detail.y - this.transform.y) / this.transform.k,
        collapsed: false
      })
    },
    onRemoveCard (e) {
      this.drag = null
      // find a card with matching ids
      // console.log(e, this.cards)
      // console.log(this.cards.find(c => c.represents === e._id))
      this.removeCard(this.cards.find(c => c.represents === e._id)._id)
    },
    onDeleteEntity (e) {
      this.drag = null
      // find a card with matching ids
      this.removeCard(this.cards.find(c => c.represents === e._id)._id)
      this.deleteObject(e._id)
    },
    onAddProp (e) {
      if (this.drag?.options?.mode !== 'connect') return
      const doc = this.drag.options.doc
      const prop = this.drag.options.prop
      const value = e.options?.value
      this.addProp([doc, prop, value])
    },
    onRemoveProp (e) {
      // console.log([e.doc, e.prop, e.value])
      this.removeProp(e)
    },
    onScroll (e, _id) {
      this.setCardScroll({ _id, value: e.target.scrollTop })
    }
    // onSetTempEdge (e) {
    //   this.tempEdge = {
    //     x1: e.x0,
    //     y1: e.y0,
    //     x2: e.x,
    //     y2: e.y
    //   }
    // },
    // onClearTempEdge (e) {
    //   // this.tempEdge = null
    // }
  },
  watch: {
    'transform.k' (zoom) {
      this.setZoom(zoom)
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
      .point {
        fill: var(--border);
      }
    }
  }

  .cards {
    position: absolute;
    transform-origin: top left;
    top: 0;
    width: 100%;
    height: 100%;

    :deep(.card) {
      position: absolute;
    }
  }

  .notifications {
    position: absolute;
    bottom: 0;
    width: 100%;
    margin: 0 0 var(--spacing) 0;
    padding: 0 var(--spacing);
    pointer-events: none;
    display: flex;
    justify-content: center;

    .drag-options {
      display: flex;
      justify-content: center;
      & > div {
        pointer-events: all;
        padding: var(--spacing);
        background: var(--background);
        border: var(--base-border);
        border-radius: var(--base-border-radius);
        box-shadow: var(--base-box-shadow);
        transition:
          transform var(--transition),
          background var(--transition),
          color var(--transition);

        &.danger {
          color: var(--danger);
        }

        &.drag-over {
          background: var(--accent);
          transform: scale(1.1);
          color: var(--background);

          &.danger {
            background: var(--danger);
          }
        }

        & + div {
          margin-left: var(--spacing);
        }
      }
    }
  }
}
</style>
