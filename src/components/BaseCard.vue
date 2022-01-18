<template>
  <div class="card"
    :class="{ collapsed, 'context-search': context === 'search' }" :style="{...colors, transform}"
    v-drop="{
      filter: ['connect'],
      obj: _id,
    }"
    v-drag="{
      mode: 'move-card',
      trigger: '.drag-trigger',
      data: { _id, offset: true }
    }"
    @dropped="onDrop">
    <CardHeader :label="label" :doctype="doctype?.label" @click="$emit('toggleCollapse')"/>
    <main v-if="!collapsed">
      <card-cover v-if="cover" :path="cover"/>
      <template v-for="(prop, i) in properties" :key="i">
        <card-property :prop="prop" :entity="_id"/>
      </template>
    </main>
    <card-footer v-if="!collapsed && context !== 'search'">
       <icon @click="onRemoveCard" scale="1" data="@icon/remove.svg"/>
    </card-footer>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import drag from '@/assets/js/directives/drag'
import drop from '@/assets/js/directives/drop'
import CardHeader from './CardHeader.vue'
import CardFooter from './CardFooter.vue'
import CardProperty from './CardProperty.vue'
import CardCover from './CardCover.vue'
export default {
  components: { CardHeader, CardFooter, CardProperty, CardCover },
  name: 'BaseCard',
  directives: {
    drag,
    drop
  },
  emits: ['drag', 'toggleCollapse', 'removeProp', 'setTempEdge', 'clearTempEdge'],
  props: {
    _id: String,
    label: String,
    doctype: Object,
    properties: Object,
    cover: String,
    cardId: String,
    collapsed: Boolean,
    pane: String,
    context: String,
    scale: Number,
    allowDrop: Boolean,
    transform: String
  },
  data () {
    return {
      widthLabel: 0,
      widthCard: 0,
      isCollapsed: true,
      hover: false,
      dragActive: false
    }
  },
  computed: {
    ...mapState('config', ['fileServer']),
    ...mapGetters('data', ['getType', 'getEntity', 'getLabel']),
    colors () {
      if (this.doctype?.background == null) return
      const { background, text } = this.doctype
      return {
        '--primary': `var(--${text}-9)`,
        '--secondary': `var(--${background}-2)`
      }
    }
  },
  methods: {
    ...mapActions('data', ['addProp']),
    ...mapActions('view', ['removeCard']),
    onDrop ({ detail }) {
      this.addProp([detail.data.sub, detail.data.prop, detail.obj])
    },
    onRemoveCard () {
      this.removeCard(this.cardId)
    }
  }
}
</script>

<style scoped lang="scss">
// .svg-icon {
//   color: var(--secondary);
// }
.card {
  transform-origin: top left;
  background: rgb(var(--secondary));
  color: rgb(var(--primary));
  @media (prefers-color-scheme: dark) {
    background: rgb(var(--primary));
    color: rgb(var(--secondary));
  }
  width: var(--card-width);
  overflow-x: hidden;
  overflow-y: auto;
  // display: flex;
  // flex-direction: column;
  // justify-content: space-between;
  &:hover {
    z-index: 1;
  }

  // hide scrollbars
  &::-webkit-scrollbar { width: 0 !important }
  scrollbar-width: none;

  height: var(--card-height);

  &.context-search {
    height: calc(var(--card-height) - var(--card-footer-height));
    overflow-y: hidden;
  }

  &.collapsed {
    height: var(--card-header-height);
  }

  header {
    display: flex;
    flex-direction: column;
    padding: var(--spacing);
    justify-content: center;
    justify-content: center;
    height: var(--card-header-height);
    position: sticky;
    top: 0;
    white-space: nowrap;
    overflow: hidden;
    z-index: 1;
  }

  main {
    min-height: var(--card-main-height);
    padding: 0 var(--spacing);

    section + section {
      margin-top: var(--spacing);
    }
  }
}
</style>
